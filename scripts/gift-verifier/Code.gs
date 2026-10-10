// Standalone Google-hosted verifier, pinned to one spreadsheet.
// Publishes only the approved public product feed. No emails, secrets or affiliate changes.
const CMB = Object.freeze({
  spreadsheetId: '1nTrzLmCH7chbSbhi_SAQx2tP8i2sNFckIWzGLkL3Esw',
  masterSheetId: 825244673,
  version: '1.1.0', batchSize: 6, maxRows: 500,
  hosts: ['www.waterstones.com', 'www.notonthehighstreet.com', 'www.johnlewis.com', 'thelittlebotanical.com', 'www.dunelm.com'],
  current: 'CMB Verification', history: 'CMB History', runs: 'CMB Runs', guide: 'CMB Instructions', website: 'CMB Website Feed'
});
const CMB_HEADERS = ['gift_id','product_url','attempted_at_utc','status','http_status','scraped_name','scraped_price_gbp','price_is_from','stock','scraped_image_url','evidence','changes_from_master','review_reasons','last_verified_price_gbp','last_verified_price_at_utc','run_id','scraper_version'];

function installDailyVerification() {
  const lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    ensureSheets_(); readMaster_();
    const master=book_().getSheets().find(s=>s.getSheetId()===CMB.masterSheetId);
    if(master.getMaxRows()<CMB.maxRows+1)master.insertRowsAfter(master.getMaxRows(),CMB.maxRows+1-master.getMaxRows());
    const triggers = ScriptApp.getProjectTriggers();
    if (!triggers.some(t => t.getHandlerFunction() === 'dailyVerification')) {
      ScriptApp.newTrigger('dailyVerification').timeBased().everyDays(1).atHour(7).inTimezone('Europe/London').create();
    }
    if (!triggers.some(t => t.getHandlerFunction() === 'continueVerification')) {
      ScriptApp.newTrigger('continueVerification').timeBased().everyMinutes(10).create();
    }
  } finally { lock.releaseLock(); }
  syncWebsiteFeed_();
  dailyVerification();
}

function stopDailyVerification() {
  ScriptApp.getProjectTriggers().filter(t => ['dailyVerification','continueVerification'].includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));
  PropertiesService.getScriptProperties().deleteProperty('CMB_QUEUE');
}

function dailyVerification() {
  const lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return;
  try {
    ensureSheets_();
    const props = PropertiesService.getScriptProperties();
    // Resume an incomplete cycle rather than losing unfinished rows.
    if (!props.getProperty('CMB_QUEUE')) {
      const rows = readMaster_().filter(r => r.publication_status !== 'archived');
      const run = {id: Utilities.getUuid(), started: new Date().toISOString(), ids: rows.map(r => r.gift_id), cursor: 0};
      if (encodeRun_(run).length > 8000) throw Error('Queue exceeds property size limit');
      props.setProperty('CMB_QUEUE', encodeRun_(run));
      writeRun_(run, 'running', 'Daily verification queued');
    }
  } finally { lock.releaseLock(); }
  continueVerification();
}

