/**
 * Investor Ops — daily task board, 6 PM reminders, reviewed 4 AM report.
 *
 * The Google Sheet is the database, Index.html is the dashboard, and one
 * 5-minute timer ("tick") runs the schedule:
 *   03:30 IST  review email to the report reviewer (Megha)
 *   04:00 IST  report to Bharath — unless the reviewer stopped it
 *   18:00 IST  each person gets a reminder of their carried-over tasks
 *
 * Work day = the shift. The shift runs 6 PM – 3 AM IST, so anything logged
 * between 12:00 noon and 11:59 AM next day counts as the shift that started
 * on the first day.
 */

const TZ = 'Asia/Kolkata';
const SHIFT_ROLLOVER_HOURS = 12;

// Schedule windows (IST, 24h "HH:mm"). A window instead of an exact minute
// means a late-running Google timer still does the job exactly once.
const REVIEW_WINDOW = ['03:30', '04:00'];
const REPORT_WINDOW = ['04:00', '06:00'];
const REMINDER_WINDOW = ['18:00', '20:00'];

const SHEETS = {
  tasks: 'Tasks',
  updates: 'Updates',
  team: 'Team',
  categories: 'Categories',
  config: 'Config',
  reportLog: 'Report log',
};

// New columns are only ever appended at the end, so older sheets keep working.
const TASK_COLS = [
  'id', 'title', 'owner', 'assignedBy', 'investor', 'category', 'priority',
  'dueDate', 'status', 'createdAt', 'createdShift', 'updatedAt', 'doneShift',
  'archived', 'archivedShift', 'collaborators',
];
const UPDATE_COLS = ['ts', 'shift', 'taskId', 'by', 'type', 'text'];
const REPORT_LOG_COLS = ['ts', 'shift', 'event', 'by', 'detail'];

const STATUSES = ['To do', 'In progress', 'Waiting', 'Done'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const LEGACY_STATUS = { Blocked: 'Waiting' };

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
  ['TEAM_NAME', 'Investor Operations', 'Shown in the dashboard header and in emails'],
  ['REPORT_TO', 'bharath@jupitertexas.com', 'Who receives the 4 AM report (comma-separate for more)'],
  ['REPORT_CC', '', 'Optional CC on the 4 AM report'],
  ['REPORT_REVIEWER', 'meghapradhan@jupitertexas.com', 'Gets the 3:30 AM review email and can stop or send the report (comma-separate for a backup)'],
  ['REMINDERS_ON', 'Yes', 'Yes = everyone gets a 6 PM email of their carried-over tasks. No = off'],
  ['WEBAPP_URL', '', 'Paste the web app URL here after deploying (used for links in emails)'],
];

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

/** Run once from the editor — and again after pasting new code. Safe to repeat. */
function setup() {
  const ss = SpreadsheetApp.getActive();
  ensureSheet_(ss, SHEETS.tasks, TASK_COLS);
  ensureSheet_(ss, SHEETS.updates, UPDATE_COLS);
  ensureSheet_(ss, SHEETS.reportLog, REPORT_LOG_COLS);
  const team = ensureSheet_(ss, SHEETS.team, ['Name', 'Email', 'Role', 'Takes tasks']);
  const cats = ensureSheet_(ss, SHEETS.categories, ['Category']);
  const cfg = ensureSheet_(ss, SHEETS.config, ['Key', 'Value', 'Notes']);

  if (team.getLastRow() < 2) team.getRange(2, 1, SEED_TEAM.length, 4).setValues(SEED_TEAM);
  if (cats.getLastRow() < 2) cats.getRange(2, 1, SEED_CATEGORIES.length, 1).setValues(SEED_CATEGORIES.map(c => [c]));

  // Add any config keys that are missing (keeps values you already set).
  const have = readConfig_();
  SEED_CONFIG.filter(r => !(r[0] in have)).forEach(r => {
    cfg.getRange(cfg.getLastRow() + 1, 1, 1, 3).setValues([r]);
  });

  const blank = ss.getSheetByName('Sheet1');
  if (blank && ss.getSheets().length > 1 && blank.getLastRow() === 0) ss.deleteSheet(blank);

  installTriggers();
  ss.setSpreadsheetTimeZone(TZ);
  return 'Setup complete. Next: Deploy → New deployment → Web app.';
}

