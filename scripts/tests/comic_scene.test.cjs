const {test}=require('node:test'),assert=require('node:assert/strict');
const {svg}=require('../comic_scene.cjs');
const base={description:'A delighted person celebrates an accepted proposal.',background:'#fff0cf',characters:[{x:300,y:100,scale:1,shirt:'#c65c46',flip:false,face:'happy',pose:'up'}],props:[{kind:'check',x:80,y:180,scale:1}]};
test('compositions depict different actions and escape all text',()=>{
 const other={...base,description:'A skeptical reader questions a promise <script>.',characters:[{...base.characters[0],face:'skeptical',pose:'cross'}],props:[{kind:'question',x:430,y:30,scale:1}]};
 assert.notEqual(svg(base),svg(other));assert.match(svg(other),/&lt;script&gt;/);assert.doesNotMatch(svg(other),/<script>/);
});
test('model output cannot add executable SVG, remote files or unbounded coordinates',()=>{
 for(const change of [{props:[{kind:'image',x:100,y:100,scale:1}]},{background:'url(https://example.com)'},{characters:[{...base.characters[0],x:9999}]}])assert.throws(()=>svg({...base,...change}));
});