function continueVerification() {
  const lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return;
  const props = PropertiesService.getScriptProperties();
  let run;
  try {
    const raw = props.getProperty('CMB_QUEUE'); if (!raw) { syncWebsiteFeed_(); return; }
    run = decodeRun_(raw); ensureSheets_();
    const liveRows = readMaster_();
    const byId = Object.fromEntries(liveRows.map(r => [r.gift_id,r]));
    const started=Date.now();
    const end = Math.min(run.cursor + CMB.batchSize, run.ids.length);
    for (; run.cursor < end; run.cursor++) {
      const id = run.ids[run.cursor], row = byId[id];
      if (!row || row.publication_status === 'archived') continue;
      if(Date.now()-started>180000)break;
      let observation;
      if(run.inflight===id) {
        // A prior execution ended during UrlFetchApp. Move past it instead of wedging the daily queue.
        observation={status:'fetch-timeout',reasons:['Previous fetch did not finish; retry next daily cycle'],evidence:''};
        try { props.setProperty('CMB_SLOW_HOST_'+parts_(row.product_url).host,run.started.slice(0,10)); } catch(e) {}
      } else {
        run.inflight=id; props.setProperty('CMB_QUEUE',encodeRun_(run));
        try {
          const host=parts_(row.product_url).host;
          observation=props.getProperty('CMB_SLOW_HOST_'+host)===run.started.slice(0,10)
            ? {status:'host-timeout',reasons:['Retailer timed out from Google earlier in this cycle; retry next daily cycle'],evidence:''}
            : scrapeProduct_(row);
        }
      catch (e) { observation = {status:'fetch-error', http:'', reasons:['Fetch failed; previous verified values retained'], evidence:''}; }
      }
      delete run.inflight;
      // Re-read the master after network I/O: do not attach a result to a changed URL.
      const fresh = readMaster_().find(r => r.gift_id === id);
      if (!fresh || fresh.product_url !== row.product_url) {
        observation = {status:'master-changed',http:'',reasons:['Product URL changed during fetch; check next cycle'],evidence:''};
        if (fresh) row.product_url = fresh.product_url;
      }
      saveObservation_(row, observation, run);
      // Checkpoint every row. Retried history writes are deduplicated by run+gift ID.
      props.setProperty('CMB_QUEUE', encodeRun_({...run, cursor: run.cursor + 1}));
      writeRun_({...run,cursor:run.cursor+1},'running','Batch in progress; continuation resumes automatically');
      Utilities.sleep(1200);
    }
    syncWebsiteFeed_();
    if (run.cursor >= run.ids.length) {
      writeRun_(run, 'complete', 'All queued gifts attempted. Inspect status and review_reasons for incomplete verification.');
      props.setProperty('CMB_LAST_COMPLETE', new Date().toISOString());
      props.deleteProperty('CMB_QUEUE');
    } else {
      props.setProperty('CMB_QUEUE', encodeRun_(run));
      writeRun_(run, 'running', 'Next batch resumes automatically');
    }
  } catch (e) {
    if (run) writeRun_(run, 'error', String(e.message).slice(0,300));
    throw e; // Google's trigger failure notifications remain available to the owner.
  } finally { lock.releaseLock(); }
}

function encodeRun_(run) { return JSON.stringify({...run, ids:run.ids.join('|')}); }
function decodeRun_(raw) { const run=JSON.parse(raw); if(typeof run.ids==='string')run.ids=run.ids?run.ids.split('|'):[]; return run; }