/** One 5-minute timer runs the whole schedule. Removes timers from older versions. */
function installTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(t => ['tick', 'sendNightlyReport'].indexOf(t.getHandlerFunction()) >= 0)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('tick').timeBased().everyMinutes(5).create();
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.getRange(1, 1, sh.getMaxRows(), Math.max(headers.length, sh.getMaxColumns())).setNumberFormat('@');
  const current = sh.getLastRow() ? sh.getRange(1, 1, 1, headers.length).getValues()[0] : [];
  if (headers.some((h, i) => String(current[i] || '') !== h)) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ------------------------------------------------------------------ */
/* Web app                                                             */
/* ------------------------------------------------------------------ */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Investor Ops')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

function shiftOf_(date) {
  return Utilities.formatDate(new Date(date.getTime() - SHIFT_ROLLOVER_HOURS * 3600 * 1000), TZ, 'yyyy-MM-dd');
}
function nowIso_() { return new Date().toISOString(); }
function currentShift_() { return shiftOf_(new Date()); }
function istClock_() { return Utilities.formatDate(new Date(), TZ, 'HH:mm'); }
function inWindow_(hm, w) { return hm >= w[0] && hm < w[1]; }

function dayDiff_(fromYmd, toYmd) {
  const p = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Math.round((p(toYmd) - p(fromYmd)) / 86400000);
}
function prettyDay_(ymd) {
  const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10), 12));
  return Utilities.formatDate(d, 'UTC', 'EEE, d MMM yyyy');
}
function prettyTime_(iso) { return Utilities.formatDate(new Date(iso), TZ, 'h:mm a'); }

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
  return sh.getRange(2, 1, last - 1, cols.length).getValues().map((row, i) => {
    const o = { _row: i + 2 };
    cols.forEach((c, j) => { o[c] = cellToString_(row[j]); });
    return o;
  });
}
function appendRow_(name, cols, obj) {
  const sh = sheet_(name);
  const row = cols.map(c => (obj[c] === undefined || obj[c] === null ? '' : String(obj[c])));
  sh.getRange(sh.getLastRow() + 1, 1, 1, cols.length).setNumberFormat('@').setValues([row]);
}

function readTasks_() {
  return readRows_(SHEETS.tasks, TASK_COLS).map(t => {
    t.status = LEGACY_STATUS[t.status] || t.status || 'To do';
    t.collaborators = t.collaborators ? t.collaborators.split(',').map(s => s.trim()).filter(Boolean) : [];
    return t;
  });
}
function readUpdates_() {
  return readRows_(SHEETS.updates, UPDATE_COLS).map(u => {
    if (u.type === 'status') u.text = LEGACY_STATUS[u.text] || u.text;
    if (u.type === 'created') { const p = u.text.split('|'); p[0] = LEGACY_STATUS[p[0]] || p[0]; u.text = p.join('|'); }
    return u;
  });
}
function writeTask_(task) {
  const t = Object.assign({}, task, { collaborators: (task.collaborators || []).join(',') });
  const row = TASK_COLS.map(c => (t[c] === undefined || t[c] === null ? '' : String(t[c])));
  sheet_(SHEETS.tasks).getRange(task._row, 1, 1, TASK_COLS.length).setNumberFormat('@').setValues([row]);
}

function readTeam_() {
  const sh = sheet_(SHEETS.team);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 4).getValues().filter(r => r[1]).map(r => ({
    name: String(r[0]).trim(),
    email: String(r[1]).trim().toLowerCase(),
    role: String(r[2]).trim(),
    takesTasks: String(r[3]).trim().toLowerCase() !== 'no',
  }));
}
function readCategories_() {
  const sh = sheet_(SHEETS.categories);
  const last = sh.getLastRow();
  return last < 2 ? [] : sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0]).trim()).filter(Boolean);
}
function readConfig_() {
  const sh = sheet_(SHEETS.config);
  const last = sh.getLastRow();
  const cfg = {};
  if (last >= 2) sh.getRange(2, 1, last - 1, 2).getValues().forEach(r => { if (r[0]) cfg[String(r[0]).trim()] = String(r[1]).trim(); });
  return cfg;
}
function emails_(s) { return String(s || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean); }
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
/* Day snapshot                                                        */
/* ------------------------------------------------------------------ */

