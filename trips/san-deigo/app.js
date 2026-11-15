'use strict';
const KEY = 'westbound-2026-progress-v1';
let data, selected = 0;
let state = { done: {}, closed: {}, hideDone: false };
const $ = selector => document.querySelector(selector);
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}
function externalLink(label, url, cls = 'map') {
  const link = el('a', cls, label);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}
function maps(destination, label = '导航 ↗') {
  const link = externalLink(label, 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destination));
  link.setAttribute('aria-label', label + '：' + destination);
  return link;
}
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && typeof saved === 'object') {
    state = {
      done: saved.done && typeof saved.done === 'object' ? saved.done : {},
      closed: saved.closed && typeof saved.closed === 'object' ? saved.closed : {},
      hideDone: saved.hideDone === true
    };
  }
} catch {
  $('#storage-status').textContent = '浏览器无法读取保存记录；本次仍可勾选。';
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { $('#storage-status').textContent = '浏览器无法保存记录，关闭页面后可能丢失。'; }
}
function count(items) { return items.filter(item => state.done[item.id]).length; }
function updateCounts() {
  const all = data.days.flatMap(day => day.items);
  $('#total-count').textContent = `${count(all)} / ${all.length}`;
  $('#total-progress').max = all.length;
  $('#total-progress').value = count(all);
  const day = data.days[selected];
  $('#day-count').textContent = `已完成 ${count(day.items)} / ${day.items.length}`;
}
function photoFigure(photo) {
  const figure = el('figure', 'sight-photo');
  const img = el('img');
  img.src = photo.src;
  img.alt = photo.alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    img.hidden = true;
    figure.prepend(el('p', 'photo-fallback', '参考图片暂时无法加载，可点击下方来源查看。'));
  }, { once: true });
  figure.append(img);
  const caption = el('figcaption');
  caption.append(externalLink(photo.credit || '照片来源', photo.source, 'source-link'));
  if (photo.license) {
    caption.append(document.createTextNode(' · '));
    caption.append(photo.licenseUrl ? externalLink(photo.license, photo.licenseUrl, 'source-link') : document.createTextNode(photo.license));
  }
  if (photo.changes) caption.append(document.createTextNode(' · ' + photo.changes));
  figure.append(caption);
  return figure;
}
function sightDetails(item) {
  const details = el('details', 'sight-details');
  details.append(el('summary', '', '景点详情 · 照片 / 介绍 / 停车'));
  const content = el('div', 'detail-content');
  for (const photo of item.photos || []) content.append(photoFigure(photo));
  content.append(el('p', 'description', item.description));
  content.append(el('p', 'address', '位置：' + item.address));
  for (const text of item.details || []) content.append(el('p', 'detail-note', text));
  const parking = el('div', 'parking-list');
  parking.append(el('h4', '', '停车'));
  for (const option of item.parking || []) {
    const box = el('div', 'parking-option');
    box.append(el('strong', '', option.name), el('p', '', option.fee), maps(option.destination, '停车导航 ↗'));
    parking.append(box);
  }
  content.append(parking);
  const sources = el('div', 'sources');
  sources.append(el('span', '', `信息核对 ${data.verifiedAt} · `));
  (item.sources || []).forEach(source => sources.append(externalLink(source.label, source.url, 'source-link')));
  content.append(sources);
  details.append(content);
  return details;
}
function entry(item) {
  const row = el('article', 'entry' + (state.done[item.id] ? ' done' : '') + (item.kind === 'drive' ? ' transfer' : ''));
  row.dataset.id = item.id;
  const label = el('label', 'check');
  const box = el('input');
  box.type = 'checkbox';
  box.checked = !!state.done[item.id];
  box.setAttribute('aria-label', `标记完成：${item.title}，${item.time}`);
  box.addEventListener('change', () => {
    state.done[item.id] = box.checked;
    save();
    if (state.hideDone) { renderTimeline(); $('#hide-done').focus(); }
    else row.classList.toggle('done', box.checked);
    updateCounts();
  });
  label.append(box);
  const body = el('div', 'entry-body');
  body.append(el('div', 'entry-time', item.time));
  const head = el('div', 'entry-header');
  head.append(el('h3', '', item.title));
  if (item.destination) head.append(maps(item.destination));
  body.append(head);
  if (item.duration) body.append(el('p', 'visit-duration', '游览时间：' + item.duration));
  if (item.kind === 'sight') body.append(sightDetails(item));
  if (item.notes.length) {
    const notes = el('div', 'notes');
    item.notes.forEach(text => notes.append(el('p', '', text)));
    body.append(notes);
  }
  if (item.next) {
    body.append(el('p', 'next-stop', `${item.next.mode === '步行' ? '步行' : '下一站车程'} → ${item.next.title}：${item.next.time}（预计）`));
  }
  row.append(label, body);
  return row;
}
function foldedGroup(label, items, className = 'done-group') {
  const group = el('details', className);
  group.append(el('summary', '', label));
  items.forEach(item => group.append(entry(item)));
  return group;
}
function morningKey() { return data.days[selected].date + '-morning-hidden'; }
function renderTimeline() {
  const host = $('#timeline');
  host.replaceChildren();
  const items = data.days[selected].items;
  const hideMorning = !!state.closed[morningKey()];
  const done = [], morning = [], visible = [];
  for (const item of items) {
    if (state.hideDone && state.done[item.id]) done.push(item);
    else if (hideMorning && item.end <= 720) morning.push(item);
    else visible.push(item);
  }
  if (morning.length) host.append(foldedGroup(`上午行程已收起 · ${morning.length} 项`, morning, 'morning-group'));
  const entries = el('div', 'entries');
  visible.forEach(item => entries.append(entry(item)));
  host.append(entries);
  if (done.length) host.append(foldedGroup(`已完成 ${done.length} 项 · 点击查看`, done));
}
function renderDay() {
  const day = data.days[selected];
  document.querySelectorAll('[role=tab]').forEach((button, i) => {
    button.setAttribute('aria-selected', String(i === selected));
    button.tabIndex = i === selected ? 0 : -1;
  });
  $('#day-panel').setAttribute('aria-labelledby', 'tab-' + selected);
  $('#hide-morning').checked = !!state.closed[morningKey()];
  const heading = $('#day-heading');
  heading.replaceChildren(el('p', 'day-kicker', `DAY 0${selected + 1} / ${day.date} · ${day.weekday}`), el('h2', 'day-title', day.title));
  const meta = el('div', 'day-meta');
  const badge = el('span', 'badge');
  badge.id = 'day-count';
  meta.append(el('span', '', day.route), badge);
  heading.append(meta);
  if (day.intro.length) {
    const intro = el('div', 'intro');
    day.intro.forEach(text => intro.append(el('p', '', text)));
    heading.append(intro);
  }
  renderTimeline();
  updateCounts();
}
$('#hide-done').checked = state.hideDone;
$('#hide-done').addEventListener('change', event => {
  state.hideDone = event.target.checked; save(); renderTimeline();
});
$('#hide-morning').addEventListener('change', event => {
  state.closed[morningKey()] = event.target.checked; save(); renderTimeline();
});
$('#expand-all').addEventListener('click', () => {
  state.hideDone = false;
  state.closed[morningKey()] = false;
  $('#hide-done').checked = false;
  $('#hide-morning').checked = false;
  save(); renderTimeline();
  document.querySelectorAll('#timeline details').forEach(details => { details.open = true; });
});
$('#reset').addEventListener('click', () => {
  if (confirm('清除当前浏览器中的全部完成记录？行程内容不受影响。')) {
    state.done = {}; save(); renderDay();
  }
});
fetch('./data/itinerary.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw Error('HTTP ' + response.status);
  return response.json();
}).then(json => {
  data = json;
  const index = data.days.findIndex(day => day.date === location.hash.slice(1));
  selected = index < 0 ? 0 : index;
  data.days.forEach((day, i) => {
    const button = el('button', 'tab');
    button.id = 'tab-' + i;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'day-panel');
    button.append(el('span', 'day-number', 'DAY 0' + (i + 1)));
    const date = el('span', 'date', day.date.slice(5).replace('-', '.'));
    date.append(el('small', '', day.weekday));
    button.append(date, el('span', 'place', i < 2 ? 'San Diego' : i === 2 ? 'Joshua Tree' : i === 3 ? 'Palm Springs' : '归途 · San Diego'));
    button.addEventListener('click', () => {
      selected = i; history.replaceState(null, '', '#' + day.date); renderDay();
    });
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % data.days.length;
      if (event.key === 'ArrowLeft') next = (i + data.days.length - 1) % data.days.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = data.days.length - 1;
      if (next !== undefined) { event.preventDefault(); $('#tab-' + next).click(); $('#tab-' + next).focus(); }
    });
    $('#tabs').append(button);
  });
  $('#planning-note').textContent = data.planningNote;
  const checks = $('#verification-list');
  data.checks.forEach(check => {
    const line = el('p');
    line.append(el('span', 'check-status', check.status + ' · '), externalLink(check.label, check.url, 'source-link'));
    checks.append(line);
  });
  renderDay();
}).catch(error => {
  console.error('Itinerary load failed', error);
  $('#timeline').replaceChildren(el('p', 'empty', '行程未能加载。请通过本地预览服务器或部署网址打开页面，再刷新重试。'));
});
