import pg from 'pg';
import {createService} from '../core.mjs';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:3});
pool.on('error',()=>console.error('Subscription database connection interrupted'));
const service=createService(pool,process.env);
export default async function handler(req,res){
 try{
  const host=process.env.PUBLIC_BASE_URL;const url=new URL(req.url,host);
  const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
  const body=['GET','HEAD'].includes(req.method)?undefined:typeof req.body==='string'?req.body:JSON.stringify(req.body||{});
  const response=await service(new Request(url,{method:req.method,headers,body}));
  res.statusCode=response.status;response.headers.forEach((value,key)=>res.setHeader(key,value));res.end(await response.text());
 }catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');res.end('Subscriptions are temporarily unavailable. Please try again later.')}
}
