// Read-only smoke run using the exact Apps Script parser, without Google credentials.
const fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({console});vm.runInContext(fs.readFileSync(__dirname+'/Code.gs','utf8'),ctx);
const rows=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const output=process.argv[3];const results=[],robots=new Map();
async function fetchPage(url){return fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'CheckMyBasketVerifier/1.0 (+https://www.checkmybasket.co.uk/contact)','Accept':'text/html,application/ld+json'}});}
async function one(row){
 let url=row.product_url;
 try {
  for(let hop=0;hop<4;hop++){
   const p=ctx.parts_(url);
   if(!robots.has(p.host)){
    const r=await fetchPage(p.origin+'/robots.txt');robots.set(p.host,{code:r.status,body:await r.text()});
   }
   const r=robots.get(p.host);
   if(r.code!==404&&(r.code!==200||!/user-agent\s*:/i.test(r.body)))return {status:'robots-unavailable',http:r.code};
   if(r.code===200&&!ctx.robotsAllowed_(r.body,p.path))return {status:'robots-disallowed'};
   const res=await fetchPage(url);
   if([301,302,303,307,308].includes(res.status)){url=new URL(res.headers.get('location'),url).href;continue;}
   if(res.status!==200)return {status:[401,403,429].includes(res.status)?'blocked':'http-error',http:res.status};
   const body=await res.text();if(body.length>3000000)return {status:'response-too-large'};
   return {...ctx.applyMasterContext_(ctx.parseProduct_(body,row.product_url,row.product_name),row),http:200};
  }return {status:'redirect-error'};
 }catch(e){return {status:'fetch-error',error:e.name};}
}
(async()=>{
 for(const row of rows){const observation=await one(row);results.push({gift_id:row.gift_id,product_url:row.product_url,checked_at:new Date().toISOString(),...observation});
  fs.writeFileSync(output,JSON.stringify(results,null,2));console.log(row.gift_id+' '+observation.status);await new Promise(r=>setTimeout(r,1200));}
 const counts={};for(const x of results)counts[x.status]=(counts[x.status]||0)+1;console.log(JSON.stringify(counts));
})();
