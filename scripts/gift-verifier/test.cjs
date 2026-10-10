const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console});
vm.runInContext(fs.readFileSync(__dirname+'/Code.gs','utf8'),ctx);
const url='https://www.johnlewis.com/widget/p123';
const base={'@type':'Product',name:'Widget',url,image:'https://images.example/widget.jpg',offers:{'@type':'Offer',price:'19.99',priceCurrency:'GBP',availability:'https://schema.org/InStock'}};
const html=p=>`<script type="application/ld+json">${JSON.stringify(p)}</script>`;
const parse=p=>ctx.parseProduct_(html(p),url,'Widget');
let count=0;
function check(name,fn){fn();count++;console.log('PASS '+name);}
check('matched GBP product',()=>{const r=parse(base);assert.equal(r.price,19.99);assert.equal(r.stock,'in-stock');assert.equal(r.status,'verified');});
check('out of stock preserved',()=>assert.equal(parse({...base,offers:{...base.offers,availability:'https://schema.org/OutOfStock'}}).stock,'out-of-stock'));
check('aggregate is starting price',()=>{const r=parse({...base,offers:{'@type':'AggregateOffer',lowPrice:12,priceCurrency:'GBP'}});assert.equal(r.isFrom,'yes');assert.equal(r.status,'partial');});
check('different variant prices refused',()=>assert.equal(parse({...base,offers:[base.offers,{...base.offers,price:25}]}).status,'variant-review'));
check('non-GBP price refused',()=>assert.equal(parse({...base,offers:{...base.offers,priceCurrency:'USD'}}).price,undefined));
check('unknown currency refused',()=>assert.equal(parse({...base,offers:{price:5}}).price,undefined));
check('negative price refused',()=>assert.equal(parse({...base,offers:{...base.offers,price:-1}}).price,undefined));
check('malformed numeric refused',()=>assert.equal(parse({...base,offers:{...base.offers,price:'19.99 GBP'}}).price,undefined));
check('fractional penny refused',()=>assert.equal(parse({...base,offers:{...base.offers,price:19.999}}).price,undefined));
check('no structured data stays unknown',()=>assert.equal(ctx.parseProduct_('<h1>Widget £10</h1>',url,'Widget').status,'unverified'));
check('invalid JSON stays unknown',()=>assert.equal(ctx.parseProduct_('<script type="application/ld+json">{</script>',url,'Widget').status,'unverified'));
check('wrong product identity refused',()=>assert.equal(parse({...base,name:'Other',url:'https://www.johnlewis.com/other/p456'}).status,'identity-mismatch'));
check('recommendation products not mistaken',()=>assert.equal(ctx.parseProduct_(html([base,{...base,name:'Other',url:'https://www.johnlewis.com/other'}]),url,'Widget').price,19.99));
check('duplicate matching products refused',()=>assert.equal(parse([base,base]).status,'unverified'));
check('graph product supported',()=>assert.equal(parse({'@graph':[base]}).price,19.99));
check('no stock inferred from price',()=>assert.equal(parse({...base,offers:{...base.offers,availability:undefined}}).stock,'unknown'));
check('master starting price cannot become fixed',()=>assert.equal(ctx.applyMasterContext_(parse(base),{price_notes:'Shown as From £19.99',product_url:url}).isFrom,'yes'));
check('variant URL requires review',()=>assert.equal(ctx.applyMasterContext_(parse(base),{product_url:url+'?variant=123'}).status,'partial'));
check('formula injection neutralised',()=>assert.equal(ctx.safeCell_('=IMPORTXML("evil")'),'\'=IMPORTXML("evil")'));
check('private or arbitrary host rejected',()=>assert.throws(()=>ctx.parts_('https://127.0.0.1/')));
check('credentials in URL rejected',()=>assert.throws(()=>ctx.parts_('https://user:pass@www.johnlewis.com/')));
check('HTTP URL rejected',()=>assert.throws(()=>ctx.parts_('http://www.johnlewis.com/')));
check('robots deny applies',()=>assert.equal(ctx.robotsAllowed_('User-agent: *\nDisallow: /product/', '/product/widget'),false));
check('robots longest allow wins',()=>assert.equal(ctx.robotsAllowed_('User-agent: *\nDisallow: /product/\nAllow: /product/widget','/product/widget'),true));
check('robots user-agent specificity',()=>assert.equal(ctx.robotsAllowed_('User-agent: *\nAllow: /\nUser-agent: CheckMyBasketVerifier\nDisallow: /','/product'),false));
check('robots wildcard and anchor',()=>assert.equal(ctx.robotsAllowed_('User-agent: *\nDisallow: /*?sort=$','/x?sort='),false));
check('robots multi-agent group',()=>assert.equal(ctx.robotsAllowed_('User-agent: Other\nUser-agent: *\nDisallow: /','/x'),false));
class Sheet {
 constructor(name,id,data=[]){this.name=name;this.id=id;this.data=data;}
 getSheetId(){return this.id;}getId(){return this.id;}
 getLastRow(){return this.data.length;}getDataRange(){return this.getRange(1,1,Math.max(1,this.data.length),Math.max(1,this.data[0]?.length||1));}
 getRange(row,col,n=1,m=1){const s=this;return {getValues(){return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>s.data[row+i-1]?.[col+j-1]??''));},setValues(a){a.forEach((r,i)=>{s.data[row+i-1]??=[];r.forEach((v,j)=>s.data[row+i-1][col+j-1]=v);});return this;},clearContent(){for(let i=0;i<n;i++)for(let j=0;j<m;j++)if(s.data[row+i-1])s.data[row+i-1][col+j-1]='';return this;},setBackground(){return this;},setFontColor(){return this;},setFontWeight(){return this;},setWrap(){return this;},setVerticalAlignment(){return this;}};}
 getMaxRows(){return 1000;}insertRowsAfter(){}setFrozenRows(){}setHiddenGridlines(){}setColumnWidths(){}setColumnWidth(){}setRowHeight(){}setRowHeights(){}appendRow(r){this.data.push(r);}
}
const masterHeaders=['gift_id','product_url','product_name','observed_price_gbp','publication_status','approval_status','image_approved','price_notes','availability','image_url','issues_for_approval'];
const master=new Sheet('master',825244673,[masterHeaders,...Array.from({length:8},(_,i)=>['ID'+i,url,'Widget',20,'draft','awaiting-approval','no','','in-stock','',''])]);
const originalMaster=JSON.stringify(master.data);const sheets=[master],properties=new Map(),triggers=[];
ctx.SpreadsheetApp={openById(id){assert.equal(id,'1nTrzLmCH7chbSbhi_SAQx2tP8i2sNFckIWzGLkL3Esw');return {getId:()=>id,getSheets:()=>sheets,getSheetByName:n=>sheets.find(s=>s.name===n),insertSheet(n){const s=new Sheet(n,100+sheets.length);sheets.push(s);return s;}};}};
ctx.LockService={getScriptLock:()=>({waitLock(){},tryLock(){return true;},releaseLock(){}})};
ctx.PropertiesService={getScriptProperties:()=>({getProperty:k=>properties.get(k)||null,setProperty(k,v){properties.set(k,v);},deleteProperty(k){properties.delete(k);}})};
let uuid=0;ctx.Utilities={getUuid:()=>`run-${++uuid}`,sleep(){}};
ctx.ScriptApp={getProjectTriggers:()=>triggers,deleteTrigger(t){triggers.splice(triggers.indexOf(t),1);},newTrigger(name){return {timeBased(){return this;},everyDays(){return this;},atHour(){return this;},inTimezone(){return this;},everyMinutes(){return this;},create(){triggers.push({getHandlerFunction:()=>name});}};}};
ctx.scrapeProduct_=()=>({status:'verified',price:19.99,currency:'GBP',stock:'in-stock',image:'https://images.example/widget.jpg',isFrom:'no',evidence:'fixture',reasons:[]});
check('installation queues six and checkpoints',()=>{ctx.installDailyVerification();assert.equal(JSON.parse(properties.get('CMB_QUEUE')).cursor,6);assert.equal(triggers.length,2);});
check('installation does not duplicate triggers and resumes',()=>{ctx.installDailyVerification();assert.equal(triggers.length,2);assert.equal(properties.has('CMB_QUEUE'),false);assert.equal(sheets.find(s=>s.name==='CMB Verification').data.length,9);});
check('all master facts and approvals unchanged',()=>assert.equal(JSON.stringify(master.data),originalMaster));
check('failed fetch retains last verified price',()=>{const row=ctx.readMaster_()[0];ctx.saveObservation_(row,{status:'blocked',reasons:[]},{id:'failure'});const latest=sheets.find(s=>s.name==='CMB Verification').data[1];assert.equal(latest[6],'');assert.equal(latest[13],19.99);assert.equal(latest[3],'blocked');});
check('history retry is idempotent',()=>{const h=sheets.find(s=>s.name==='CMB History');const before=h.data.length;ctx.saveObservation_(ctx.readMaster_()[0],{status:'blocked',reasons:[]},{id:'failure'});assert.equal(h.data.length,before);});
check('changed URL cannot retain unrelated verified price',()=>{const row={...ctx.readMaster_()[0],product_url:'https://www.johnlewis.com/other'};ctx.saveObservation_(row,{status:'unverified',reasons:[]},{id:'new-url'});assert.equal(sheets.find(s=>s.name==='CMB Verification').data[1][13],'');});
check('duplicate IDs abort master read',()=>{master.data.push(master.data[1]);assert.throws(()=>ctx.readMaster_(),/duplicate gift/);master.data.pop();});
check('managed sheet collision refuses overwrite',()=>{const s=sheets.find(s=>s.name==='CMB Verification');const h=s.data[0][0];s.data[0][0]='User-owned header';assert.throws(()=>ctx.ensureSheets_(),/Unexpected managed-sheet/);s.data[0][0]=h;});
check('stop removes only verifier triggers',()=>{const other={getHandlerFunction:()=> 'unrelated'};triggers.push(other);ctx.stopDailyVerification();assert.equal(triggers.length,1);assert.equal(triggers[0],other);});
console.log(`${count} parser, scheduling and data-preservation checks passed`);