/**
 * The board for one shift: tasks that existed by then and weren't finished
 * earlier, each with its status *as of the end of that shift*.
 */
function buildDay_(day, tasks, updates) {
  const statusAt = {};
  const lastNote = {};
  updates.forEach(u => {
    if (u.shift > day) return;
    if (u.type === 'status' || u.type === 'created') {
      const s = u.type === 'created' ? (u.text.split('|')[0] || 'To do') : u.text;
      if (!statusAt[u.taskId] || u.ts >= statusAt[u.taskId].ts) statusAt[u.taskId] = { ts: u.ts, status: s };
    }
    if (u.type === 'note' && (!lastNote[u.taskId] || u.ts >= lastNote[u.taskId].ts)) lastNote[u.taskId] = u;
  });
  const finishedOn = (id, d) => updates.some(u => u.taskId === id && u.shift === d &&
    ((u.type === 'status' && u.text === 'Done') || (u.type === 'created' && u.text.split('|')[0] === 'Done')));

  const board = tasks
    .filter(t => t.createdShift && t.createdShift <= day)
    .filter(t => !(t.archived === 'yes' && t.archivedShift && t.archivedShift <= day))
    .map(t => {
      const status = (statusAt[t.id] && statusAt[t.id].status) || t.status;
      const doneToday = status === 'Done' && finishedOn(t.id, day);
      const n = lastNote[t.id];
      return Object.assign({}, t, {
        status,
        doneToday,
        carried: Math.max(0, dayDiff_(t.createdShift, day)),
        overdue: !!(t.dueDate && t.dueDate < day && status !== 'Done'),
        lastNote: n ? { text: n.text, by: n.by, ts: n.ts } : null,
      });
    })
    .filter(t => t.status !== 'Done' || t.doneToday);

  return { tasks: board, updates: updates.filter(u => u.shift === day).sort((a, b) => (a.ts < b.ts ? 1 : -1)) };
}

/* ------------------------------------------------------------------ */
/* Report state (one row per event in the "Report log" sheet)          */
/* ------------------------------------------------------------------ */

function reportState_(day, log) {
  const ev = (log || readRows_(SHEETS.reportLog, REPORT_LOG_COLS)).filter(r => r.shift === day);
  const last = type => ev.filter(r => type.indexOf(r.event) >= 0).pop();
  const decision = last(['stopped', 'resumed']);
  const sent = last(['sent']);
  const notSent = last(['not sent', 'nothing to send']);
  return {
    day,
    stopped: !!(decision && decision.event === 'stopped'),
    decidedBy: decision ? decision.by : '',
    decidedAt: decision ? decision.ts : '',
    sent: !!sent,
    sentAt: sent ? sent.ts : '',
    sentBy: sent ? sent.by : '',
    finalNotSent: !!notSent,
    finalReason: notSent ? notSent.event : '',
    reviewEmailed: ev.some(r => r.event === 'review emailed'),
    remindersSent: ev.some(r => r.event === 'reminders sent'),
  };
}
function logReport_(day, event, by, detail) {
  appendRow_(SHEETS.reportLog, REPORT_LOG_COLS, { ts: nowIso_(), shift: day, event, by: by || 'system', detail: detail || '' });
}
function reviewers_() { return emails_(readConfig_().REPORT_REVIEWER); }

/* ------------------------------------------------------------------ */
/* API for the dashboard                                               */
/* ------------------------------------------------------------------ */

