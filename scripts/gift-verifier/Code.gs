// Standalone Google-hosted verifier, pinned to one spreadsheet.
// Publishes the approved public feed and replaces failed products only from an approved reserve.
const CMB = Object.freeze({
  spreadsheetId: '1nTrzLmCH7chbSbhi_SAQx2tP8i2sNFckIWzGLkL3Esw',
  masterSheetId: 825244673,
  version: '1.3.0', batchSize: 6, maxRows: 1000,
  hosts: ['www.waterstones.com', 'www.notonthehighstreet.com', 'www.johnlewis.com', 'thelittlebotanical.com', 'www.dunelm.com', 'utilitynestpro.etsy.com', 'www.etsy.com'],
  current: 'CMB Verification', history: 'CMB History', runs: 'CMB Runs', guide: 'CMB Instructions', website: 'CMB Website Feed', reserve: 'CMB Replacement Pool', replacements: 'CMB Replacements'
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
    run = decodeRun_(raw); delete run.replacementAttempted; ensureSheets_();
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
      if (fresh && fresh.product_url === row.product_url && observation.status !== 'master-changed') {
        const replacement = tryReplace_(fresh, observation, run);
        if (replacement) { Object.assign(row, replacement.master); observation = replacement.observation; }
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

function encodeRun_(run) {
  const compact=run.ids.every(id=>/^CMB-GIFT-\d{4}$/.test(id));
  return JSON.stringify({...run,compactIds:compact,ids:run.ids.map(id=>compact?id.slice(9):id).join('|')});
}
function decodeRun_(raw) { const run=JSON.parse(raw); if(typeof run.ids==='string')run.ids=run.ids?run.ids.split('|'):[]; if(run.compactIds)run.ids=run.ids.map(id=>'CMB-GIFT-'+id); delete run.compactIds; return run; }

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
  if(isUtilityNest_(row)) {
    const source=String(row.source_url||'');
    if(!source.startsWith('https://www.etsy.com/uk/listing/') || listingId_(source)!==listingId_(url))return fail('identity-mismatch','','Owned listing source does not match its Share & Save URL');
    url=source;
  }
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
    return {...applyMasterContext_(isUtilityNest_(row)?parseUtilityNest_(html,row):parseProduct_(html,row.product_url,row.product_name),row),http:code};
  }
  return fail('redirect-error','','Too many redirects');
}

function listingId_(url) {return (String(url).match(/\/listing\/(\d+)(?:\/|$)/)||[])[1]||'';}
function isUtilityNest_(row) {return /^https:\/\/utilitynestpro\.etsy\.com\/uk\/listing\/\d+\//.test(String(row.product_url));}
function parseUtilityNest_(html,row) {
  const fail=reason=>({status:'variant-review',stock:'unknown',reasons:[reason],evidence:''});
  if(!listingId_(row.product_url)||!html.includes(listingId_(row.product_url))||!/UtilityNestPro/i.test(html))return fail('Owned Etsy listing identity not confirmed');
  // A minimum AggregateOffer is insufficient. Require the explicit Clip Only option and a matching in-stock Product.
  const canonical=(html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)||[])[1];
  const identity=canonical&&listingId_(canonical)===listingId_(row.product_url)?canonical:row.source_url;
  const base=parseProduct_(html,identity,row.product_name);
  if(base.stock!=='in-stock'||!base.image||base.currency!=='GBP')return fail('Etsy stock, GBP currency or product image not confirmed');
  const options=[...html.matchAll(/<option\b[^>]*>([\s\S]*?)<\/option>/gi)].map(m=>text_(m[1]));
  const prices=options.map(t=>t.match(/^Clip Only\s*\(£(\d+\.\d{2})\)$/i)).filter(Boolean).map(m=>Number(m[1]));
  if(prices.length!==1||!Number.isFinite(prices[0])||prices[0]<=0)return fail('Exact Clip Only option price not available; do not infer from a starting price');
  return {...base,status:'verified',price:prices[0],isFrom:'no',reasons:[],evidence:JSON.stringify({method:'Matched Etsy Product plus explicit Clip Only GBP option',listing:listingId_(row.product_url),price:prices[0],stock:base.stock})};
}
// Read-only smoke check; never changes approved rows or pretends a blocked fetch succeeded.
function testUtilityNestFetch() {
  const row=readMaster_().find(isUtilityNest_);
  if(!row)throw Error('No UtilityNestPro row exists');
  console.log(JSON.stringify(scrapeProduct_(row)));

}

// Explicit owner-shop refresh uses the same scraper and freshness rules as the daily cycle.
function verifyUtilityNestProducts() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw Error('Verifier busy; retry shortly.');
  try {
    const rows=readMaster_().filter(isUtilityNest_);
    const run={id:Utilities.getUuid(),started:new Date().toISOString(),ids:rows.map(r=>r.gift_id),cursor:0};
    let verified=0;
    for(const row of rows){
      let o;try{o=scrapeProduct_(row);}catch(e){o={status:'fetch-error',reasons:['Owned listing fetch failed; no guessed values'],evidence:''};}
      const fresh=readMaster_().find(r=>r.gift_id===row.gift_id);
      if(!fresh||fresh.product_url!==row.product_url)continue;
      saveObservation_(fresh,o,run);run.cursor++;
      if(o.status==='verified')verified++;
      console.log(JSON.stringify({id:row.gift_id,status:o.status,price:o.price,stock:o.stock}));
      Utilities.sleep(1200);
    }
    syncWebsiteFeed_();writeRun_(run,'complete',verified+' of '+rows.length+' owned listings freshly verified');
    console.log('UtilityNestPro refresh: '+verified+' / '+rows.length+' verified.');
  } finally {lock.releaseLock();}
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
  const firstImage=Array.isArray(p.image)?p.image[0]:p.image;
  const image=typeof firstImage==='string'?firstImage:firstImage?.url||firstImage?.contentURL;
  const safeImage=typeof image==='string'&&/^https:\/\//i.test(image)?image:'';
  if(!safeImage)reasons.push('Image URL not found');
  return {status:reasons.length?'partial':'verified',name:text_(p.name),price:goodPrice?price:undefined,currency:o.currency,isFrom:o.isFrom?'yes':'no',stock,image:safeImage,
    evidence:JSON.stringify({method:'JSON-LD matched Product',product_url:p.url||p['@id']||'',offer_price:o.raw,currency:o.currency,availability:o.stock}).slice(0,2000),reasons};
}