function book_() {
  const ss = SpreadsheetApp.openById(CMB.spreadsheetId);
  if (!ss || ss.getId() !== CMB.spreadsheetId) throw Error('Unexpected spreadsheet; refusing writes');
  return ss;
}
function readMaster_() {
  const sheet = book_().getSheets().find(s => s.getSheetId() === CMB.masterSheetId);
  if (!sheet || sheet.getLastRow() > CMB.maxRows + 1) throw Error('Master missing or row limit exceeded');
  const values = sheet.getDataRange().getValues(), headers = values.shift().map(String);
  if (new Set(headers).size !== headers.length) throw Error('Duplicate master headers');
  for (const h of ['gift_id','product_url','product_name','observed_price_gbp','publication_status','approval_status','image_approved']) {
    if (!headers.includes(h)) throw Error('Missing master column: '+h);
  }
  const rows = values.filter(v => v.some(x => x !== '')).map(v => Object.fromEntries(headers.map((h,i) => [h,v[i]])));
  const ids = rows.map(r => String(r.gift_id));
  if (ids.some(x => !x.trim() || x.includes('|')) || new Set(ids).size !== ids.length) throw Error('Missing or duplicate gift IDs');
  rows.forEach(r => {r.gift_id=String(r.gift_id);r.product_url=String(r.product_url);});
  return rows;
}
function managedSheet_(name, headers) {
  const ss=book_(); let sheet=ss.getSheetByName(name);
  if (!sheet) {
    sheet=ss.insertSheet(name);
    sheet.getRange(1,1,1,headers.length).setValues([headers]);
    sheet.setFrozenRows(1); sheet.setHiddenGridlines(true);
    sheet.getRange(1,1,1,headers.length).setBackground('#eeeeee').setFontColor('#000000').setFontWeight('bold');
    sheet.setColumnWidths(1,headers.length,170); sheet.setColumnWidth(1,155);
  } else if (JSON.stringify(sheet.getRange(1,1,1,headers.length).getValues()[0]) !== JSON.stringify(headers)) {
    throw Error('Unexpected managed-sheet headers: '+name);
  }
  if (sheet.getMaxRows() < CMB.maxRows+1) sheet.insertRowsAfter(sheet.getMaxRows(), CMB.maxRows+1-sheet.getMaxRows());
  return sheet;
}
function ensureSheets_() {
  managedSheet_(CMB.current,CMB_HEADERS); managedSheet_(CMB.history,CMB_HEADERS);
  managedSheet_(CMB.runs,['run_id','started_at_utc','updated_at_utc','status','attempted','queued','note','version']);
  const ss=book_();
  if (!ss.getSheetByName(CMB.guide)) {
    const s=ss.insertSheet(CMB.guide);
    const notes=[['CheckMyBasket daily gift verification'],
      ['Master: edit the original catalogue tab. The scraper never changes approvals, copy or affiliate links.'],
      ['Schedule: daily around 07:00 Europe/London, with batches continuing every 10 minutes. Laptop can be closed.'],
      ['CMB Verification: current attempt per gift ID, observed facts, differences and review reasons.'],
      ['CMB History: one observation per gift per cycle. No silent replacement of prior checks.'],
      ['CMB Runs: running/complete/error and counts. Complete means attempted, not all facts verified.'],
      ['Images are discovered only. Copyright permission and image approval still require evidence.'],
      ['Blocked, robots-disallowed, uncertain or variant data is flagged; last verified price stays separate.'],
      ['Delivery charges, product safety, dietary claims and personalisation details require separate review.'],
      ['Only five configured retailer hosts are fetched. New retailers need an adapter/allowlist review.'],
      ['Website feed: only published, approved gifts with fresh verified prices and in-stock status. Image permission is separate.'],
      ['Stop: run stopDailyVerification in Apps Script. Restart: installDailyVerification.'],
      ['Monitor CMB Runs. If updated_at is over 36 hours old, check Apps Script Executions and Triggers.'],
      ['History is retained until Sheets capacity is reached. Archive a copy periodically; no automatic deletion.']];
    s.getRange(1,1,notes.length,1).setValues(notes).setWrap(true).setVerticalAlignment('top');
    s.setColumnWidth(1,850); s.setRowHeights(1,notes.length,45);s.setHiddenGridlines(true);
  }
}
function safeCell_(value) {
  // Scraped data is untrusted. Prevent formula execution in Sheets.
  if (typeof value==='string' && /^[=+@-]/.test(value)) return "'"+value;
  return value===undefined || value===null ? '' : value;
}
function saveObservation_(master,o,run) {
  const current=managedSheet_(CMB.current,CMB_HEADERS), history=managedSheet_(CMB.history,CMB_HEADERS);
  const grid=current.getDataRange().getValues();
  let index=grid.findIndex((r,i)=>i>0 && r[0]===master.gift_id);
  const old=index>0?grid[index]:[], sameUrl=old[1]===master.product_url;
  let last=sameUrl?old[13]:'', lastAt=sameUrl?old[14]:'';
  if (o.price!==undefined && o.price!==null && o.currency==='GBP') {last=o.price;lastAt=new Date().toISOString();}
  const changes=[];
  const prior=Number(master.observed_price_gbp);
  if (o.price!==undefined && master.observed_price_gbp!=='' && Number.isFinite(prior) && prior!==o.price) changes.push('price '+prior+' -> '+o.price);
  if (o.stock && o.stock!=='unknown' && master.availability!==o.stock) changes.push('availability '+master.availability+' -> '+o.stock);
  if (o.image && master.image_url && master.image_url!==o.image) changes.push('image changed; permission not inferred');
  const reasons=(o.reasons||[]).slice();
  if (master.approval_status!=='approved') reasons.push('editorial approval pending');
  if (master.image_approved!=='yes') reasons.push('image approval pending');
  if (master.issues_for_approval) reasons.push('master has review notes');
  const values=[master.gift_id,master.product_url,new Date().toISOString(),o.status,o.http,o.name,o.price,o.isFrom,o.stock,o.image,o.evidence,changes.join('; '),reasons.join('; '),last,lastAt,run.id,CMB.version].map(safeCell_);
  if(index<1) index=current.getLastRow();
  current.getRange(index+1,1,1,values.length).setValues([values]).setWrap(true).setVerticalAlignment('top');
  current.setRowHeight(index+1,75);
  const historyStart=Math.max(2,history.getLastRow()-CMB.maxRows);
  const existing=history.getLastRow()>1?history.getRange(historyStart,1,history.getLastRow()-historyStart+1,CMB_HEADERS.length).getValues():[];
  if (!existing.some(r => r[0]===master.gift_id && r[15]===run.id)) history.appendRow(values);
}
function writeRun_(run,status,note) {
  const s=managedSheet_(CMB.runs,['run_id','started_at_utc','updated_at_utc','status','attempted','queued','note','version']);
  const values=s.getDataRange().getValues(); const i=values.findIndex((r,n)=>n>0 && r[0]===run.id);
  s.getRange(i>0?i+1:s.getLastRow()+1,1,1,8).setValues([[run.id,run.started,new Date().toISOString(),status,run.cursor,run.ids.length,safeCell_(note),CMB.version]]);
}