function apiBootstrap() {
  const cfg = readConfig_();
  const team = readTeam_();
  return {
    me: viewerEmail_(),
    team,
    categories: readCategories_(),
    statuses: STATUSES,
    priorities: PRIORITIES,
    today: currentShift_(),
    teamName: cfg.TEAM_NAME || 'Investor Operations',
    reviewers: reviewers_(),
    reportTo: emails_(cfg.REPORT_TO),
    remindersOn: String(cfg.REMINDERS_ON || 'Yes').toLowerCase() !== 'no',
  };
}

function apiGetDay(day) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(day || '') ? day : currentShift_();
  const snap = buildDay_(d, readTasks_(), readUpdates_());
  return { day: d, today: currentShift_(), clock: istClock_(), tasks: snap.tasks, updates: snap.updates, report: reportState_(d) };
}

function apiGetTask(id) {
  const task = readTasks_().find(t => t.id === id);
  if (!task) throw new Error('Task not found.');
  return { task, history: readUpdates_().filter(u => u.taskId === id).sort((a, b) => (a.ts < b.ts ? 1 : -1)) };
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

/**
 * Create or edit a task. Status change and the update note are applied in
 * the same call, so one Save = one consistent change.
 */
function apiSaveTask(input, claimedActor) {
  return withLock_(() => {
    const actor = resolveActor_(claimedActor);
    const team = readTeam_();
    const title = clean_(input.title, 200);
    if (!title) throw new Error('Give the task a title.');
    const owner = String(input.owner || actor).toLowerCase();
    if (!team.some(m => m.email === owner)) throw new Error('Unknown owner.');
    const collaborators = (Array.isArray(input.collaborators) ? input.collaborators : [])
      .map(e => String(e).toLowerCase())
      .filter((e, i, a) => e !== owner && a.indexOf(e) === i && team.some(m => m.email === e));
    const fields = {
      title, owner, collaborators,
      priority: PRIORITIES.indexOf(input.priority) >= 0 ? input.priority : 'Medium',
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(input.dueDate || '') ? input.dueDate : '',
      investor: clean_(input.investor, 120),
      category: clean_(input.category, 80),
    };
    const status = STATUSES.indexOf(input.status) >= 0 ? input.status : 'To do';
    const note = clean_(input.note, 1000);

    if (fields.category && readCategories_().indexOf(fields.category) < 0) {
      appendRow_(SHEETS.categories, ['c'], { c: fields.category });
    }

    if (input.id) {
      const task = readTasks_().find(t => t.id === input.id);
      if (!task) throw new Error('Task not found.');
      const nameOf = e => (team.find(m => m.email === e) || {}).name || e;
      const show = (k, v) => k === 'owner' ? nameOf(v) : k === 'collaborators' ? (v.map(nameOf).join(', ') || 'nobody') : (v || '—');
      const changes = [];
      Object.keys(fields).forEach(k => {
        const a = k === 'collaborators' ? task[k].join(',') : task[k];
        const b = k === 'collaborators' ? fields[k].join(',') : fields[k];
        if (a !== b) { changes.push(k + ' → ' + show(k, fields[k])); task[k] = fields[k]; }
      });
      const statusChanged = task.status !== status;
      if (statusChanged) {
        task.status = status;
        task.doneShift = status === 'Done' ? currentShift_() : '';
      }
      if (changes.length || statusChanged || note) {
        task.updatedAt = nowIso_();
        writeTask_(task);
      }
      if (changes.length) log_(task.id, actor, 'edit', changes.join(' · '));
      if (statusChanged) log_(task.id, actor, 'status', status);
      if (note) log_(task.id, actor, 'note', note);
      return task.id;
    }

    const id = 'T' + Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    const now = nowIso_();
    const shift = currentShift_();
    appendRow_(SHEETS.tasks, TASK_COLS, Object.assign({}, fields, {
      collaborators: collaborators.join(','),
      id, assignedBy: actor, status, createdAt: now, createdShift: shift, updatedAt: now,
      doneShift: status === 'Done' ? shift : '', archived: '', archivedShift: '',
    }));
    log_(id, actor, 'created', status + '|' + title);
    if (note) log_(id, actor, 'note', note);
    return id;
  });
}

/** Quick tick on a card: Done ↔ back to In progress. */
function apiSetStatus(id, status, claimedActor) {
  if (STATUSES.indexOf(status) < 0) throw new Error('Unknown status.');
  return withLock_(() => {
    const actor = resolveActor_(claimedActor);
    const task = readTasks_().find(t => t.id === id);
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

function apiArchiveTask(id, claimedActor) {
  return withLock_(() => {
    const actor = resolveActor_(claimedActor);
    const task = readTasks_().find(t => t.id === id);
    if (!task) throw new Error('Task not found.');
    task.archived = 'yes';
    task.archivedShift = currentShift_();
    task.updatedAt = nowIso_();
    writeTask_(task);
    log_(id, actor, 'archived', 'Removed from board');
    return id;
  });
}

/** The exact email Bharath would get, for the review screen. */
function apiReportPreview(day) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(day || '') ? day : currentShift_();
  const cfg = readConfig_();
  return { html: renderReport_(d, buildDay_(d, readTasks_(), readUpdates_()), readTeam_(), cfg), state: reportState_(d) };
}

/**
 * Reviewer decision for tonight's report.
 *  stop   — don't send it this shift
 *  resume — undo a stop (it goes at 4 AM again)
 *  send   — send it right now
 */
function apiDecideReport(day, decision, claimedActor) {
  return withLock_(() => {
    const actor = resolveActor_(claimedActor);
    if (reviewers_().indexOf(actor) < 0) throw new Error('Only the report reviewer can change tonight\'s report.');
    if (day !== currentShift_()) throw new Error('You can only change the report for the current shift.');
    const st = reportState_(day);
    if (st.sent) throw new Error('This report was already sent.');
    if (st.finalNotSent) throw new Error('This shift\'s report is closed.');
    if (decision === 'stop') logReport_(day, 'stopped', actor);
    else if (decision === 'resume') logReport_(day, 'resumed', actor);
    else if (decision === 'send') { sendReport_(day); logReport_(day, 'sent', actor, 'sent early by reviewer'); }
    else throw new Error('Unknown choice.');
    return reportState_(day);
  });
}

/* ------------------------------------------------------------------ */
/* Scheduler                                                           */
/* ------------------------------------------------------------------ */

/** Runs every 5 minutes. Each job runs at most once per shift (tracked in "Report log"). */
function tick() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const hm = istClock_();
    const day = currentShift_();
    const cfg = readConfig_();
    const st = reportState_(day);

    if (inWindow_(hm, REVIEW_WINDOW) && !st.reviewEmailed && !st.stopped && !st.sent && !st.finalNotSent) {
      sendReviewEmail_(day);
      logReport_(day, 'review emailed', 'system', reviewers_().join(', '));
    }

    if (inWindow_(hm, REPORT_WINDOW) && !st.sent && !st.finalNotSent) {
      if (st.stopped) {
        logReport_(day, 'not sent', st.decidedBy, 'stopped by reviewer');
      } else if (!hasAnything_(day)) {
        logReport_(day, 'nothing to send', 'system', 'no tasks or updates this shift');
      } else {
        sendReport_(day);
        logReport_(day, 'sent', 'system', 'scheduled 4 AM');
      }
    }

    if (inWindow_(hm, REMINDER_WINDOW) && !st.remindersSent && String(cfg.REMINDERS_ON || 'Yes').toLowerCase() !== 'no') {
      const n = sendReminders_(day);
      logReport_(day, 'reminders sent', 'system', n + ' people');
    }
  } finally {
    lock.releaseLock();
  }
}

function hasAnything_(day) {
  const snap = buildDay_(day, readTasks_(), readUpdates_());
  return snap.tasks.length > 0 || snap.updates.length > 0;
}

/* ------------------------------------------------------------------ */
/* Emails                                                              */
/* ------------------------------------------------------------------ */

const INK = '#1d1d1f', SUB = '#6e6e73', LINE = '#e5e5ea', BG = '#f5f5f7';

function esc_(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function pill_(txt, fg, bg) {
  return `<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;color:${fg};background:${bg};">${esc_(txt)}</span>`;
}
function button_(href, label, dark) {
  return `<a href="${esc_(href)}" style="display:inline-block;background:${dark ? INK : '#fff'};color:${dark ? '#fff' : INK};border:1px solid ${dark ? INK : LINE};text-decoration:none;padding:11px 20px;border-radius:999px;font-size:14px;font-weight:500;">${esc_(label)}</a>`;
}
function wrap_(inner) {
  return `<div style="background:${BG};padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;">${inner}</div></div>`;
}
function statusPills_(t) {
  return [
    t.status === 'Waiting' ? pill_('Waiting on others', '#a15c00', '#fff1d6') : t.status === 'In progress' ? pill_('In progress', '#0b5cad', '#e3efff') : '',
    t.carried ? pill_('Day ' + (t.carried + 1), '#6e6e73', '#efeff2') : '',
    t.overdue ? pill_('Overdue', '#c4291c', '#fde7e5') : '',
    t.priority === 'High' ? pill_('High priority', '#c4291c', '#fde7e5') : '',
  ].filter(Boolean).join(' ');
}

function sendReport_(day) {
  const cfg = readConfig_();
  const to = cfg.REPORT_TO;
  if (!to) throw new Error('Set REPORT_TO in the Config sheet.');
  const snap = buildDay_(day, readTasks_(), readUpdates_());
  const opts = {
    to,
    subject: (cfg.TEAM_NAME || 'Investor Ops') + ' · Daily report · ' + prettyDay_(day),
    htmlBody: renderReport_(day, snap, readTeam_(), cfg),
    name: cfg.TEAM_NAME || 'Investor Ops',
  };
  if (cfg.REPORT_CC) opts.cc = cfg.REPORT_CC;
  MailApp.sendEmail(opts);
}

/** Run by hand from the editor to see tonight's report in your own inbox. Doesn't affect the schedule. */
function sendTestReportToMe() {
  const day = currentShift_();
  const cfg = readConfig_();
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: '[TEST] ' + (cfg.TEAM_NAME || 'Investor Ops') + ' · Daily report · ' + prettyDay_(day),
    htmlBody: renderReport_(day, buildDay_(day, readTasks_(), readUpdates_()), readTeam_(), cfg),
  });
}
/** Run by hand to see the 3:30 AM review email and a 6 PM reminder in your own inbox. */
function sendTestRemindersToMe() {
  const me = Session.getEffectiveUser().getEmail();
  sendReviewEmail_(currentShift_(), me);
  sendReminders_(currentShift_(), me);
}

