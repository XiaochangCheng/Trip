'use strict';
const KEY = 'westbound-2026-progress-v1';
let data, selected = 0;
let state = { done: {}, closed: {}, hideDone: false };
const $ = s => document.querySelector(s);
const el = (tag, cls, text) => { const n = document.createElement(tag); if(cls)n.className=cls; if(text !== undefined)n.textContent=text; return n; };
try { const saved=JSON.parse(localStorage.getItem(KEY)); if(saved && typeof saved==='object') state={done:saved.done && typeof saved.done==='object'?saved.done:{},closed:saved.closed && typeof saved.closed==='object'?saved.closed:{},hideDone:saved.hideDone===true}; } catch { $('#storage-status').textContent='浏览器无法读取保存记录；本次仍可勾选。'; }
function save() { try { localStorage.setItem(KEY,JSON.stringify(state)); } catch { $('#storage-status').textContent='浏览器无法保存记录，关闭页面后可能丢失。'; } }
function count(items) { return items.filter(i=>state.done[i.id]).length; }
function updateCounts() {
 const all=data.days.flatMap(d=>d.items); $('#total-count').textContent=`${count(all)} / ${all.length}`; $('#total-progress').max=all.length; $('#total-progress').value=count(all);
 const day=data.days[selected]; $('#day-count').textContent=`已完成 ${count(day.items)} / ${day.items.length}`;
}
function entry(item) {
 const row=el('article','entry'+(state.done[item.id]?' done':'')); row.dataset.id=item.id;
 const label=el('label','check');const box=el('input');box.type='checkbox';box.checked=!!state.done[item.id];box.setAttribute('aria-label',`标记完成：${item.title}，${item.time}`);
 box.addEventListener('change',()=>{state.done[item.id]=box.checked;save();if(state.hideDone){renderTimeline(); $('#hide-done').focus();} else row.classList.toggle('done',box.checked);updateCounts();});label.append(box);
 const body=el('div');body.append(el('div','entry-time',item.time));const head=el('div','entry-header');head.append(el('h3','',item.title));
 if(item.destination){const a=el('a','map','导航 ↗');a.href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(item.destination);a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',`Google Maps 导航至 ${item.destination}`);head.append(a);} body.append(head);
 if(item.notes.length){const notes=el('div','notes');item.notes.forEach(t=>notes.append(el('p','',t)));body.append(notes);}row.append(label,body);return row;
}
function renderTimeline(){
 const host=$('#timeline');host.replaceChildren();const day=data.days[selected];
 for(const [key,label,range] of [['morning','上午','12 PM 前结束'],['afternoon','下午','含跨中午行程'],['evening','晚上','6 PM 起出发']]){
  const items=day.items.filter(i=>i.period===key);if(!items.length)continue;
  const group=el('details','period');const groupKey=day.date+'-'+key;group.open=!state.closed[groupKey];group.dataset.period=key;
  const summary=el('summary');summary.append(el('span','',label+' / '+range),el('span','period-info',items.length+' 项行程'));group.append(summary);
  group.addEventListener('toggle',()=>{state.closed[groupKey]=!group.open;save();});
  const entries=el('div','entries');const visible=items.filter(i=>!state.hideDone||!state.done[i.id]);visible.forEach(i=>entries.append(entry(i)));group.append(entries);
  const done=items.filter(i=>state.done[i.id]);if(state.hideDone&&done.length){const details=el('details','done-group');details.append(el('summary','',`已完成 ${done.length} 项 · 点击查看`));done.forEach(i=>details.append(entry(i)));group.append(details);}
  host.append(group);
 }
}
function renderDay(){
 const day=data.days[selected];document.querySelectorAll('[role=tab]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===selected));b.tabIndex=i===selected?0:-1;});$('#day-panel').setAttribute('aria-labelledby','tab-'+selected);
 const heading=$('#day-heading');heading.replaceChildren(el('p','day-kicker',`DAY 0${selected+1} / ${day.date} · ${day.weekday}`));heading.append(el('h2','day-title',day.title));const meta=el('div','day-meta');const badge=el('span','badge');badge.id='day-count';meta.append(el('span','',day.route),badge);heading.append(meta);
 if(day.intro.length){const intro=el('div','intro');day.intro.forEach(p=>intro.append(el('p','',p)));heading.append(intro);}renderTimeline();updateCounts();
}
$('#hide-done').checked=state.hideDone;$('#hide-done').addEventListener('change',e=>{state.hideDone=e.target.checked;save();renderTimeline();});
$('#expand-all').addEventListener('click',()=>{document.querySelectorAll('#timeline details').forEach(d=>d.open=true);for(const key of ['morning','afternoon','evening'])state.closed[data.days[selected].date+'-'+key]=false;save();});
$('#reset').addEventListener('click',()=>{if(confirm('清除当前浏览器中的全部完成记录？行程内容不受影响。')){state.done={};save();renderDay();}});
fetch('./data/itinerary.json', { cache: 'no-store' }).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(json=>{
 data=json;const date=location.hash.slice(1);const index=data.days.findIndex(d=>d.date===date);selected=index<0?0:index;
 data.days.forEach((day,i)=>{const button=el('button','tab');button.id='tab-'+i;button.setAttribute('role','tab');button.setAttribute('aria-controls','day-panel');button.append(el('span','day-number','DAY 0'+(i+1)));const date=el('span','date',day.date.slice(5).replace('-','.'));date.append(el('small','',day.weekday));button.append(date,el('span','place',i<2?'San Diego':i===2?'Joshua Tree':i===3?'Palm Springs':'归途 · San Diego'));button.addEventListener('click',()=>{selected=i;history.replaceState(null,'','#'+day.date);renderDay();});button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%data.days.length;if(e.key==='ArrowLeft')next=(i+data.days.length-1)%data.days.length;if(e.key==='Home')next=0;if(e.key==='End')next=data.days.length-1;if(next!==undefined){e.preventDefault();$('#tab-'+next).click();$('#tab-'+next).focus();}});$('#tabs').append(button);});renderDay();
}).catch(()=>{$('#timeline').replaceChildren(el('p','empty','行程未能加载。请通过本地预览服务器或部署网址打开页面，再刷新重试。'));});