const WEBSITE_HEADERS=['id','title','price','shop','tags','url','image','description','deliveryNote','categories','interests','priceCheckedAt'];
const REPLACEMENT_HEADERS=['replaced_at_utc','gift_id','old_product_url','new_product_url','failure_reason','old_master_json','reserve_id','policy_version'];
function replacementCeiling_(m) {
  const ceilings={'under-10':10,'under-20':20,'under-30':30,'under-50':50};
  if (ceilings[m.budget_band]) return ceilings[m.budget_band];
  const price=Number(m.observed_price_gbp);
  return price>0&&price<50 ? [10,20,30,50].find(p=>price<p) : 50;
}
function replacementEligible_(m, usedUrls, ceiling) {
  const price=Number(m.observed_price_gbp);
  return m.publication_status==='reserve'&&m.approval_status==='approved'&&!!m.approved_by&&!!m.approved_date
    &&String(m.short_description||'').trim().length>=40&&!!String(m.description_basis||'').trim()
    &&!!m.categories&&!!m.recipient_interests&&!!m.safety_notes
    &&price>0&&price<ceiling&&!usedUrls.has(normalUrl_(m.product_url));
}
function replacementFailure_(o) {
  // Timeouts/rate limiting are transient: require failure in two separate daily cycles.
  const confirmed=['robots-unavailable','robots-disallowed','missing-page','identity-mismatch','variant-review','unverified','partial'];
  return confirmed.includes(o.status)||['out-of-stock','discontinued'].includes(o.stock)
    ||(o.status==='blocked'&&Number(o.http)!==429);
}
function tryReplace_(master,o,run) {
  // Owned shop designs must remain their own rows; failed checks hide them, never substitute another seller.
  if(isUtilityNest_(master))return null;
  if (master.publication_status!=='published'||master.approval_status!=='approved') return null;
  const props=PropertiesService.getScriptProperties(),key='CMB_FAILED_'+master.gift_id;
  if(o.status==='verified'&&o.stock==='in-stock'&&o.isFrom==='no'){props.deleteProperty(key);return null;}
  const previous=props.getProperty(key),day=run.started.slice(0,10);
  if(!replacementFailure_(o)) {
    if(!['fetch-timeout','host-timeout','fetch-error','http-error','blocked'].includes(o.status))return null;
    if(!previous){props.setProperty(key,day);return null;}
    if(previous===day)return null;
  }
  const ss=book_(),reserve=ss.getSheetByName(CMB.reserve);if(!reserve)return null;
  const grid=reserve.getDataRange().getValues(),headers=grid.shift().map(String);
  const mainSheet=ss.getSheets().find(s=>s.getSheetId()===CMB.masterSheetId);
  const mainHeaders=mainSheet.getRange(1,1,1,headers.length).getValues()[0].map(String);
  if(JSON.stringify(headers)!==JSON.stringify(mainHeaders))throw Error('Reserve schema differs from master');
  const live=readMaster_(),current=live.find(m=>m.gift_id===master.gift_id);
  if(!current||current.product_url!==master.product_url||current.approval_status!=='approved'||current.publication_status!=='published')return null;
  const used=new Set(live.map(m=>normalUrl_(m.product_url))),ceiling=replacementCeiling_(current);
  const interests=String(current.recipient_interests||'').split(';');
  const candidates=grid.map((values,index)=>({index,master:Object.fromEntries(headers.map((h,i)=>[h,values[i]??'']))}))
    .filter(c=>replacementEligible_(c.master,used,ceiling))
    .sort((a,b)=>score(b.master)-score(a.master));
  function score(m){return (m.primary_category===current.primary_category?100:0)+String(m.recipient_interests).split(';').filter(i=>interests.includes(i)).length*10;}
  // One candidate per worker batch: retailer failure cannot cause a request burst.
  const candidate=candidates[0];if(!candidate||run.replacementAttempted)return null;
  run.replacementAttempted=true;
  function flagReserve() {
    const freshValues=reserve.getRange(candidate.index+2,1,1,headers.length).getValues()[0];
    if(JSON.stringify(freshValues)===JSON.stringify(grid[candidate.index]))reserve.getRange(candidate.index+2,headers.indexOf('publication_status')+1).setValues([['needs-review']]);
  }
  let checked;try{checked=scrapeProduct_(candidate.master);}catch(e){flagReserve();return null;}
  if(checked.status!=='verified'||checked.stock!=='in-stock'||checked.isFrom!=='no'||checked.currency!=='GBP'||!(checked.price>0&&checked.price<ceiling)) {
    flagReserve();return null;
  }
  // Re-read both records after I/O. A user's changed description/approval must not be overwritten.
  const latest=readMaster_().find(m=>m.gift_id===master.gift_id);
  const poolValues=reserve.getRange(candidate.index+2,1,1,headers.length).getValues()[0];
  if(JSON.stringify(latest)!==JSON.stringify(current)||JSON.stringify(poolValues)!==JSON.stringify(grid[candidate.index]))return null;
  const band=checked.price<10?'under-10':checked.price<20?'under-20':checked.price<30?'under-30':'under-50';
  const categories=String(candidate.master.categories).split(';').filter(c=>!/^under-\d+$/.test(c));categories.push(band);
  const replacement={...candidate.master,gift_id:current.gift_id,publication_status:'published',observed_price_gbp:checked.price,budget_band:band,categories:categories.join(';'),
    primary_category:/^under-\d+$/.test(String(candidate.master.primary_category))?band:candidate.master.primary_category,
    estimated_price_min_gbp:checked.price,estimated_price_max_gbp:checked.price,date_checked:day,source_checked_date:day,last_updated:day,
    checked_by:'Daily verifier; owner-authorised replacement policy. Fresh exact GBP price and stock check.'};
  const log=managedSheet_(CMB.replacements,REPLACEMENT_HEADERS);
  log.appendRow([new Date().toISOString(),current.gift_id,current.product_url,replacement.product_url,o.status,
    JSON.stringify(current),candidate.master.gift_id,CMB.version].map(safeCell_));
  const row=mainSheet.getDataRange().getValues().findIndex((r,i)=>i>0&&String(r[0])===current.gift_id)+1;
  if(row<2)throw Error('Replacement slot disappeared');
  mainSheet.getRange(row,1,1,headers.length).setValues([headers.map(h=>safeCell_(replacement[h]))]);
  // Replace any old explicit hyperlink target together with the new product value.
  ['product_url','source_url','image_url'].forEach(h=>{
    const value=String(replacement[h]||''),column=headers.indexOf(h)+1;
    if(column>0&&/^https:\/\//.test(value))mainSheet.getRange(row,column).setRichTextValue(SpreadsheetApp.newRichTextValue().setText(value).setLinkUrl(value).build());
  });
  reserve.getRange(candidate.index+2,headers.indexOf('publication_status')+1).setValues([['used']]);
  props.deleteProperty(key);
  return {master:replacement,observation:checked};
}
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
    if(!title||!description||!String(m.description_basis||'').trim()||!m.retailer)return [];
    // Display the owner's approved master image. Permission evidence remains a separate record.
    const image=m.image_approved==='yes'&&/^https:\/\//.test(String(m.image_url))?m.image_url:'';
    // Affiliate links will be added through a separate reviewed integration. Direct links are used for now.
    return [[m.gift_id,title,Math.round(o[6]*100),m.retailer,m.editorial_tags||'',m.product_url,image,description,
      isUtilityNest_(m)?'Clip only. Gift box costs extra; confirm personalisation, delivery and total on Etsy.':'Delivery extra. Check the retailer for current prices and charges.',m.categories||m.primary_category||'',m.recipient_interests||'',new Date(checked).toISOString()]];
  });
}
function syncWebsiteFeed_() {
  const sheet=managedSheet_(CMB.website,WEBSITE_HEADERS);
  const rows=websiteRows_(readMaster_(),managedSheet_(CMB.current,CMB_HEADERS).getDataRange().getValues().slice(1),Date.now());
  // One values write avoids exposing an empty intermediate feed while Google republishes.
  const height=Math.max(rows.length,sheet.getLastRow()-1);
  if(height)sheet.getRange(2,1,height,WEBSITE_HEADERS.length).setValues(Array.from({length:height},(_,i)=>
    i<rows.length?rows[i].map(safeCell_):WEBSITE_HEADERS.map(()=>''))).setWrap(true).setVerticalAlignment('top');
}
function refreshWebsiteFeed() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))throw Error('Daily verifier is busy; retry the feed refresh shortly.');
  try {syncWebsiteFeed_();console.log('Approved website feed refreshed.');}
  finally {lock.releaseLock();}
}