check('500-row queue fits property and round trips',()=>{const run={id:'test',ids:Array.from({length:500},(_,i)=>'CMB-GIFT-'+String(i).padStart(4,'0')),cursor:0};const encoded=ctx.encodeRun_(run);assert.ok(encoded.length<8000);assert.equal(ctx.decodeRun_(encoded).ids.length,500);});
const publishMaster={gift_id:'P',publication_status:'published',approval_status:'approved',approved_by:'Owner',approved_date:'2026-10-10',product_url:url,product_name:'Widget',short_description:'A widget',retailer:'Shop',image_approved:'no',categories:'colleague',recipient_interests:'technology'};
const publishObservation=['P',url,new Date().toISOString(),'verified',200,'Widget',19.99,'no','in-stock'];
check('publication requires explicit approval and live status',()=>{assert.equal(ctx.websiteRows_([{...publishMaster,approval_status:'awaiting-approval'}],[publishObservation],Date.now()).length,0);assert.equal(ctx.websiteRows_([{...publishMaster,publication_status:'draft'}],[publishObservation],Date.now()).length,0);});
check('publication requires fresh exact price and stock',()=>{const stale=[...publishObservation];stale[2]='2020-01-01';assert.equal(ctx.websiteRows_([publishMaster],[stale],Date.now()).length,0);const blocked=[...publishObservation];blocked[3]='blocked';assert.equal(ctx.websiteRows_([publishMaster],[blocked],Date.now()).length,0);});
check('unlicensed images excluded and GBP converted to pence',()=>{const result=ctx.websiteRows_([publishMaster],[publishObservation],Date.now())[0];assert.equal(result[2],1999);assert.equal(result[6],'');});

check('interrupted fetch advances and pauses slow host for cycle',()=>{const run={id:'interrupted',started:new Date().toISOString(),ids:['ID0','ID1'],cursor:0,inflight:'ID0'};properties.set('CMB_QUEUE',ctx.encodeRun_(run));ctx.continueVerification();const current=sheets.find(s=>s.name==='CMB Verification');assert.equal(current.data.find(r=>r[0]==='ID0')[3],'fetch-timeout');assert.equal(current.data.find(r=>r[0]==='ID1')[3],'host-timeout');assert.equal(properties.has('CMB_QUEUE'),false);});
console.log(`${count} total verifier checks passed`);
check('500 source rows accepted and 501 rejected',()=>{const saved=master.data;master.data=[masterHeaders,...Array.from({length:500},(_,i)=>['ID'+i,url,'Widget',20,'draft','awaiting-approval','no','','in-stock','',''])];assert.equal(ctx.readMaster_().length,500);master.data.push(['extra',url]);assert.throws(()=>ctx.readMaster_(),/row limit/);master.data=saved;});
console.log(`${count} verifier checks passed`);
