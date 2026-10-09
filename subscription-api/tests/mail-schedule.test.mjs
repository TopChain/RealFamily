import {test} from 'node:test';
import assert from 'node:assert/strict';
import {digestDue} from '../mail-schedule.mjs';
import {queueDigests} from '../digests.mjs';
test('daily digests wait for 7:30 AM PT in both offsets and on DST transitions',()=>{
 for(const [before,due] of [['2026-10-09T14:29:59Z','2026-10-09T14:30:00Z'],['2026-11-01T15:29:59Z','2026-11-01T15:30:00Z'],['2027-03-14T14:29:59Z','2027-03-14T14:30:00Z']]){
  assert.equal(digestDue(new Date(before)),false);assert.equal(digestDue(new Date(due)),true);
 }
 assert.equal(digestDue(new Date('2026-10-10T07:00:00Z')),false);
});
test('an early digest request creates no database jobs',async()=>{
 const pool={connect(){throw Error('Must not create early mail')}};
 assert.equal(await queueDigests(pool,{},new Date('2026-10-09T14:29:59Z')),0);
});
