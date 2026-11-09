/**
 * Investor Ops — daily task dashboard + nightly report.
 *
 * Lives inside a Google Sheet owned by the team lead account.
 * The Sheet is the database; the web app (Index.html) is the UI;
 * a time trigger emails the founder after every shift.
 *
 * Work day = the shift. The shift runs 6 PM – 3 AM IST, so anything
 * logged between 12:00 noon and 11:59 AM the next day counts as the
 * shift that started on the first day.
 */

const TZ = 'Asia/Kolkata';
const SHIFT_ROLLOVER_HOURS = 12; // day boundary at 12:00 noon IST
const REPORT_HOUR = 4;           // 4 AM IST

const SHEETS = {
  tasks: 'Tasks',
  updates: 'Updates',
  team: 'Team',
  categories: 'Categories',
  config: 'Config',
};

const TASK_COLS = [
  'id', 'title', 'owner', 'assignedBy', 'investor', 'category', 'priority',
  'dueDate', 'status', 'createdAt', 'createdShift', 'updatedAt', 'doneShift',
  'archived', 'archivedShift',
];
const UPDATE_COLS = ['ts', 'shift', 'taskId', 'by', 'type', 'text'];

const STATUSES = ['To do', 'In progress', 'Blocked', 'Done'];
const PRIORITIES = ['High', 'Medium', 'Low'];

const SEED_TEAM = [
  ['Rohan Pradhan', 'rohanpradhan@jupitertexas.com', 'Investor Ops Manager', 'Yes'],
  ['Sonia Bhati', 'soniabhati@jupitertexas.com', 'Investor Ops Manager', 'Yes'],
  ['Megha Pradhan', 'meghapradhan@jupitertexas.com', 'Senior, Investor Ops', 'Yes'],
  ['Bharath Gangula', 'bharath@jupitertexas.com', 'Founder', 'No'],
];
const SEED_CATEGORIES = [
  'Investor follow-up', 'Onboarding', 'KYC / Documents', 'Reporting',
  'Call / Meeting', 'Capital call / Distribution', 'Internal', 'Other',
];
const SEED_CONFIG = [
  ['REPORT_TO', 'bharath@jupitertexas.com', 'Who receives the nightly report (comma-separate for more)'],
  ['REPORT_CC', '', 'Optional CC on the nightly report'],
  ['WEBAPP_URL', '', 'Paste the web app URL here after deploying (used for links in the email)'],
  ['TEAM_NAME', 'Investor Operations', 'Shown in the header and email'],
];

/* ------------------------------------------------------------------ */
/* One-time setup                                                      */
/* ------------------------------------------------------------------ */

/** Run once from the Apps Script editor. Safe to run again. */
function setup() {
  const ss = SpreadsheetApp.getActive();
  ensureSheet_(ss, SHEETS.tasks, TASK_COLS);
  ensureSheet_(ss, SHEETS.updates, UPDATE_COLS);
  const team = ensureSheet_(ss, SHEETS.team, ['Name', 'Email', 'Role', 'Takes tasks']);
  const cats = ensureSheet_(ss, SHEETS.categories, ['Category']);
  const cfg = ensureSheet_(ss, SHEETS.config, ['Key', 'Value', 'Notes']);

  if (team.getLastRow() < 2) team.getRange(2, 1, SEED_TEAM.length, 4).setValues(SEED_TEAM);
  if (cats.getLastRow() < 2) cats.getRange(2, 1, SEED_CATEGORIES.length, 1).setValues(SEED_CATEGORIES.map(c => [c]));
  if (cfg.getLastRow() < 2) cfg.getRange(2, 1, SEED_CONFIG.length, 3).setValues(SEED_CONFIG);

  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) ss.deleteSheet(defaultSheet);

  installReportTrigger();
  ss.setSpreadsheetTimeZone(TZ);
  return 'Setup complete. Next: Deploy → New deployment → Web app.';
}

/** (Re)creates the single nightly report trigger. */
function installReportTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendNightlyReport')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendNightlyReport')
    .timeBased().atHour(REPORT_HOUR).nearMinute(0).everyDays(1).inTimezone(TZ)
    .create();
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  // Plain text everywhere so Sheets never rewrites our ISO dates.
  sh.getRange(1, 1, sh.getMaxRows(), Math.max(headers.length, sh.getMaxColumns())).setNumberFormat('@');
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ------------------------------------------------------------------ */
/* Web app entry                                                       */
/* ------------------------------------------------------------------ */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Investor Ops')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/* ------------------------------------------------------------------ */

