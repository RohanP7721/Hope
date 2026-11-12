/**
 * Jupiter Texas Holiday Party: invitations, RSVP tracking and reminders.
 *
 * The Google Sheet this script is attached to is the database.
 * Runs as info@jupitertexas.com, so every email and calendar invite comes from that account.
 */

var GUEST_SHEET = 'Guests';
var HEADERS = [
  'Name', 'Email', 'Phase', 'Token', 'Invite Status', 'Sent At',
  'Opened', 'First Opened', 'Open Count', 'RSVP', 'Party Size', 'Maybe Reason',
  'RSVP At', 'Calendar Event ID', 'Emails Sent', 'Last Activity'
];
var TEST_TOKEN = 'TEST';
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var SEND_BATCH = 25;

/* ------------------------------------------------------------------ */
/* Sheet menu and one-time setup                                       */
/* ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Jupiter RSVP')
    .addItem('1. Set up sheet & reminders', 'setup')
    .addItem('Send me a test invite', 'menuSendTest')
    .addToUi();
}

function setup() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(GUEST_SHEET);
  if (!sheet) {
    var first = ss.getSheets()[0];
    sheet = first.getLastRow() === 0 ? first.setName(GUEST_SHEET) : ss.insertSheet(GUEST_SHEET, 0);
  }
  var existing = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  if (String(existing[0] || '') !== 'Name') {
    if (sheet.getLastRow() > 0) sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  } else {
    // Add any missing columns at the end without disturbing data.
    HEADERS.forEach(function (h) {
      if (existing.indexOf(h) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
    });
  }
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  header.setFontWeight('bold').setBackground('#0B1330').setFontColor('#F2B01E');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 260);
  // Columns D onward are filled by the system; tint them so nobody types there by accident.
  sheet.getRange(2, 4, Math.max(sheet.getMaxRows() - 1, 1), HEADERS.length - 3).setBackground('#F4F5F9');

  installTriggers_();
  ensureTokens_();
  SpreadsheetApp.getActive().toast('Sheet and reminders are ready. Paste Name, Email and Phase into columns A to C.', 'Jupiter RSVP', 8);
}

function installTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'hourlyJobs') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('hourlyJobs').timeBased().everyHours(1).create();
}

function menuSendTest() {
  var result = sendTestToMe();
  SpreadsheetApp.getActive().toast('Test invite sent to ' + result.to, 'Jupiter RSVP', 6);
}

/* ------------------------------------------------------------------ */
/* Sheet access                                                        */
/* ------------------------------------------------------------------ */

function guestSheet_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(GUEST_SHEET);
  if (!sheet) throw new Error('Run "Jupiter RSVP > Set up sheet" first.');
  return sheet;
}

function columnMap_(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  headers.forEach(function (h, i) { map[String(h).trim()] = i + 1; });
  HEADERS.forEach(function (h) { if (!map[h]) throw new Error('Missing column "' + h + '". Run setup again.'); });
  return map;
}

function newToken_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 22);
}

/** Gives every row with an email a private token for its RSVP links. */
function ensureTokens_() {
  var sheet = guestSheet_(), col = columnMap_(sheet), last = sheet.getLastRow();
  if (last < 2) return;
  var emails = sheet.getRange(2, col['Email'], last - 1, 1).getValues();
  var tokenRange = sheet.getRange(2, col['Token'], last - 1, 1);
  var tokens = tokenRange.getValues();
  var changed = false;
  for (var i = 0; i < tokens.length; i++) {
    if (!tokens[i][0] && String(emails[i][0]).trim()) { tokens[i][0] = newToken_(); changed = true; }
  }
  if (changed) tokenRange.setValues(tokens);
}

function rowToGuest_(values, col, rowNumber) {
  function v(name) { return values[col[name] - 1]; }
  function iso(x) { return x instanceof Date ? x.toISOString() : (x ? String(x) : ''); }
  return {
    row: rowNumber,
    name: String(v('Name') || '').trim(),
    email: String(v('Email') || '').trim().toLowerCase(),
    phase: String(v('Phase') || '').trim(),
    token: String(v('Token') || ''),
    status: String(v('Invite Status') || ''),
    sentAt: iso(v('Sent At')),
    opened: String(v('Opened') || '') === 'Yes',
    firstOpened: iso(v('First Opened')),
    openCount: Number(v('Open Count')) || 0,
    rsvp: String(v('RSVP') || ''),
    partySize: String(v('Party Size') || ''),
    reason: String(v('Maybe Reason') || ''),
    rsvpAt: iso(v('RSVP At')),
    eventId: String(v('Calendar Event ID') || ''),
    emailsSent: String(v('Emails Sent') || ''),
    lastActivity: iso(v('Last Activity'))
  };
}