function renderReport_(day, snap, team, cfg) {
  const nameOf = e => (team.find(m => m.email === e) || {}).name || e;
  const first = e => nameOf(e).split(' ')[0];
  const url = webAppUrl_();
  const tasks = snap.tasks;
  const done = tasks.filter(t => t.doneToday);
  const open = tasks.filter(t => t.status !== 'Done');
  const waiting = open.filter(t => t.status === 'Waiting');
  const attention = open.filter(t => t.overdue || t.status === 'Waiting')
    .sort((a, b) => (b.overdue - a.overdue) || (b.carried - a.carried));
  const notes = {};
  snap.updates.filter(u => u.type === 'note').forEach(u => { (notes[u.taskId] = notes[u.taskId] || []).push(u); });

  const meta = t => [t.investor, t.category, t.collaborators.length ? 'with ' + t.collaborators.map(first).join(', ') : '']
    .filter(Boolean).map(esc_).join(' · ');
  const row = (t, extra) => `
    <tr><td style="padding:10px 0;border-top:1px solid ${LINE};">
      <div style="font-size:14px;color:${INK};font-weight:500;">${esc_(t.title)} ${extra || ''}</div>
      ${meta(t) ? `<div style="font-size:12px;color:${SUB};margin-top:2px;">${meta(t)}</div>` : ''}
      ${(notes[t.id] || []).slice(0, 2).map(n => `<div style="font-size:12px;color:${INK};margin-top:4px;">↳ ${esc_(n.text)} <span style="color:${SUB};">— ${esc_(first(n.by))}</span></div>`).join('')}
    </td></tr>`;
  const section = (title, list, extraFn) => list.length ? `
    <div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${SUB};margin:18px 0 4px;">${title} · ${list.length}</div>
    <table width="100%" cellpadding="0" cellspacing="0">${list.map(t => row(t, extraFn ? extraFn(t) : '')).join('')}</table>` : '';
  const stat = (n, label) => `<td align="center" style="padding:14px 6px;"><div style="font-size:26px;font-weight:600;color:${INK};">${n}</div><div style="font-size:11px;color:${SUB};">${label}</div></td>`;

  const personBlock = m => {
    const mine = tasks.filter(t => t.owner === m.email);
    const d = mine.filter(t => t.doneToday);
    const carry = mine.filter(t => t.status !== 'Done');
    const helping = tasks.filter(t => t.collaborators.indexOf(m.email) >= 0);
    const head = `<div style="font-size:15px;font-weight:600;color:${INK};">${esc_(m.name)}
      <span style="font-weight:400;color:${SUB};font-size:13px;"> · ${d.length} done · ${carry.length} still open</span></div>`;
    if (!mine.length && !helping.length) return `<div style="background:#fff;border-radius:14px;padding:16px 18px;margin-top:12px;">${head}
      <div style="font-size:13px;color:${SUB};margin-top:4px;">No tasks on the board this shift.</div></div>`;
    return `<div style="background:#fff;border-radius:14px;padding:16px 18px;margin-top:12px;">${head}
      ${section('Completed', d)}
      ${section('Still open', carry, statusPills_)}
      ${helping.length ? `<div style="font-size:12px;color:${SUB};margin-top:12px;">Also helping on: ${helping.map(t => esc_(t.title) + ' (' + esc_(first(t.owner)) + ')').join(', ')}</div>` : ''}
    </div>`;
  };

  return wrap_(`
    <div style="font-size:12px;color:${SUB};">${esc_(cfg.TEAM_NAME || 'Investor Operations')}</div>
    <div style="font-size:24px;font-weight:600;color:${INK};margin:2px 0 16px;">Daily report: ${esc_(prettyDay_(day))}</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;"><tr>
      ${stat(done.length, 'Done this shift')}${stat(open.length, 'Still open')}${stat(waiting.length, 'Waiting on others')}${stat(open.filter(t => t.carried > 0).length, 'Carried over')}
    </tr></table>
    ${attention.length ? `
    <div style="background:#fff;border-radius:14px;padding:16px 18px;margin-top:12px;border-left:4px solid #c4291c;">
      <div style="font-size:15px;font-weight:600;color:${INK};">Needs attention</div>
      <div style="font-size:12px;color:${SUB};margin-top:2px;">Overdue, or stuck waiting on someone outside the team.</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">${attention.map(t => row(t,
        statusPills_(t) + ' <span style="font-size:12px;color:' + SUB + ';font-weight:400;">' + esc_(first(t.owner)) + '</span>')).join('')}</table>
    </div>` : ''}
    ${team.filter(m => m.takesTasks).map(personBlock).join('')}
    ${url ? `<div style="text-align:center;margin:22px 0 4px;">${button_(url + '?date=' + day, 'Open this day on the dashboard', true)}</div>` : ''}
    <div style="text-align:center;font-size:11px;color:${SUB};margin-top:14px;">Shift of ${esc_(prettyDay_(day))}, 6 PM – 3 AM IST</div>`);
}

