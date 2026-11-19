// GTA VI trophy guide & tracker: checklist saved in localStorage, filters by kind,
// spoiler mode, search, export/import, a roadmap to the platinum, and shareable
// deep links (?filter= ?spoiler= ?open= ?earned= ?view=). Static only: the one
// request it makes is its own data file, data/trophies.json. No network otherwise.
const EARNED_KEY = 'gta6-guide-earned-v1';
const SPOILER_KEY = 'gta6-guide-spoiler-v1';
const PLATINUM_ID = 1;

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const countLine = document.getElementById('countLine');
const emptyState = document.getElementById('emptyState');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeCounts = document.getElementById('gradeCounts');
const searchInput = document.getElementById('search');
const spoilerInput = document.getElementById('spoiler');

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

const ROADMAP_STAGES = [
  { n: 1, title: 'Before you play — saves first', ids: [28],
    blurb: '15 manual save slots + 1 autosave, no mission replay, no New Game Plus. Keep one save at the start of every chapter and one untouched save from just before the final mission. Do the Chapter 1 balcony meditation (Positive Mental Attitude) before leaving Chapter 1 — it is the one thing that can be missed.' },
  { n: 2, title: 'Story — Chapters 1 & 2', ids: trophies.filter((t) => t.stage === 2).map((t) => t.id),
    blurb: 'Play the opening and the first two chapters. Lucia joins as a playable character in Chapter 2 and most activities open up. Beat Cal at fishing and finish an arcade game while you are here.' },
  { n: 3, title: 'Story — Chapters 3 & 4', ids: trophies.filter((t) => t.stage === 3).map((t) => t.id),
    blurb: 'Finish the middle chapters and their named missions. Do Yago\u2019s timed race the moment its hourglass icon appears in Chapter 3 — it feeds a stranger strand.' },
  { n: 4, title: 'Strangers, side missions & the finale', ids: trophies.filter((t) => t.stage === 4).map((t) => t.id),
    blurb: 'Finish the side-character strands (Andy, Kenton, Billy, Randy, Tyrone, Bret) and 8 stranger strands, then the final mission. 100% completion (A Long Road) is tracked on the in-game checklist — most of it is finished in the cleanup stages.' },
  { n: 5, title: 'Activities, robberies & stunts', ids: trophies.filter((t) => t.stage === 5).map((t) => t.id),
    blurb: 'The long grind: 250 stunts, 42 shooting-range gold medals, drone races at 14 locations, 20 race wins, 50 challenges, and the robberies — 5 bank vaults, an armored truck, a jewelry store, one illegal operation per gang — plus the money trophies.' },
  { n: 6, title: 'Collectibles, exploration & the platinum', ids: trophies.filter((t) => t.stage === 6).map((t) => t.id),
    blurb: 'Mop up: 18 meditation spots, 3 card sets, WAiNK at 100 locations, 100 vehicles, all 52 areas of Leonida, all 8 garages. The platinum pops when the last of these does.' },
];

function loadEarned() {
  try {
    const ids = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return new Set(ids.filter((id) => byId.has(id)));
  } catch {
    return new Set();
  }
}

let earned = loadEarned();
// Demo ids from ?earned= are shown, never saved: they live in their own set,
// so toggling a trophy only ever writes the reader's real progress.
const demoEarned = new Set();
let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
let filter = 'all';
let query = '';
let selectedId = null;
let view = 'checklist';

// Deep links: ?filter= ?spoiler= ?open= ?earned= ?view=. The earned ids are a
// demo view only — they are shown, not saved over the reader's own progress.
if (['all', 'story', 'missable', 'collectibles', 'activities', 'online'].includes(params.get('filter'))) {
  filter = params.get('filter');
}
if (params.get('spoiler') === '1') spoiler = true;
if (params.get('spoiler') === '0') spoiler = false;
if (params.get('view') === 'roadmap') view = 'roadmap';
for (const raw of (params.get('earned') ?? '').split(',')) {
  const id = Number(raw);
  if (byId.has(id)) demoEarned.add(id);
}
if (byId.has(Number(params.get('open')))) selectedId = Number(params.get('open'));

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function isEarned(id) {
  return earned.has(id) || demoEarned.has(id);
}