function shiftOf_(date) {
  const shifted = new Date(date.getTime() - SHIFT_ROLLOVER_HOURS * 3600 * 1000);
  return Utilities.formatDate(shifted, TZ, 'yyyy-MM-dd');
}
function nowIso_() { return new Date().toISOString(); }
function currentShift_() { return shiftOf_(new Date()); }

function dayDiff_(fromYmd, toYmd) {
  const a = Date.UTC(+fromYmd.slice(0, 4), +fromYmd.slice(5, 7) - 1, +fromYmd.slice(8, 10));
  const b = Date.UTC(+toYmd.slice(0, 4), +toYmd.slice(5, 7) - 1, +toYmd.slice(8, 10));
  return Math.round((b - a) / 86400000);
}
function addDays_(ymd, n) {
  const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10) + n));
  return d.toISOString().slice(0, 10);
}
function prettyDay_(ymd) {
  const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10), 12));
  return Utilities.formatDate(d, 'UTC', 'EEE, d MMM yyyy');
}

/* ------------------------------------------------------------------ */
/* Data access                                                         */
/* ------------------------------------------------------------------ */

function sheet_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Missing sheet "' + name + '". Run setup() once from the script editor.');
  return sh;
}

function cellToString_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  return v === null || v === undefined ? '' : String(v);
}

function readRows_(name, cols) {
  const sh = sheet_(name);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const values = sh.getRange(2, 1, last - 1, cols.length).getValues();
  return values.map((row, i) => {
    const obj = { _row: i + 2 };
    cols.forEach((c, j) => { obj[c] = cellToString_(row[j]); });
    return obj;
  });
}

function appendRow_(name, cols, obj) {
  const sh = sheet_(name);
  const row = cols.map(c => (obj[c] === undefined || obj[c] === null ? '' : String(obj[c])));
  sh.getRange(sh.getLastRow() + 1, 1, 1, cols.length).setNumberFormat('@').setValues([row]);
}

function writeTask_(task) {
  const row = TASK_COLS.map(c => (task[c] === undefined || task[c] === null ? '' : String(task[c])));
  sheet_(SHEETS.tasks).getRange(task._row, 1, 1, TASK_COLS.length).setNumberFormat('@').setValues([row]);
}

function readTeam_() {
  const sh = sheet_(SHEETS.team);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 4).getValues()
    .filter(r => r[1])
    .map(r => ({
      name: String(r[0]).trim(),
      email: String(r[1]).trim().toLowerCase(),
      role: String(r[2]).trim(),
      takesTasks: String(r[3]).trim().toLowerCase() !== 'no',
    }));
}

function readCategories_() {
  const sh = sheet_(SHEETS.categories);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0]).trim()).filter(Boolean);
}

function readConfig_() {
  const sh = sheet_(SHEETS.config);
  const last = sh.getLastRow();
  const cfg = {};
  if (last >= 2) sh.getRange(2, 1, last - 1, 2).getValues().forEach(r => { if (r[0]) cfg[String(r[0]).trim()] = String(r[1]).trim(); });
  return cfg;
}

function webAppUrl_() {
  const cfg = readConfig_();
  if (cfg.WEBAPP_URL) return cfg.WEBAPP_URL;
  try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; }
}

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

function viewerEmail_() {
  try { return (Session.getActiveUser().getEmail() || '').toLowerCase(); } catch (e) { return ''; }
}

/** The signed-in Google user if they're on the team, else whoever the page says it is. */
function resolveActor_(claimed) {
  const team = readTeam_();
  const signedIn = viewerEmail_();
  if (team.some(m => m.email === signedIn)) return signedIn;
  const c = String(claimed || '').toLowerCase();
  if (team.some(m => m.email === c)) return c;
  throw new Error('Pick who you are first (top-right).');
}

/* ------------------------------------------------------------------ */
/* Day snapshot — the core view                                        */
/* ------------------------------------------------------------------ */

/**
 * Everything that was on the board for a given shift:
 *  - tasks created on/before that day and not finished before it
 *  - their status *as of the end of that day* (rebuilt from the log)
 *  - how many days each has been carried
 *  - every update logged during that shift
 */
