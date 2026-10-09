import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {designedEmail,p,button,note} from './email-design.mjs';
export const TOPICS={news:'World & AI news',markets:'Global markets',health:'Healthy living',recipes:'Family kitchen',english:'Everyday English'};
export const hash=s=>createHash('sha256').update(s).digest('hex');
export const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function normalize(input){
 const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
 const topics=Array.isArray(input.topics)?[...new Set(input.topics)]:[];
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!topics.length||topics.length>5||topics.some(t=>!Object.hasOwn(TOPICS,t))||input.consent!==true)throw Error('invalid request');
 return {email,topics};
}
const shell=body=>`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Real Family · Email subscriptions</title><style>body{font:20px/1.6 Arial;color:#183e36;background:#f7f6f0;padding:30px}main{max-width:660px;margin:auto;background:white;padding:30px;border-radius:10px}button{font:inherit;background:#183e36;color:white;padding:12px 25px;border:0;border-radius:5px}</style><main><h1>Real Family</h1>${body}<p><a href="https://www.topchainfresh.com/realfamily/">Back to Real Family</a></p></main></html>`;
export function createService(pool,env){
 const base=env.PUBLIC_BASE_URL,admin=env.MAILER_SECRET;
 if(!base||!admin)throw Error('Subscription server configuration is incomplete');
 const origins=new Set(['https://www.topchainfresh.com','https://topchainfresh.com']);
 function isAdmin(request){const v=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from('Bearer '+admin);return v.length===expected.length&&timingSafeEqual(v,expected)}
 return async request=>{
 const url=new URL(request.url),action=url.searchParams.get('action')||'subscribe',origin=request.headers.get('origin');
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
 if(origins.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers.Vary='Origin';headers['Access-Control-Allow-Headers']='Content-Type';headers['Access-Control-Allow-Methods']='POST,OPTIONS'}
 const json=(value,status=200)=>Response.json(value,{status,headers});
 const html=(body,status=200)=>new Response(shell(body),{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
 if(request.method==='OPTIONS')return new Response(null,{status:origins.has(origin)?204:403,headers});
 if(action==='health')return json({ok:true});
 if(action.startsWith('wa-')){
  if(!isAdmin(request))return json({error:'Unauthorized'},401);
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  try{const {whatsappAction}=await import('./whatsapp.mjs');return json(await whatsappAction(pool,action,await request.json()))}
  catch{return json({error:'WhatsApp private request failed'},400)}
 }
 if(action.startsWith('mail-')){
  if(!isAdmin(request))return json({error:'Unauthorized'},401);
  if(action==='mail-digests'&&request.method==='POST'){
   const response=await fetch('https://www.topchainfresh.com/realfamily/data/latest.json',{signal:AbortSignal.timeout(15000)});if(!response.ok)return json({error:'Website data unavailable'},503);
   const {queueDigests}=await import('./digests.mjs');const data=await response.json();const day=new Date().toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});const recipes=await fetch('https://www.topchainfresh.com/realfamily/data/recipes-archive/'+day+'.json',{signal:AbortSignal.timeout(15000)});if(!recipes.ok)return json({error:'Daily recipe archive unavailable'},503);data.familyRecipes=(await recipes.json()).recipes;return json({queued:await queueDigests(pool,data)});
  }
  if(action==='mail-claim'&&request.method==='POST'){
   const lease=randomBytes(24).toString('hex');
   // Stale leases become uncertain; the relay searches Sent before any retry.
   await pool.query("UPDATE realfamily.mail_outbox SET status='uncertain' WHERE status='sending' AND lease_at<now()-interval '15 minutes'");
   const {rows}=await pool.query(`WITH next AS (SELECT id,status AS prior_status FROM realfamily.mail_outbox WHERE status IN ('pending','uncertain') AND (kind='confirmation' AND created_at>now()-interval '48 hours' OR kind='digest' AND EXISTS(SELECT 1 FROM realfamily.subscribers s WHERE s.email=recipient AND s.active)) ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 10) UPDATE realfamily.mail_outbox o SET status='sending',lease_id=$1,lease_at=now() FROM next WHERE o.id=next.id RETURNING o.id,o.recipient,o.subject,o.html,o.dedupe_key,next.prior_status`,[lease]);return json({lease,jobs:rows});
  }
  if(action==='mail-check'&&request.method==='POST'){
   const body=await request.json();const {rows}=await pool.query(`SELECT EXISTS(SELECT 1 FROM realfamily.mail_outbox o WHERE o.id=$1 AND o.lease_id=$2 AND o.status='sending' AND (o.kind='confirmation' AND o.created_at>now()-interval '48 hours' OR o.kind='digest' AND EXISTS(SELECT 1 FROM realfamily.subscribers s WHERE s.email=o.recipient AND s.active))) AS allowed`,[body.id,body.lease]);return json({allowed:rows[0].allowed});
  }
  if(action==='mail-result'&&request.method==='POST'){
   const body=await request.json();if(!['sent','pending','uncertain'].includes(body.status)||body.status==='sent'&&!body.messageId)return json({error:'Invalid result'},400);
   await pool.query(`UPDATE realfamily.mail_outbox SET status=$1,gmail_message_id=$2,sent_at=CASE WHEN $1='sent' THEN now() ELSE sent_at END,lease_at=NULL,lease_id=NULL WHERE id=$3 AND lease_id=$4 AND status='sending'`,[body.status,body.messageId||null,body.id,body.lease]);return json({ok:true});
  }
  return json({error:'Not found'},404);
 }
 if(['confirm','unsubscribe'].includes(action)){
  const token=url.searchParams.get('token');if(!token||!/^[a-f0-9]{64}$/.test(token))return html('<p>This link is invalid.</p>',400);
  if(request.method==='GET')return html(`<h2>${action==='confirm'?'Confirm your subscription':'Unsubscribe from Real Family'}</h2><p>${action==='confirm'?'Only confirm if you requested these daily emails.':'This stops all Real Family subscription emails.'}</p><form method="post"><button type="submit">${action==='confirm'?'Confirm subscription':'Unsubscribe'}</button></form>`);
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(action==='unsubscribe'){
   await pool.query('UPDATE realfamily.subscribers SET active=false,topics=ARRAY[]::text[] WHERE unsubscribe_hash=$1',[hash(token)]);return html('<h2>You are unsubscribed.</h2><p>No further daily digests will be sent.</p>');
  }
  const client=await pool.connect();try{
   await client.query('BEGIN');const {rows}=await client.query('SELECT * FROM realfamily.subscription_requests WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() FOR UPDATE',[hash(token)]);
   if(!rows.length){await client.query('ROLLBACK');return html('<p>This confirmation link has expired or was already used. You can request a new link on the website.</p>',400)}
   const r=rows[0],unsubscribe=randomBytes(32).toString('hex');
   await client.query(`INSERT INTO realfamily.subscribers(email,topics,active,confirmed_at,unsubscribe_hash) VALUES($1,$2,true,now(),$3) ON CONFLICT(email) DO UPDATE SET topics=ARRAY(SELECT DISTINCT unnest(CASE WHEN realfamily.subscribers.active THEN realfamily.subscribers.topics ELSE ARRAY[]::text[] END || EXCLUDED.topics)),active=true,confirmed_at=now(),unsubscribe_hash=EXCLUDED.unsubscribe_hash`,[r.email,r.topics,hash(unsubscribe)]);
   await client.query('UPDATE realfamily.subscription_requests SET used_at=now() WHERE token_hash=$1',[hash(token)]);
   // Keep the unsubscribe URL private, alongside mail content, for the digest relay.
   await client.query('INSERT INTO realfamily.subscription_preferences(email,unsubscribe_url) VALUES($1,$2) ON CONFLICT(email) DO UPDATE SET unsubscribe_url=EXCLUDED.unsubscribe_url',[r.email,base+'?action=unsubscribe&token='+unsubscribe]);
   await client.query('COMMIT');return html('<h2>Subscription confirmed.</h2><p>You will receive one daily digest for your chosen topics. Every digest includes an unsubscribe link.</p>');
  }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 }
 if(action!=='subscribe'||request.method!=='POST')return json({error:'Not found'},404);
 if(!origins.has(origin))return json({error:'Origin not allowed'},403);
 const raw=await request.text();if(raw.length>4096)return json({error:'Request too large'},413);
 let input,selection;try{input=JSON.parse(raw);selection=normalize(input)}catch{return json({error:'Enter a valid email and choose a topic.'},400)}
 if(input.website)return json({ok:true},202);
 const client=await pool.connect();try{
  await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('realfamily-signup'))");
  const {rows:[limits]}=await client.query(`SELECT (SELECT count(*) FROM realfamily.subscription_requests WHERE email=$1 AND created_at>now()-interval '1 hour')::int AS email_count,(SELECT count(*) FROM realfamily.subscription_requests WHERE created_at>now()-interval '1 day')::int AS total`,[selection.email]);
  if(limits.email_count>=3||limits.total>=100){await client.query('ROLLBACK');return new Response(JSON.stringify({error:'Please try again later.'}),{status:429,headers:{...headers,'Content-Type':'application/json','Retry-After':'3600'}})}
  const token=randomBytes(32).toString('hex'),url=base+'?action=confirm&token='+token;
  await client.query("INSERT INTO realfamily.subscription_requests(token_hash,email,topics,expires_at) VALUES($1,$2,$3,now()+interval '48 hours')",[hash(token),selection.email,selection.topics]);
  const names=selection.topics.map(t=>TOPICS[t]);const content=designedEmail({title:'A good thing, delivered daily.',kicker:'CONFIRM YOUR SUBSCRIPTION',intro:'One daily digest. Only the topics you choose.',body:p('You requested: '+names.join(', '))+button('Confirm your subscription',url)+note('This link expires in 48 hours. If you did not request this email, simply ignore it. Your subscription starts only after confirmation.')});
  await client.query("INSERT INTO realfamily.mail_outbox(recipient,kind,subject,html,dedupe_key) VALUES($1,'confirmation',$2,$3,$4)",[selection.email,'Real Family · Confirm subscription · '+token.slice(0,12),content,'confirmation-'+hash(token)]);
  await client.query('COMMIT');return json({ok:true},202);
 }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 };
}
