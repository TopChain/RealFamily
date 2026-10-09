export async function whatsappAction(pool,action,body){
 if(action==='wa-state-get'&&['auth','routes'].includes(body.name)){
  const {rows}=await pool.query('SELECT encrypted FROM realfamily.whatsapp_state WHERE name=$1',[body.name]);return {encrypted:rows[0]?.encrypted||null};
 }
 if(action==='wa-state-put'&&['auth','routes'].includes(body.name)&&typeof body.encrypted==='string'&&body.encrypted.length<2000000){
  await pool.query('INSERT INTO realfamily.whatsapp_state(name,encrypted) VALUES($1,$2) ON CONFLICT(name) DO UPDATE SET encrypted=excluded.encrypted,updated_at=now()',[body.name,body.encrypted]);return {ok:true};
 }
 if(action==='wa-claim'&&/^\d{4}-\d{2}-\d{2}-\d+$/.test(body.lessonId)&&/^[a-f0-9]{64}$/.test(body.destinationHash)){
  const {rows}=await pool.query("INSERT INTO realfamily.whatsapp_deliveries(lesson_id,destination_hash,status) VALUES($1,$2,'sending') ON CONFLICT DO NOTHING RETURNING lesson_id",[body.lessonId,body.destinationHash]);
  // A previous attempt is never sent again blindly, including a stale sending row.
  return {allowed:rows.length===1};
 }
 if(action==='wa-result'&&['sent','uncertain'].includes(body.status)&&typeof body.lessonId==='string'&&(body.status!=='sent'||typeof body.messageId==='string'&&body.messageId.length>0)){
  await pool.query("UPDATE realfamily.whatsapp_deliveries SET status=$1,message_id=$2,sent_at=CASE WHEN $1='sent' THEN now() ELSE NULL END WHERE lesson_id=$3 AND status='sending'",[body.status,body.messageId||null,body.lessonId]);return {ok:true};
 }
 throw Error('Invalid private WhatsApp action');
}