function buildDay_(day, tasks, updates) {
  const statusLog = {};
  updates.forEach(u => {
    if (u.type !== 'status' && u.type !== 'created') return;
    if (u.shift > day) return;
    const prev = statusLog[u.taskId];
    if (!prev || u.ts >= prev.ts) statusLog[u.taskId] = { ts: u.ts, status: u.type === 'created' ? (u.text.split('|')[0] || 'To do') : u.text };
  });

  const lastNote = {};
  updates.forEach(u => {
    if (u.type !== 'note' || u.shift > day) return;
    if (!lastNote[u.taskId] || u.ts >= lastNote[u.taskId].ts) lastNote[u.taskId] = u;
  });

  const finishedOn = (t, d) => updates.some(u => u.taskId === t.id && u.shift === d &&
    ((u.type === 'status' && u.text === 'Done') || (u.type === 'created' && u.text.split('|')[0] === 'Done')));

  const visible = tasks
    .filter(t => t.createdShift && t.createdShift <= day)
    .filter(t => !(t.archived === 'yes' && t.archivedShift && t.archivedShift <= day))
    .map(t => {
      const status = (statusLog[t.id] && statusLog[t.id].status) || t.status || 'To do';
      const doneToday = status === 'Done' && finishedOn(t, day);
      const note = lastNote[t.id];
      return Object.assign({}, t, {
        status,
        doneToday,
        carried: Math.max(0, dayDiff_(t.createdShift, day)),
        overdue: !!(t.dueDate && t.dueDate < day && status !== 'Done'),
        lastNote: note ? { text: note.text, by: note.by, ts: note.ts } : null,
      });
    })
    // Finished on an earlier shift → off the board for this day.
    .filter(t => t.status !== 'Done' || t.doneToday);

  const dayUpdates = updates.filter(u => u.shift === day).sort((a, b) => (a.ts < b.ts ? 1 : -1));
  return { tasks: visible, updates: dayUpdates };
}

/* ------------------------------------------------------------------ */
/* API called from the page                                            */
/* ------------------------------------------------------------------ */

function apiBootstrap() {
  const cfg = readConfig_();
  return {
    me: viewerEmail_(),
    team: readTeam_(),
    categories: readCategories_(),
    statuses: STATUSES,
    priorities: PRIORITIES,
    today: currentShift_(),
    teamName: cfg.TEAM_NAME || 'Investor Operations',
  };
}

function apiGetDay(day) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(day || '') ? day : currentShift_();
  const snap = buildDay_(d, readRows_(SHEETS.tasks, TASK_COLS), readRows_(SHEETS.updates, UPDATE_COLS));
  return { day: d, today: currentShift_(), pretty: prettyDay_(d), tasks: snap.tasks, updates: snap.updates };
}

function apiGetTask(id) {
  const task = readRows_(SHEETS.tasks, TASK_COLS).find(t => t.id === id);
  if (!task) throw new Error('Task not found.');
  const history = readRows_(SHEETS.updates, UPDATE_COLS).filter(u => u.taskId === id).sort((a, b) => (a.ts < b.ts ? 1 : -1));
  return { task, history };
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function log_(taskId, by, type, text) {
  appendRow_(SHEETS.updates, UPDATE_COLS, { ts: nowIso_(), shift: currentShift_(), taskId, by, type, text });
}

function clean_(v, max) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, max || 300); }

function apiSaveTask(input, claimedActor) {
  return withLock_(() => {
    const actor = resolveActor_(claimedActor);
    const team = readTeam_();
    const title = clean_(input.title, 200);
    if (!title) throw new Error('Give the task a title.');
    const owner = String(input.owner || actor).toLowerCase();
    if (!team.some(m => m.email === owner)) throw new Error('Unknown owner.');
    const priority = PRIORITIES.indexOf(input.priority) >= 0 ? input.priority : 'Medium';
    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(input.dueDate || '') ? input.dueDate : '';
    const fields = {
      title, owner, priority, dueDate,
      investor: clean_(input.investor, 120),
      category: clean_(input.category, 80),
    };

    if (fields.category && readCategories_().indexOf(fields.category) < 0) {
      appendRow_(SHEETS.categories, ['c'], { c: fields.category });
    }

    if (input.id) {
      const task = readRows_(SHEETS.tasks, TASK_COLS).find(t => t.id === input.id);
      if (!task) throw new Error('Task not found.');
      const changes = [];
      Object.keys(fields).forEach(k => {
        if (task[k] !== fields[k]) { changes.push(k + ': ' + (fields[k] || '—')); task[k] = fields[k]; }
      });
      if (changes.length) {
        task.updatedAt = nowIso_();
        writeTask_(task);
        log_(task.id, actor, 'edit', changes.join(' · '));
      }
      const note = clean_(input.note, 1000);
      if (note) log_(task.id, actor, 'note', note);
      return task.id;
    }

    const id = 'T' + Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    const status = STATUSES.indexOf(input.status) >= 0 ? input.status : 'To do';
    const now = nowIso_();
    const shift = currentShift_();
    appendRow_(SHEETS.tasks, TASK_COLS, Object.assign({}, fields, {
      id, assignedBy: actor, status, createdAt: now, createdShift: shift, updatedAt: now,
      doneShift: status === 'Done' ? shift : '', archived: '', archivedShift: '',
    }));
    log_(id, actor, 'created', status + '|' + title);
    const note = clean_(input.note, 1000);
    if (note) log_(id, actor, 'note', note);
    return id;
  });
}