// Verify newly added published rows without resetting the daily queue or its progress.
function verifyNewCatalogueProducts() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw Error('Daily verifier is busy; retry shortly.');
  try {
    ensureSheets_();
    const observations = managedSheet_(CMB.current, CMB_HEADERS).getDataRange().getValues().slice(1);
    const seen = new Set(observations.map(row => String(row[0]) + '|' + String(row[1])));
    const rows = readMaster_().filter(row => row.publication_status === 'published'
      && row.approval_status === 'approved' && !seen.has(row.gift_id + '|' + row.product_url)).slice(0, CMB.batchSize);
    const run = { id: Utilities.getUuid(), started: new Date().toISOString(), ids: rows.map(row => row.gift_id), cursor: 0 };
    for (const row of rows) {
      let observation;
      try { observation = scrapeProduct_(row); }
      catch (error) { observation = { status: 'fetch-error', reasons: ['New-product check failed; retry through the daily verifier'], evidence: '' }; }
      const fresh = readMaster_().find(item => item.gift_id === row.gift_id);
      if (!fresh || fresh.product_url !== row.product_url) continue;
      saveObservation_(fresh, observation, run);
      run.cursor++;
      Utilities.sleep(1200);
    }
    syncWebsiteFeed_();
    writeRun_(run, 'complete', 'New catalogue products attempted: ' + run.cursor + '. Failed checks remain hidden. Daily queue unchanged.');
    console.log('New catalogue products attempted: ' + run.cursor + '. Approved website feed refreshed.');
  } finally { lock.releaseLock(); }
}