function readGuests_() {
  ensureTokens_();
  var sheet = guestSheet_(), col = columnMap_(sheet), last = sheet.getLastRow();
  if (last < 2) return { sheet: sheet, col: col, guests: [] };
  var values = sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
  var guests = [];
  values.forEach(function (r, i) {
    var g = rowToGuest_(r, col, i + 2);
    if (g.email || g.name) guests.push(g);
  });
  return { sheet: sheet, col: col, guests: guests };
}

function findGuestByToken_(token) {
  if (!token) return null;
  var sheet = guestSheet_(), col = columnMap_(sheet), last = sheet.getLastRow();
  if (last < 2) return null;
  var cell = sheet.getRange(2, col['Token'], last - 1, 1)
    .createTextFinder(token).matchEntireCell(true).matchCase(true).findNext();
  if (!cell) return null;
  var r = cell.getRow();
  var values = sheet.getRange(r, 1, 1, sheet.getLastColumn()).getValues()[0];
  return { sheet: sheet, col: col, guest: rowToGuest_(values, col, r) };
}

function setCells_(sheet, col, row, fields) {
  Object.keys(fields).forEach(function (k) { sheet.getRange(row, col[k]).setValue(fields[k]); });
}

function addTag_(existing, tag) {
  var tags = existing ? existing.split(',') : [];
  if (tags.indexOf(tag) === -1) tags.push(tag);
  return tags.join(',');
}

/* ------------------------------------------------------------------ */
/* Web entry point: public RSVP API + private dashboard                */
/* ------------------------------------------------------------------ */

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    switch (p.api) {
      case 'o': trackOpen_(p.t); return ContentService.createTextOutput('');
      case 'rsvp': return json_(handleRsvp_(p.t, p.a));
      case 'party': return json_(handleParty_(p.t, p.n));
      case 'reason': return json_(handleReason_(p.t, p.r));
      case 'get': return json_(handleGet_(p.t));
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong. Please try again.' });
  }

  if (!isOwner_()) {
    return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:40px">This page is private.</p>');
  }
  return HtmlService.createTemplateFromFile('Dashboard').evaluate()
    .setTitle('Jupiter Holiday Party · RSVPs')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function isOwner_() {
  var user = Session.getActiveUser().getEmail();
  return !!user && user.toLowerCase() === CONFIG.OWNER_EMAIL.toLowerCase();
}

function requireOwner_() {
  if (!isOwner_()) throw new Error('Only ' + CONFIG.OWNER_EMAIL + ' can do this.');
}

function publicGuest_(g, extra) {
  var out = {
    ok: true,
    firstName: firstName_(g.name),
    email: g.email,
    rsvp: g.rsvp,
    partySize: g.partySize,
    reason: g.reason,
    reasons: CONFIG.MAYBE_REASONS
  };
  Object.keys(extra || {}).forEach(function (k) { out[k] = extra[k]; });
  return out;
}

function demoGuest_(fields) {
  return publicGuest_({ name: 'Test Investor', email: CONFIG.OWNER_EMAIL, rsvp: '', partySize: '', reason: '' }, fields);
}

function trackOpen_(token) {
  if (!token || token === TEST_TOKEN) return;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;
  try {
    var found = findGuestByToken_(token);
    if (!found) return;
    var g = found.guest, now = new Date(), fields = { 'Open Count': g.openCount + 1, 'Last Activity': now };
    if (!g.opened) { fields['Opened'] = 'Yes'; fields['First Opened'] = now; }
    setCells_(found.sheet, found.col, g.row, fields);
  } finally { lock.releaseLock(); }
}

function handleGet_(token) {
  if (token === TEST_TOKEN) return demoGuest_({});
  var found = findGuestByToken_(token);
  return found ? publicGuest_(found.guest) : { ok: false, error: 'We could not find your invitation.' };
}