function apiSetStatus(id, status, claimedActor) {
  if (STATUSES.indexOf(status) < 0) throw new Error('Unknown status.');
  return withLock_(() => {
    const actor = resolveActor_(claimedActor);
    const task = readRows_(SHEETS.tasks, TASK_COLS).find(t => t.id === id);
    if (!task) throw new Error('Task not found.');
    if (task.status === status) return id;
    task.status = status;
    task.updatedAt = nowIso_();
    task.doneShift = status === 'Done' ? currentShift_() : '';
    writeTask_(task);
    log_(id, actor, 'status', status);
    return id;
  });
}

function apiAddNote(id, text, claimedActor) {
  const note = clean_(text, 1000);
  if (!note) throw new Error('Write an update first.');
  return withLock_(() => {
    const actor = resolveActor_(claimedActor);
    const task = readRows_(SHEETS.tasks, TASK_COLS).find(t => t.id === id);
    if (!task) throw new Error('Task not found.');
    task.updatedAt = nowIso_();
    writeTask_(task);
    log_(id, actor, 'note', note);
    return id;
  });
}

function apiArchiveTask(id, claimedActor) {
  return withLock_(() => {
    const actor = resolveActor_(claimedActor);
    const task = readRows_(SHEETS.tasks, TASK_COLS).find(t => t.id === id);
    if (!task) throw new Error('Task not found.');
    task.archived = 'yes';
    task.archivedShift = currentShift_();
    task.updatedAt = nowIso_();
    writeTask_(task);
    log_(id, actor, 'archived', 'Removed from board');
    return id;
  });
}

/* ------------------------------------------------------------------ */
/* Nightly report                                                      */
/* ------------------------------------------------------------------ */

/** Trigger target. At 4 AM the current shift is still the one that just ended. */
function sendNightlyReport() {
  sendReportFor_(currentShift_());
}

/** Run by hand from the editor to preview tonight's report in your own inbox. */
function sendTestReportToMe() {
  sendReportFor_(currentShift_(), Session.getEffectiveUser().getEmail());
}

function sendReportFor_(day, overrideTo) {
  const cfg = readConfig_();
  const to = overrideTo || cfg.REPORT_TO;
  if (!to) throw new Error('Set REPORT_TO in the Config sheet.');
  const team = readTeam_();
  const snap = buildDay_(day, readRows_(SHEETS.tasks, TASK_COLS), readRows_(SHEETS.updates, UPDATE_COLS));
  const html = renderReport_(day, snap, team, cfg);
  const opts = { to, subject: (cfg.TEAM_NAME || 'Investor Ops') + ' · Daily report · ' + prettyDay_(day), htmlBody: html, name: (cfg.TEAM_NAME || 'Investor Ops') };
  if (cfg.REPORT_CC && !overrideTo) opts.cc = cfg.REPORT_CC;
  MailApp.sendEmail(opts);
}