/** 3:30 AM: "this goes to Bharath at 4 — want to stop it?" plus the full preview. */
function sendReviewEmail_(day, overrideTo) {
  const to = overrideTo || reviewers_().join(',');
  if (!to) return;
  const cfg = readConfig_();
  const team = readTeam_();
  const boss = emails_(cfg.REPORT_TO).map(e => ((team.find(m => m.email === e) || {}).name || e).split(' ')[0]).join(', ') || 'the founder';
  const url = webAppUrl_();
  const preview = renderReport_(day, buildDay_(day, readTasks_(), readUpdates_()), team, cfg);
  const top = wrap_(`
    <div style="background:#fff;border-radius:14px;padding:20px 22px;">
      <div style="font-size:19px;font-weight:600;color:${INK};">Tonight's report goes to ${esc_(boss)} at 4:00 AM</div>
      <div style="font-size:14px;color:${INK};margin-top:8px;line-height:1.5;">Have a quick look below. <b>If it's fine, do nothing</b> and it goes out automatically at 4:00 AM.<br>
      If it shouldn't go out tonight, open the dashboard and tap <b>"Don't send tonight"</b>.</div>
      ${url ? `<div style="margin-top:16px;">${button_(url + '?review=' + day, 'Review on dashboard', true)}</div>` : ''}
    </div>`);
  MailApp.sendEmail({
    to,
    subject: 'Review: report to ' + boss + ' goes at 4:00 AM · ' + prettyDay_(day),
    htmlBody: top + preview,
    name: cfg.TEAM_NAME || 'Investor Ops',
  });
}