function toggleEarned(id, checked) {
  if (checked) {
    earned.add(id);
    demoEarned.delete(id);
  } else {
    earned.delete(id);
    demoEarned.delete(id);
  }
  saveEarned();
}

function isStory(t) {
  return t.kinds.includes('story');
}

function isHiddenBySpoiler(t) {
  return spoiler && isStory(t) && t.id !== PLATINUM_ID && !isEarned(t.id);
}

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function matchesFilter(t) {
  if (filter === 'all') return true;
  if (filter === 'missable') return t.missable;
  if (filter === 'online') return false;
  return t.kinds.includes(filter);
}

function matchesQuery(t) {
  if (!query) return true;
  const hay = `${t.name} ${t.description} ${t.guide} ${t.kinds.join(' ')}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => hay.includes(word));
}

function visibleTrophies() {
  return trophies.filter((t) => matchesFilter(t) && matchesQuery(t));
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => isEarned(t.id)).length;
  const pct = Math.round((done / total) * 100);
  progressText.textContent = `${done} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  gradeCounts.innerHTML = '';
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const all = trophies.filter((t) => t.grade === grade).length;
    const got = trophies.filter((t) => t.grade === grade && isEarned(t.id)).length;
    const span = document.createElement('span');
    span.className = `grade-pill grade-${grade}`;
    span.textContent = `${gradeLabel(grade)} ${got}/${all}`;
    gradeCounts.append(span);
  }
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = 'trophy-card' + (isEarned(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
  li.dataset.id = String(t.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => {
    toggleEarned(t.id, box.checked);
    renderAll();
  });
  li.append(box);

  const body = document.createElement('div');
  body.className = 'card-body';
  const hidden = isHiddenBySpoiler(t);
  const name = document.createElement('h3');
  name.textContent = hidden ? 'Hidden story trophy' : t.name;
  body.append(name);
  const desc = document.createElement('p');
  desc.className = 'official';
  desc.textContent = hidden ? 'Hidden until earned — turn spoiler mode off or earn it to reveal.' : t.description;
  body.append(desc);
  const tags = document.createElement('p');
  tags.className = 'tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${t.grade}`;
  gradeTag.textContent = gradeLabel(t.grade);
  tags.append(gradeTag);
  if (t.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag tag-hidden';
    hiddenTag.textContent = 'Hidden on PSN';
    tags.append(hiddenTag);
  }
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag tag-missable';
    missTag.textContent = 'Missable';
    tags.append(missTag);
  }
  if (t.timeSensitive) {
    const timeTag = document.createElement('span');
    timeTag.className = 'tag tag-time';
    timeTag.textContent = 'Time-sensitive';
    tags.append(timeTag);
  }
  if (t.count) {
    const countTag = document.createElement('span');
    countTag.className = 'tag tag-count';
    countTag.textContent = `Target: ${t.count.toLocaleString('en-US')}`;
    tags.append(countTag);
  }
  body.append(tags);
  li.append(body);
  li.addEventListener('click', () => {
    selectedId = t.id;
    renderAll();
  });
  return li;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(trophyCard));
  countLine.textContent = filter === 'online'
    ? 'Online: 0 trophies'
    : `Showing ${shown.length} of ${trophies.length} trophies`;
  if (filter === 'online') {
    emptyState.hidden = false;
    emptyState.textContent = 'No online trophies: GTA VI launches as a single-player game with no GTA Online at launch, and none of the 55 trophies needs online play. (Source: Planet GTA 6 trophy list; GTA Six Insider.)';
  } else if (shown.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = 'Nothing matches — clear the search or pick another filter.';
  } else {
    emptyState.hidden = true;
  }
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = selectedId ? byId.get(selectedId) : null;
  if (!t) {
    const hint = document.createElement('div');
    hint.className = 'detail-empty';
    hint.innerHTML = '<h2>Pick a trophy</h2><p>Click any trophy in the list to read its guide and sources here. The guide stays in your own words and cites where each fact comes from.</p><p><strong>Roadmap in short:</strong> story first (Chapters 1–4, then the finale), strangers and side missions next, then activities and robberies, then collectibles and exploration. One thing to do early: the Chapter 1 balcony meditation.</p>';
    detailEl.append(hint);
    return;
  }
  const hidden = isHiddenBySpoiler(t);
  const wrap = document.createElement('div');

  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : t.name;
  wrap.append(title);

  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = `${gradeLabel(t.grade)} trophy · Stage ${t.stage} of the roadmap${t.hidden ? ' · Hidden on PSN until earned' : ''}${t.missable ? ' · MISSABLE' : ''}`;
  wrap.append(meta);

  const desc = document.createElement('p');
  desc.className = 'official';
  desc.textContent = hidden ? 'Hidden until earned.' : t.description;
  wrap.append(desc);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler mode is on. Earn this trophy (or turn spoiler mode off) to see its guide.';
    wrap.append(note);
  } else {
    const guideTitle = document.createElement('h3');
    guideTitle.textContent = 'Guide';
    wrap.append(guideTitle);
    for (const paragraph of t.guide.split(/(?<=[.!?])\s+(?=[A-Z“])/)) {
      const p = document.createElement('p');
      p.textContent = paragraph;
      wrap.append(p);
    }
    const srcTitle = document.createElement('h3');
    srcTitle.textContent = 'Sources';
    wrap.append(srcTitle);
    const srcList = document.createElement('ul');
    srcList.className = 'sources';
    for (const s of t.sources) {
      const item = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      item.append(a);
      srcList.append(item);
    }
    wrap.append(srcList);
  }

  const toggle = document.createElement('label');
  toggle.className = 'detail-earned';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(t.id);
  box.addEventListener('change', () => {
    toggleEarned(t.id, box.checked);
    renderAll();
  });
  toggle.append(box, document.createTextNode(' I have earned this trophy'));
  wrap.append(toggle);
  detailEl.append(wrap);
}

