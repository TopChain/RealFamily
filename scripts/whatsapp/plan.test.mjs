import {test} from 'node:test';import assert from 'node:assert/strict';import {pacificClock,plan} from './plan.mjs';
test('7:30 AM follows Pacific daylight and standard time',()=>{
 for(const date of ['2026-10-09T14:29:00Z','2026-12-09T15:29:00Z'])assert.equal(pacificClock(new Date(date)).due,false);
 for(const date of ['2026-10-09T14:30:00Z','2026-12-09T15:30:00Z'])assert.equal(pacificClock(new Date(date)).due,true);
 assert.equal(pacificClock(new Date('2026-10-09T06:30:00Z')).date,'2026-10-08');
});
test('incomplete or wrong-day editions never produce a send plan',()=>{
 assert.throws(()=>plan({date:'2026-10-08',lessons:[]},[],'2026-10-09'));
 assert.throws(()=>plan({date:'2026-10-09',lessons:Array(10).fill({id:'2026-10-09-1',image:'vocabulary',filename:'../../file'})},[],'2026-10-09'));
});
