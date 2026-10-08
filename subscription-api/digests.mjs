import {createHash} from 'node:crypto';
import {TOPICS,escape} from './core.mjs';
const home='https://www.topchainfresh.com/realfamily/';
const pacificDay=s=>new Date(s).toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});
const time=s=>s?new Date(s).toLocaleString('en-US',{timeZone:'America/Los_Angeles',dateStyle:'medium',timeStyle:'short'})+' PT':'Unavailable';
const link=(title,url)=>{try{const u=new URL(url);return u.protocol==='https:'?`<a href="${escape(u.href)}">${escape(title)}</a>`:escape(title)}catch{return escape(title)}};
export function digestContent(data,topics,date){
 const sections=[];
 for(const topic of topics){
  if(!Object.hasOwn(TOPICS,topic))continue;
  let body='';
  if(topic==='news'){
   const eligible=r=>r.freeAccessVerified&&[date,pacificDay(Date.parse(date+'T12:00:00-07:00')-86400000)].includes(pacificDay(r.published));
   const news=Object.values(data.countries||{}).flat().filter(eligible).sort((a,b)=>Date.parse(b.published)-Date.parse(a.published));
   const seen=new Set();const rows=[...news.slice(0,6),...(data.ai||[]).filter(eligible).slice(0,3)].filter(r=>{if(seen.has(r.url))return false;seen.add(r.url);return true});
   body='<ul>'+rows.map(r=>`<li>${link(r.title,r.url)} — ${escape(r.source)} · ${time(r.published)}</li>`).join('')+'</ul>';
   if(!rows.length)body='<p>No verified recent headlines are available.</p>';
  }
  if(topic==='markets'){body='<ul>'+Object.entries(data.markets||{}).slice(0,5).map(([name,m])=>`<li>${link(name,m.source)}: ${escape(m.close??'Unavailable')} · ${escape(m.marketStatus||'Status unavailable')} · Updated ${time(m.updated)}</li>`).join('')+'</ul><p>For reference only; not investment advice. See the market page for local session times.</p>'}
  if(topic==='health'){const rows=(data.research||[]).filter(r=>r.visible!==false&&r.discoveredDate===date).slice(0,3);body=rows.length?'<ul>'+rows.map(r=>`<li>${link(r.title,r.url)} — ${escape(r.journal||'Journal')}</li>`).join('')+'</ul>':'<p>No new research additions today. Previous research and all ten life-stage profiles remain available.</p>';body+='<p>Research leads are not individualized medical advice.</p>'}
  if(topic==='recipes')body='<p>Explore today’s six-serving main dishes and treats, with ingredients, steps and video links.</p>';
  if(topic==='english'){if(data.english?.date!==date)continue;body='<ol>'+data.english.lessons.map(l=>`<li>${escape(l.title)} — ${escape(l.level||'B2–C1')}</li>`).join('')+'</ol>';body+=`<p>${link('Open today’s ten learning cards',home+'?lesson-date='+date+'#english')}</p>`}
  sections.push(`<h2>${escape(TOPICS[topic])}</h2>${body}<p>${link('Read '+TOPICS[topic],home+'#'+topic)}</p>`);
 }
 return `<h1>Real Family</h1><p>Your daily digest · ${escape(date)} · PT</p>${sections.join('')}<p>Growing together. Moving toward the future, together.</p>`;
}
export async function queueDigests(pool,data,now=new Date()){
 const date=pacificDay(now);const client=await pool.connect();let count=0;
 try{
  await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('realfamily-digest'))");
  const {rows}=await client.query('SELECT s.email,s.topics,p.unsubscribe_url FROM realfamily.subscribers s JOIN realfamily.subscription_preferences p USING(email) WHERE s.active');
  for(const sub of rows){
   if(sub.topics.includes('english')&&data.english?.date!==date)continue;
   const key='digest-'+date+'-'+createHash('sha256').update(sub.email).digest('hex');
   const html=digestContent(data,sub.topics,date)+`<p>${link('Unsubscribe from all Real Family emails',sub.unsubscribe_url)}</p>`;
   const result=await client.query("INSERT INTO realfamily.mail_outbox(recipient,kind,subject,html,dedupe_key) VALUES($1,'digest',$2,$3,$4) ON CONFLICT(dedupe_key) DO NOTHING",[sub.email,'Real Family · Daily digest · '+date+' · PT',html,key]);count+=result.rowCount;
  }
  await client.query('COMMIT');return count;
 }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
}