function renderRoadmap() {
  const stagesEl = document.getElementById('roadmapStages');
  stagesEl.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    li.className = 'stage';
    const done = stage.ids.filter((id) => isEarned(id)).length;
    const head = document.createElement('h3');
    head.textContent = `Stage ${stage.n} — ${stage.title}`;
    li.append(head);
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    li.append(blurb);
    const chips = document.createElement('p');
    chips.className = 'stage-chips';
    for (const id of stage.ids) {
      const t = byId.get(id);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'stage-chip' + (isEarned(id) ? ' earned' : '');
      const hidden = isHiddenBySpoiler(t);
      chip.textContent = `${hidden ? 'Hidden story trophy' : t.name} · ${gradeLabel(t.grade)}${t.missable ? ' · MISSABLE' : ''}`;
      chip.addEventListener('click', () => {
        selectedId = id;
        view = 'checklist';
        filter = 'all';
        query = '';
        searchInput.value = '';
        syncControls();
        renderAll();
        document.getElementById('checklistView').scrollIntoView();
      });
      chips.append(chip);
    }
    li.append(chips);
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} of ${stage.ids.length} earned in this stage`;
    li.append(count);
    stagesEl.append(li);
  }
}

function syncControls() {
  spoilerInput.checked = spoiler;
  document.querySelectorAll('#filters .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.filter === filter);
  });
  document.getElementById('tabChecklist').classList.toggle('active', view === 'checklist');
  document.getElementById('tabRoadmap').classList.toggle('active', view === 'roadmap');
  document.getElementById('checklistView').hidden = view !== 'checklist';
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
}

function renderAll() {
  syncControls();
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
}

document.querySelectorAll('#filters .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    renderAll();
  });
});

searchInput.addEventListener('input', () => {
  query = searchInput.value.trim();
  renderList();
});

spoilerInput.addEventListener('change', () => {
  spoiler = spoilerInput.checked;
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
  renderAll();
});

document.getElementById('tabChecklist').addEventListener('click', () => {
  view = 'checklist';
  renderAll();
});
document.getElementById('tabRoadmap').addEventListener('click', () => {
  view = 'roadmap';
  renderAll();
});
document.getElementById('showMissable').addEventListener('click', () => {
  filter = 'missable';
  view = 'checklist';
  selectedId = 28;
  renderAll();
  document.getElementById('checklistView').scrollIntoView();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', platform: 'PlayStation 5', earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const valid = ids.map(Number).filter((id) => byId.has(id));
    if (valid.length === 0) throw new Error('no valid trophy ids');
    earned = new Set(valid);
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a progress export from this guide.');
  }
  event.target.value = '';
});

renderAll();