/** 6 PM: each person gets their own open tasks that came over from earlier shifts. */
function sendReminders_(day, overrideTo) {
  const cfg = readConfig_();
  const team = readTeam_();
  const url = webAppUrl_();
  const first = e => ((team.find(m => m.email === e) || {}).name || e).split(' ')[0];
  const snap = buildDay_(day, readTasks_(), readUpdates_());
  const carried = snap.tasks.filter(t => t.status !== 'Done' && t.createdShift < day);
  let sent = 0;
  team.filter(m => m.takesTasks).forEach(m => {
    if (overrideTo && sent) return;
    const own = carried.filter(t => t.owner === m.email);
    const helping = carried.filter(t => t.collaborators.indexOf(m.email) >= 0);
    if (!own.length && !helping.length) return;
    const row = (t, who) => `
      <tr><td style="padding:10px 0;border-top:1px solid ${LINE};">
        <div style="font-size:14px;color:${INK};font-weight:500;">${esc_(t.title)} ${statusPills_(t)}</div>
        <div style="font-size:12px;color:${SUB};margin-top:2px;">${[t.investor, who, t.dueDate ? 'due ' + prettyDay_(t.dueDate).replace(/^\w+, /, '').replace(/ \d{4}$/, '') : ''].filter(Boolean).map(esc_).join(' · ')}</div>
        ${t.lastNote ? `<div style="font-size:12px;color:${INK};margin-top:4px;">Last update: ${esc_(t.lastNote.text)} <span style="color:${SUB};">— ${esc_(first(t.lastNote.by))}</span></div>` : ''}
      </td></tr>`;
    const list = (title, items, who) => items.length ? `
      <div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${SUB};margin:16px 0 4px;">${title} · ${items.length}</div>
      <table width="100%" cellpadding="0" cellspacing="0">${items.map(t => row(t, who(t))).join('')}</table>` : '';
    MailApp.sendEmail({
      to: overrideTo || m.email,
      subject: 'Carried over to tonight: ' + (own.length + helping.length) + ' task' + (own.length + helping.length === 1 ? '' : 's'),
      name: cfg.TEAM_NAME || 'Investor Ops',
      htmlBody: wrap_(`
        <div style="background:#fff;border-radius:14px;padding:20px 22px;">
          <div style="font-size:19px;font-weight:600;color:${INK};">Good evening, ${esc_(m.name.split(' ')[0])}</div>
          <div style="font-size:14px;color:${SUB};margin-top:4px;">These weren't finished on an earlier shift and are still open tonight.</div>
          ${list('Yours', own, t => t.collaborators.length ? 'with ' + t.collaborators.map(first).join(', ') : '')}
          ${list('You’re helping on', helping, t => 'owner: ' + first(t.owner))}
          ${url ? `<div style="margin-top:18px;">${button_(url, 'Open the board', true)}</div>` : ''}
        </div>`),
    });
    sent++;
  });
  return sent;
}