function parts_(url) {
  const m=/^https:\/\/([a-z0-9.-]+)(\/[^#]*)?(?:#.*)?$/i.exec(String(url));
  if (!m || !CMB.hosts.includes(m[1].toLowerCase())) throw Error('Unsupported or unsafe retailer URL');
  return {host:m[1].toLowerCase(),origin:'https://'+m[1].toLowerCase(),path:m[2]||'/'};
}
function normalUrl_(url) {return String(url||'').replace(/#.*$/,'').replace(/\?.*$/,'').replace(/\/$/,'').toLowerCase();}
function text_(s) {return String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' ').trim();}
function normalName_(s) {return text_(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function robotsAllowed_(body,path) {
  const groups=[];let g=null,hadRule=false;
  String(body).split(/\r?\n/).forEach(line=>{
    const m=/^\s*([a-z-]+)\s*:\s*(.*?)\s*$/i.exec(line.replace(/#.*$/,''));if(!m)return;
    const key=m[1].toLowerCase(),value=m[2];
    if(key==='user-agent') {if(!g||hadRule){g={agents:[],rules:[]};groups.push(g);hadRule=false;}g.agents.push(value.toLowerCase());}
    else if(g && ['allow','disallow'].includes(key)){g.rules.push({allow:key==='allow',path:value});hadRule=true;}
  });
  const specific=groups.filter(g=>g.agents.some(a=>a!=='*'&&'checkmybasketverifier'.includes(a)));
  const selected=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
  let best=null;
  selected.forEach(g=>g.rules.forEach(r=>{
    if(!r.path)return; const anchor=r.path.endsWith('$');
    const literal=anchor?r.path.slice(0,-1):r.path;
    const pattern=literal.split('*').map(p=>p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
    if(new RegExp('^'+pattern+(anchor?'$':'')).test(path)) {
      const len=literal.replace(/\*/g,'').length;
      if(!best||len>best.len||(len===best.len&&r.allow))best={len,allow:r.allow};
    }
  }));
  return !best||best.allow;
}
function rawFetch_(url) {
  return UrlFetchApp.fetch(url,{muteHttpExceptions:true,followRedirects:false,validateHttpsCertificates:true,
    headers:{'User-Agent':'CheckMyBasketVerifier/1.0 (+https://www.checkmybasket.co.uk/contact)','Accept':'text/html,application/ld+json'}});
}
function robotsStatus_(url) {
  const p=parts_(url),cache=CacheService.getScriptCache(),key='robots:'+p.host;
  let data=cache.get(key);
  if(!data){
    const response=rawFetch_(p.origin+'/robots.txt'),code=response.getResponseCode();
    data=JSON.stringify({code,body:response.getContentText().slice(0,200000)});cache.put(key,data,3600);
  }
  const r=JSON.parse(data);
  if(r.code===404)return 'allowed';
  if(r.code!==200 || !/user-agent\s*:/i.test(r.body))return 'robots-unavailable';
  return robotsAllowed_(r.body,p.path)?'allowed':'robots-disallowed';
}
function scrapeProduct_(row) {
  const fail=(status,http,reason)=>({status,http,reasons:[reason],evidence:''});
  let url=row.product_url;parts_(url);
  for(let n=0;n<4;n++) {
    const robots=robotsStatus_(url);if(robots!=='allowed')return fail(robots,'','Crawl policy does not permit this fetch');
    const response=rawFetch_(url),code=response.getResponseCode();
    if([301,302,303,307,308].includes(code)) {
      const h=response.getAllHeaders();const loc=h.Location||h.location;
      if(!loc)return fail('redirect-error',code,'Missing redirect target');
      url=String(loc).startsWith('/')?parts_(url).origin+loc:String(loc);parts_(url);continue;
    }
    if([401,403,429].includes(code))return fail('blocked',code,'Retailer blocked or rate limited the scraper');
    if([404,410].includes(code))return fail('missing-page',code,'Product page unavailable; do not infer stock');
    if(code!==200)return fail('http-error',code,'Retailer did not return a successful page');
    const html=response.getContentText();
    if(html.length>3000000)return fail('response-too-large',code,'Page exceeds parser size limit');
    return {...applyMasterContext_(parseProduct_(html,row.product_url,row.product_name),row),http:code};
  }
  return fail('redirect-error','','Too many redirects');
}
function applyMasterContext_(o,row) {
  if (o.price!==undefined && /\bfrom\b/i.test(String(row.price_notes||''))) {
    o.isFrom='yes';o.status='partial';
    o.reasons=(o.reasons||[]).concat('Master identifies a starting price; exact variant price not confirmed');
  }
  if (o.price!==undefined && /[?&](variant|size|colour|color)=/i.test(row.product_url)) {
    o.status='partial';o.reasons=(o.reasons||[]).concat('URL selects a variant; verify that the structured offer represents that option');
  }
  return o;
}
function parseProduct_(html,url,expectedName) {
  const nodes=[],errors=[];
  const walk=(v)=>{if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object'){nodes.push(v);if(v['@graph'])walk(v['@graph']);if(v.mainEntity)walk(v.mainEntity);}};
  const scripts=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;
  while((m=scripts.exec(html)))if(/type\s*=\s*["']application\/ld\+json["']/i.test(m[1])) {
    try {walk(JSON.parse(m[2].trim()));}catch(e){errors.push('Invalid JSON-LD block');}
  }
  const products=nodes.filter(n=>[].concat(n['@type']||[]).some(t=>/(^|\/)Product$/.test(t)));
  const matches=products.filter(p=>normalUrl_(p.url||p['@id'])===normalUrl_(url)||normalName_(p.name)===normalName_(expectedName));
  const candidates=matches.length?matches:products.length===1?products:[];
  if(candidates.length!==1)return {status:'unverified',stock:'unknown',reasons:['Missing or ambiguous product structured data'].concat(errors),evidence:''};
  const p=candidates[0];
  // Even a single Product must be grounded to this page by exact URL/name.
  if(!matches.length)return {status:'identity-mismatch',stock:'unknown',reasons:['Structured product identity does not match master name or fetched URL'],evidence:''};
  const offers=[].concat(p.offers||[]);
  if(!offers.length)return {status:'partial',name:text_(p.name),stock:'unknown',reasons:['No product offer found'],evidence:'JSON-LD Product'};
  const observations=offers.map(o=>({
    currency:String(o.priceCurrency||o.priceSpecification?.priceCurrency||''),
    raw:o.price??o.priceSpecification?.price??o.lowPrice,
    isFrom:o.lowPrice!==undefined || /AggregateOffer$/.test(String(o['@type'])),
    stock:String(o.availability||''),variant:o.url||''
  }));
  const distinct=new Set(observations.map(o=>JSON.stringify([o.raw,o.currency,o.stock,o.isFrom])));
  if(distinct.size!==1)return {status:'variant-review',name:text_(p.name),stock:'unknown',reasons:['Multiple offers differ; selected variant required'],evidence:'JSON-LD offers'};
  const o=observations[0],reasons=[];
  const valid=typeof o.raw==='number'||(typeof o.raw==='string'&&/^\d+(\.\d{1,2})?$/.test(o.raw));
  const price=Number(o.raw);
  const goodPrice=valid&&Number.isFinite(price)&&price>0&&o.currency==='GBP'&&Math.abs(price*100-Math.round(price*100))<0.00001;
  if(!goodPrice)reasons.push('Missing, invalid or non-GBP price');
  const stocks={InStock:'in-stock',OutOfStock:'out-of-stock',SoldOut:'out-of-stock',Discontinued:'discontinued',PreOrder:'preorder',BackOrder:'backorder',MadeToOrder:'made-to-order',LimitedAvailability:'limited-availability'};
  const stock=stocks[o.stock.split('/').pop()]||'unknown';if(stock==='unknown')reasons.push('Stock not stated in structured offer');
  if(o.isFrom)reasons.push('Starting price; selected variant requires review');
  const image=typeof p.image==='string'?p.image:Array.isArray(p.image)?p.image[0]:p.image?.url;
  const safeImage=typeof image==='string'&&/^https:\/\//i.test(image)?image:'';
  if(!safeImage)reasons.push('Image URL not found');
  return {status:reasons.length?'partial':'verified',name:text_(p.name),price:goodPrice?price:undefined,currency:o.currency,isFrom:o.isFrom?'yes':'no',stock,image:safeImage,
    evidence:JSON.stringify({method:'JSON-LD matched Product',product_url:p.url||p['@id']||'',offer_price:o.raw,currency:o.currency,availability:o.stock}).slice(0,2000),reasons};
}


const WEBSITE_HEADERS=['id','title','price','shop','tags','url','image','description','deliveryNote','categories','interests','priceCheckedAt'];
function websiteRows_(masters, observations, now) {
  const byId=Object.fromEntries(observations.map(r=>[r[0],r]));
  return masters.flatMap(m=>{
    const o=byId[m.gift_id],checked=o?new Date(o[2]).getTime():NaN;
    if(m.publication_status!=='published'||m.approval_status!=='approved'||!m.approved_by||!m.approved_date) return [];
    if(!o||o[1]!==m.product_url||o[3]!=='verified'||o[8]!=='in-stock'||o[7]!=='no')return [];
    if(!Number.isFinite(checked)||now-checked>36*3600000||checked>now+300000)return [];
    if(typeof o[6]!=='number'||o[6]<=0||Math.abs(o[6]*100-Math.round(o[6]*100))>0.00001)return [];
    try{parts_(m.product_url);}catch(e){return [];}
    const title=String(m.product_name||m.gift_name||'').trim(),description=String(m.short_description||'').trim();
    if(!title||!description||!m.retailer)return [];
    // Use the specifically approved master image, never a newly discovered image by inference.
    const image=m.image_approved==='yes'&&m.image_permission_evidence&&/^https:\/\//.test(String(m.image_url))?m.image_url:'';
    // Affiliate links will be added through a separate reviewed integration. Direct links are used for now.
    return [[m.gift_id,title,Math.round(o[6]*100),m.retailer,m.editorial_tags||'',m.product_url,image,description,
      'Delivery extra. Check the retailer for current prices and charges.',m.categories||m.primary_category||'',m.recipient_interests||'',new Date(checked).toISOString()]];
  });
}
function syncWebsiteFeed_() {
  const sheet=managedSheet_(CMB.website,WEBSITE_HEADERS);
  const rows=websiteRows_(readMaster_(),managedSheet_(CMB.current,CMB_HEADERS).getDataRange().getValues().slice(1),Date.now());
  const old=sheet.getLastRow();if(old>1)sheet.getRange(2,1,old-1,WEBSITE_HEADERS.length).clearContent();
  if(rows.length)sheet.getRange(2,1,rows.length,WEBSITE_HEADERS.length).setValues(rows.map(r=>r.map(safeCell_))).setWrap(true).setVerticalAlignment('top');
}