function handleRsvp_(token, action) {
  var choice = { yes: 'Yes', maybe: 'Maybe', no: 'No' }[String(action || '').toLowerCase()];
  if (!choice) return { ok: false, error: 'Unknown response.' };
  if (token === TEST_TOKEN) return demoGuest_({ rsvp: choice, partySize: choice === 'Yes' ? '1' : '', calendar: choice === 'No' ? 'none' : 'sent' });

  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var found = findGuestByToken_(token);
    if (!found) return { ok: false, error: 'We could not find your invitation.' };
    var g = found.guest, now = new Date();
    var fields = { 'RSVP': choice, 'RSVP At': now, 'Last Activity': now };
    // Tapping a button proves the email was opened, even if images were blocked.
    if (!g.opened) { fields['Opened'] = 'Yes'; fields['First Opened'] = now; fields['Open Count'] = g.openCount + 1; }
    if (choice === 'Yes' && !g.partySize) fields['Party Size'] = '1';
    if (choice !== 'Maybe') fields['Maybe Reason'] = '';

    var calendar = 'none';
    if (choice === 'No' && g.eventId) {
      removeCalendarInvite_(g.eventId);
      fields['Calendar Event ID'] = '';
      calendar = 'removed';
    } else if (choice !== 'No') {
      if (g.eventId) {
        calendar = 'existing';
      } else {
        try {
          fields['Calendar Event ID'] = createCalendarInvite_(g);
          calendar = 'sent';
        } catch (err) {
          console.error('Calendar invite failed for ' + g.email + ': ' + err);
          calendar = 'failed';
        }
      }
    }
    setCells_(found.sheet, found.col, g.row, fields);
    g.rsvp = choice;
    g.partySize = fields['Party Size'] || g.partySize;
    if (choice !== 'Maybe') g.reason = '';
    return publicGuest_(g, { calendar: calendar });
  } finally { lock.releaseLock(); }
}

function handleParty_(token, size) {
  var allowed = ['1', '2', '3', '4+'];
  if (allowed.indexOf(String(size)) === -1) return { ok: false, error: 'Unknown party size.' };
  if (token === TEST_TOKEN) return demoGuest_({ rsvp: 'Yes', partySize: String(size) });
  var found = findGuestByToken_(token);
  if (!found) return { ok: false, error: 'We could not find your invitation.' };
  setCells_(found.sheet, found.col, found.guest.row, { 'Party Size': String(size), 'Last Activity': new Date() });
  found.guest.partySize = String(size);
  return publicGuest_(found.guest);
}

function handleReason_(token, reason) {
  if (CONFIG.MAYBE_REASONS.indexOf(reason) === -1) return { ok: false, error: 'Unknown reason.' };
  if (token === TEST_TOKEN) return demoGuest_({ rsvp: 'Maybe', reason: reason });
  var found = findGuestByToken_(token);
  if (!found) return { ok: false, error: 'We could not find your invitation.' };
  setCells_(found.sheet, found.col, found.guest.row, { 'Maybe Reason': reason, 'Last Activity': new Date() });
  found.guest.reason = reason;
  return publicGuest_(found.guest);
}

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

/**
 * One event per guest on info@'s calendar, with just that guest invited.
 * Google sends the guest a real calendar invitation; Gmail and Outlook put it
 * in their calendar automatically. Guests never see each other.
 */
function createCalendarInvite_(guest) {
  var e = CONFIG.EVENT;
  var event = CalendarApp.getDefaultCalendar().createEvent(
    e.TITLE, new Date(e.START_ISO), new Date(e.END_ISO), {
      location: e.VENUE_NAME + ', ' + e.VENUE_ADDRESS,
      description: 'Jupiter Texas Real Estate Group invites you and your family.\n' +
        'Friends are welcome too.\n\n' + e.DATE_LABEL + ', ' + e.TIME_LABEL + '\n' +
        e.VENUE_NAME + '\n' + e.VENUE_ADDRESS + '\nDirections: ' + e.MAP_URL + '\n\n' +
        'Questions? Write to ' + CONFIG.REPLY_TO,
      guests: guest.email,
      sendInvites: true
    });
  event.setGuestsCanSeeGuests(false);
  event.setGuestsCanInviteOthers(false);
  event.setGuestsCanModify(false);
  event.setColor(CalendarApp.EventColor.YELLOW);
  return event.getId();
}

function removeCalendarInvite_(eventId) {
  try {
    var event = CalendarApp.getDefaultCalendar().getEventById(eventId);
    if (event) event.deleteEvent();
  } catch (err) {
    console.error('Could not remove calendar event ' + eventId + ': ' + err);
  }
}

/* ------------------------------------------------------------------ */
/* Sending invitations (called from the dashboard)                     */
/* ------------------------------------------------------------------ */

function sendableGuests_(guests, phase) {
  var seen = {}, report = { inPhase: 0, alreadySent: 0, invalid: [], duplicates: [], toSend: [] };
  guests.forEach(function (g) {
    var inPhase = phase === 'ALL' || g.phase === phase;
    var dupe = g.email && seen[g.email];
    if (g.email) seen[g.email] = true;
    if (!inPhase) return;
    report.inPhase++;
    if (!EMAIL_PATTERN.test(g.email)) { report.invalid.push(g.name || g.email || 'Row ' + g.row); return; }
    if (dupe) { report.duplicates.push(g.email); return; }
    if (g.status && g.status.indexOf('Failed') !== 0) { report.alreadySent++; return; }
    report.toSend.push(g);
  });
  return report;
}