function esc_(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderReport_(day, snap, team, cfg) {
  const nameOf = e => (team.find(m => m.email === e) || {}).name || e;
  const first = e => nameOf(e).split(' ')[0];
  const url = webAppUrl_();
  const tasks = snap.tasks;
  const done = tasks.filter(t => t.doneToday);
  const open = tasks.filter(t => t.status !== 'Done');
  const blocked = open.filter(t => t.status === 'Blocked');
  const overdue = open.filter(t => t.overdue && t.status !== 'Blocked');
  const notesByTask = {};
  snap.updates.filter(u => u.type === 'note').forEach(u => { (notesByTask[u.taskId] = notesByTask[u.taskId] || []).push(u); });

  const ink = '#1d1d1f', sub = '#6e6e73', line = '#e5e5ea', bg = '#f5f5f7';
  const pill = (txt, fg, bgc) => `<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;color:${fg};background:${bgc};">${esc_(txt)}</span>`;
  const meta = t => [t.investor, t.category].filter(Boolean).map(esc_).join(' · ');
  const row = (t, extra) => `
    <tr><td style="padding:10px 0;border-top:1px solid ${line};">
      <div style="font-size:14px;color:${ink};font-weight:500;">${esc_(t.title)} ${extra || ''}</div>
      ${meta(t) ? `<div style="font-size:12px;color:${sub};margin-top:2px;">${meta(t)}</div>` : ''}
      ${(notesByTask[t.id] || []).slice(0, 2).map(n => `<div style="font-size:12px;color:${ink};margin-top:4px;">↳ ${esc_(n.text)} <span style="color:${sub};">— ${esc_(first(n.by))}</span></div>`).join('')}
    </td></tr>`;
  const section = (title, list, extraFn) => list.length ? `
    <div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${sub};margin:18px 0 4px;">${title} · ${list.length}</div>
    <table width="100%" cellpadding="0" cellspacing="0">${list.map(t => row(t, extraFn ? extraFn(t) : '')).join('')}</table>` : '';
  const stat = (n, label) => `<td align="center" style="padding:14px 6px;"><div style="font-size:26px;font-weight:600;color:${ink};">${n}</div><div style="font-size:11px;color:${sub};">${label}</div></td>`;

  const attention = blocked.concat(overdue);
  const people = team.filter(m => m.takesTasks);

  const personBlock = m => {
    const mine = tasks.filter(t => t.owner === m.email);
    const d = mine.filter(t => t.doneToday);
    const carry = mine.filter(t => t.status !== 'Done');
    const loose = snap.updates.filter(u => u.by === m.email && u.type === 'note' && !mine.some(t => t.id === u.taskId));
    if (!mine.length && !loose.length) return `
      <div style="background:#fff;border-radius:14px;padding:16px 18px;margin-top:12px;">
        <div style="font-size:15px;font-weight:600;color:${ink};">${esc_(m.name)}</div>
        <div style="font-size:13px;color:${sub};margin-top:4px;">Nothing logged this shift.</div></div>`;
    return `
      <div style="background:#fff;border-radius:14px;padding:16px 18px;margin-top:12px;">
        <div style="font-size:15px;font-weight:600;color:${ink};">${esc_(m.name)}
          <span style="font-weight:400;color:${sub};font-size:13px;"> · ${d.length} done · ${carry.length} open</span></div>
        ${section('Completed', d)}
        ${section('Carrying over', carry, t => [
          t.status === 'Blocked' ? pill('Blocked', '#b42318', '#fee4e2') : t.status === 'In progress' ? pill('In progress', '#0b5cad', '#e3efff') : '',
          t.carried ? pill('Day ' + (t.carried + 1), '#8a5a00', '#fff1d6') : '',
          t.priority === 'High' ? pill('High', '#b42318', '#fee4e2') : '',
        ].join(' '))}
      </div>`;
  };

  return `
  <div style="background:${bg};padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;">
      <div style="font-size:12px;color:${sub};">${esc_(cfg.TEAM_NAME || 'Investor Operations')}</div>
      <div style="font-size:24px;font-weight:600;color:${ink};margin:2px 0 16px;">Daily report — ${esc_(prettyDay_(day))}</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;"><tr>
        ${stat(done.length, 'Completed')}${stat(open.length, 'Open')}${stat(blocked.length, 'Blocked')}${stat(open.filter(t => t.carried > 0).length, 'Carried over')}
      </tr></table>
      ${attention.length ? `
      <div style="background:#fff;border-radius:14px;padding:16px 18px;margin-top:12px;border-left:4px solid #d92d20;">
        <div style="font-size:15px;font-weight:600;color:${ink};">Needs attention</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">${attention.map(t => row(t,
          (t.status === 'Blocked' ? pill('Blocked', '#b42318', '#fee4e2') : pill('Overdue · due ' + t.dueDate, '#8a5a00', '#fff1d6')) +
          ' <span style="font-size:12px;color:' + sub + ';font-weight:400;">' + esc_(first(t.owner)) + '</span>')).join('')}</table>
      </div>` : ''}
      ${people.map(personBlock).join('')}
      ${url ? `<div style="text-align:center;margin:22px 0 4px;"><a href="${esc_(url)}?date=${day}" style="display:inline-block;background:${ink};color:#fff;text-decoration:none;padding:11px 20px;border-radius:999px;font-size:14px;font-weight:500;">Open dashboard</a></div>` : ''}
      <div style="text-align:center;font-size:11px;color:${sub};margin-top:14px;">Shift of ${esc_(prettyDay_(day))}, 6 PM – 3 AM IST · sent automatically</div>
    </div>
  </div>`;
}
