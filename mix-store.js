(function(root){
 'use strict';
 const KEY='roost_custom_mixes_v1';
 function normalize(value,ids){
  if(!value||value.version!==1||!Array.isArray(value.mixes)||value.mixes.length>40)throw Error('备份格式不正确，最多保存 40 个声音。');
  const seen=new Set();
  return {version:1,mixes:value.mixes.map(m=>{
   if(!m||typeof m.id!=='string'||!m.id||m.id.length>80||seen.has(m.id))throw Error('声音编号无效或重复。');seen.add(m.id);
   if(typeof m.name!=='string'||!m.name.trim()||m.name.trim().length>40)throw Error('请使用 1–40 字的声音名称。');
   if(!Array.isArray(m.layers)||!m.layers.length||m.layers.length>6)throw Error('每个声音需要 1–6 层音轨。');
   const tracks=new Set();const layers=m.layers.map(l=>{if(!l||!ids.has(l.id)||tracks.has(l.id)||typeof l.level!=='number'||!Number.isFinite(l.level)||l.level<0||l.level>1)throw Error('备份包含未知音轨或无效音量。');tracks.add(l.id);return {id:l.id,level:l.level};});
   if(!layers.some(l=>l.level>0))throw Error('至少一层音轨的音量需大于零。');
   if(typeof m.volume!=='number'||!Number.isFinite(m.volume)||m.volume<=0||m.volume>1)throw Error('总音量应大于零且不超过 100%。');
   return {id:m.id,name:m.name.trim(),volume:m.volume,layers};
  })};
 }
 const api={KEY,normalize,read(storage,ids){return normalize(JSON.parse(storage.getItem(KEY)||'{"version":1,"mixes":[]}'),ids);},write(storage,data,ids){const clean=normalize(data,ids);storage.setItem(KEY,JSON.stringify(clean));return clean;}};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RoostMixStore=api;
})(typeof window==='undefined'?globalThis:window);
