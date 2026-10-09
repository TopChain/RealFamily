import {test} from 'node:test';import assert from 'node:assert/strict';import {createService} from '../core.mjs';import {whatsappAction} from '../whatsapp.mjs';
test('private WhatsApp state cannot be read without authorization',async()=>{
 const service=createService({query(){throw Error('Public database access')}},{PUBLIC_BASE_URL:'https://test.example',MAILER_SECRET:'secret'});
 assert.equal((await service(new Request('https://test.example?action=wa-state-get',{method:'POST',body:'{"name":"auth"}'}))).status,401);
});
test('delivery claim blocks an existing attempt rather than resending',async()=>{
 let calls=0;const pool={async query(sql){assert.match(sql,/ON CONFLICT DO NOTHING/);return {rows:++calls===1?[{lesson_id:'2026-10-09-1'}]:[]}}};
 const body={lessonId:'2026-10-09-1',destinationHash:'a'.repeat(64)};
 assert.equal((await whatsappAction(pool,'wa-claim',body)).allowed,true);assert.equal((await whatsappAction(pool,'wa-claim',body)).allowed,false);
});
test('successful result requires a message ID; oversized state is rejected',async()=>{
 const pool={query(){throw Error('Should not query')}};
 await assert.rejects(()=>whatsappAction(pool,'wa-result',{lessonId:'x',status:'sent'}));
 await assert.rejects(()=>whatsappAction(pool,'wa-state-put',{name:'auth',encrypted:'x'.repeat(2000001)}));
});