function previewPhase(phase) {
  requireOwner_();
  var report = sendableGuests_(readGuests_().guests, phase);
  return {
    phase: phase,
    inPhase: report.inPhase,
    alreadySent: report.alreadySent,
    invalid: report.invalid,
    duplicates: report.duplicates,
    toSend: report.toSend.length,
    quota: MailApp.getRemainingDailyQuota()
  };
}

/** Sends up to one batch; the dashboard keeps calling until remaining is 0. */
function sendPhaseBatch(phase) {
  requireOwner_();
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) throw new Error('Another send is already running. Wait for it to finish.');
  try {
    var data = readGuests_(), report = sendableGuests_(data.guests, phase);
    var batch = report.toSend.slice(0, SEND_BATCH), sent = 0, failed = 0;
    for (var i = 0; i < batch.length; i++) {
      if (MailApp.getRemainingDailyQuota() < 1) throw new Error('Daily Gmail sending limit reached. Sending resumes tomorrow.');
      var g = batch[i];
      try {
        sendEmail_(g.email, buildInviteEmail(g));
        setCells_(data.sheet, data.col, g.row, { 'Invite Status': 'Sent', 'Sent At': new Date(), 'Emails Sent': addTag_(g.emailsSent, 'invite') });
        sent++;
      } catch (err) {
        setCells_(data.sheet, data.col, g.row, { 'Invite Status': 'Failed: ' + String(err.message || err).slice(0, 80) });
        failed++;
      }
      SpreadsheetApp.flush(); // Save after each email so a timeout never causes a double send.
    }
    return { sent: sent, failed: failed, remaining: report.toSend.length - batch.length };
  } finally { lock.releaseLock(); }
}

function sendEmail_(to, email) {
  GmailApp.sendEmail(to, email.subject, email.text, {
    htmlBody: email.html,
    name: CONFIG.SENDER_NAME,
    replyTo: CONFIG.REPLY_TO
  });
}

function sendTestToMe() {
  requireOwner_();
  var to = Session.getActiveUser().getEmail();
  sendEmail_(to, buildInviteEmail({ name: 'Test Investor', token: TEST_TOKEN }));
  return { to: to };
}

function getEmailPreview(kind) {
  requireOwner_();
  var demo = { name: 'Test Investor', token: TEST_TOKEN, rsvp: kind === 'reminder-maybe' ? 'Maybe' : 'Yes', partySize: '3' };
  if (kind === 'nudge') return buildNudgeEmail(demo).html;
  if (kind && kind.indexOf('reminder') === 0) return buildReminderEmail(demo, 3).html;
  return buildInviteEmail(demo).html;
}

/* ------------------------------------------------------------------ */
/* Nudges for people who haven't answered (manual, from dashboard)     */
/* ------------------------------------------------------------------ */

function nudgeCandidates_(guests) {
  var cutoff = Date.now() - CONFIG.NUDGE_AFTER_DAYS * 86400000;
  return guests.filter(function (g) {
    return g.status === 'Sent' && !g.rsvp && g.sentAt && new Date(g.sentAt).getTime() < cutoff &&
      g.emailsSent.split(',').indexOf('nudge') === -1;
  });
}

function previewNudge() {
  requireOwner_();
  return { count: nudgeCandidates_(readGuests_().guests).length, days: CONFIG.NUDGE_AFTER_DAYS };
}

function sendNudgeBatch() {
  requireOwner_();
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) throw new Error('Another send is already running.');
  try {
    var data = readGuests_(), list = nudgeCandidates_(data.guests), batch = list.slice(0, SEND_BATCH), sent = 0;
    batch.forEach(function (g) {
      try {
        sendEmail_(g.email, buildNudgeEmail(g));
        setCells_(data.sheet, data.col, g.row, { 'Emails Sent': addTag_(g.emailsSent, 'nudge') });
        sent++;
      } catch (err) { console.error('Nudge failed for ' + g.email + ': ' + err); }
      SpreadsheetApp.flush();
    });
    return { sent: sent, remaining: list.length - batch.length };
  } finally { lock.releaseLock(); }
}

/* ------------------------------------------------------------------ */
/* Hourly jobs: countdown reminders + bounce detection                 */
/* ------------------------------------------------------------------ */

function hourlyJobs() {
  try { markBounces_(); } catch (err) { console.error('Bounce check failed: ' + err); }
  var hour = Number(Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'H'));
  if (hour >= 10 && hour <= 19) sendReminders_();
}

function daysUntilEvent_() {
  var today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd').split('-');
  var event = CONFIG.EVENT.START_ISO.slice(0, 10).split('-');
  return Math.round((Date.UTC(event[0], event[1] - 1, event[2]) - Date.UTC(today[0], today[1] - 1, today[2])) / 86400000);
}

/**
 * Picks the reminder window we're in (7, 3 or 1 day) and sends it once to every
 * Yes/Maybe guest who RSVP'd before that window opened.
 */
function sendReminders_() {
  var daysLeft = daysUntilEvent_();
  var windows = CONFIG.REMINDER_DAYS.slice().sort(function (a, b) { return a - b; });
  var stage = null;
  for (var i = 0; i < windows.length; i++) { if (daysLeft >= 1 && daysLeft <= windows[i]) { stage = windows[i]; break; } }
  if (!stage) return;

  var tag = stage + 'd';
  var eventDay = new Date(CONFIG.EVENT.START_ISO);
  var windowOpens = new Date(eventDay.getTime() - stage * 86400000);
  var data = readGuests_(), budget = 120;

  data.guests.forEach(function (g) {
    if (budget <= 0) return;
    if (g.rsvp !== 'Yes' && g.rsvp !== 'Maybe') return;
    if (!EMAIL_PATTERN.test(g.email) || g.status === 'Bounced') return;
    var tags = g.emailsSent.split(',');
    if (tags.indexOf(tag) !== -1) return;
    // Skip anyone who already got a closer reminder, or RSVP'd inside this window (they just heard from us).
    if (windows.some(function (d) { return d < stage && tags.indexOf(d + 'd') !== -1; })) return;
    if (g.rsvpAt && new Date(g.rsvpAt) > windowOpens) return;
    try {
      sendEmail_(g.email, buildReminderEmail(g, daysLeft));
      setCells_(data.sheet, data.col, g.row, { 'Emails Sent': addTag_(g.emailsSent, tag) });
      budget--;
    } catch (err) { console.error('Reminder failed for ' + g.email + ': ' + err); }
  });
}

/** Reads "Delivery Status Notification" emails in info@'s inbox and marks those guests as Bounced. */
function markBounces_() {
  var threads = GmailApp.search('from:(mailer-daemon OR postmaster) newer_than:3d', 0, 50);
  if (!threads.length) return;
  var bodies = [];
  threads.forEach(function (t) { t.getMessages().forEach(function (m) { bodies.push(m.getPlainBody().toLowerCase()); }); });
  var text = bodies.join('\n');
  var data = readGuests_();
  data.guests.forEach(function (g) {
    if (g.status === 'Sent' && g.email && text.indexOf(g.email) !== -1) {
      setCells_(data.sheet, data.col, g.row, { 'Invite Status': 'Bounced' });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Dashboard data                                                      */
/* ------------------------------------------------------------------ */

function getDashboard() {
  requireOwner_();
  var guests = readGuests_().guests;
  var phases = {};
  var stats = { total: 0, sent: 0, opened: 0, yes: 0, maybe: 0, no: 0, noResponse: 0, bounced: 0, headcount: 0 };
  var rows = guests.map(function (g) {
    stats.total++;
    if (g.phase) phases[g.phase] = true;
    var sent = g.status === 'Sent' || g.status === 'Bounced';
    if (sent) stats.sent++;
    if (g.status === 'Bounced') stats.bounced++;
    if (g.opened) stats.opened++;
    if (g.rsvp === 'Yes') { stats.yes++; stats.headcount += g.partySize === '4+' ? 4 : (Number(g.partySize) || 1); }
    else if (g.rsvp === 'Maybe') stats.maybe++;
    else if (g.rsvp === 'No') stats.no++;
    else if (g.status === 'Sent') stats.noResponse++;
    return {
      name: g.name, email: g.email, phase: g.phase,
      status: g.status || 'Not sent', sentAt: g.sentAt,
      opened: g.opened, firstOpened: g.firstOpened, openCount: g.openCount,
      rsvp: g.rsvp, partySize: g.partySize, reason: g.reason, rsvpAt: g.rsvpAt,
      calendar: !!g.eventId, emailsSent: g.emailsSent, lastActivity: g.lastActivity
    };
  });
  return {
    stats: stats,
    rows: rows,
    phases: Object.keys(phases).sort(),
    quota: MailApp.getRemainingDailyQuota(),
    sheetUrl: SpreadsheetApp.getActive().getUrl(),
    daysLeft: daysUntilEvent_(),
    updatedAt: new Date().toISOString()
  };
}
