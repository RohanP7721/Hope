/**
 * Jupiter Texas Holiday Party: invitations, RSVP tracking and reminders.
 * The two web links (API link, RSVP page link) live in the sheet's "Settings" tab, not here.
 */
var CONFIG = {
  // Only this Google account can open the dashboard.
  OWNER_EMAIL: 'info@jupitertexas.com',

  // How the sender appears in the investor's inbox.
  SENDER_NAME: 'Jupiter Texas',
  REPLY_TO: 'info@jupitertexas.com',
  SUBJECT: "You're invited: The Jupiter Texas Holiday Party, Sat Dec 12",

  // Filled in at run time from the "Settings" tab of the sheet.
  API_URL: '',
  SITE_URL: '',

  EVENT: {
    TITLE: 'The Jupiter Texas Holiday Party',
    // Plano, TX is US Central time. 6 PM CST = 00:00 UTC the next day.
    START_ISO: '2026-12-12T18:00:00-06:00',
    END_ISO: '2026-12-12T23:00:00-06:00',
    DATE_LABEL: 'Saturday, December 12, 2026',
    TIME_LABEL: '6 PM onwards',
    VENUE_NAME: 'Elegance Ballroom & Event Center (Hello India)',
    VENUE_ADDRESS: '8740 Ohio Dr A1, Plano, TX 75024',
    MAP_URL: 'https://maps.google.com/?q=8740+Ohio+Dr+A1,+Plano,+TX+75024',
    RSVP_BY_LABEL: 'Saturday, December 5',
    WEBSITE: 'https://jupitertexas.com'
  },

  // Reminder emails go to everyone who said Yes or Maybe, this many days before.
  REMINDER_DAYS: [7, 3, 1],

  // "Nudge" emails go only to people who got the invite this many days ago and haven't answered.
  NUDGE_AFTER_DAYS: 4,

  MAYBE_REASONS: ['Schedule clash', 'Travelling', 'Checking with family', 'Other'],

  TIMEZONE: 'America/Chicago'
};

/**
 * Email HTML. Plain JavaScript with no Apps Script calls, so it can also be
 * previewed outside Google (see preview/render.js).
 *
 * Email clients are strict: tables, inline styles, no scripts, no web fonts
 * that Outlook would break. Georgia stands in for the poster's serif.
 */

var EMAIL_COLORS = {
  navy: '#0B1330',
  navyCard: '#121C40',
  gold: '#F2B01E',
  goldDeep: '#D99A0B',
  ink: '#FFFFFF',
  muted: '#B7BED6',
  line: '#26305A'
};

function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function firstName_(name) {
  var clean = String(name || '').trim();
  if (!clean) return 'there';
  return clean.split(/\s+/)[0];
}

function rsvpLinks_(guest) {
  // k = the Apps Script deployment id, so the RSVP page knows where to save answers without any setup of its own.
  var key = (CONFIG.API_URL.match(/\/s\/([A-Za-z0-9_-]+)\/exec/) || [])[1] || '';
  var manage = CONFIG.SITE_URL + '/?k=' + encodeURIComponent(key) + '&t=' + encodeURIComponent(guest.token);
  var base = manage + '&a=';
  return {
    yes: base + 'yes',
    maybe: base + 'maybe',
    no: base + 'no',
    manage: manage,
    pixel: CONFIG.API_URL + '?api=o&t=' + encodeURIComponent(guest.token),
    poster: CONFIG.SITE_URL + '/poster.jpg'
  };
}

function emailShell_(opts) {
  var c = EMAIL_COLORS;
  return '' +
'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
'<meta name="viewport" content="width=device-width,initial-scale=1">' +
'<meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light">' +
'<title>' + escapeHtml_(opts.title) + '</title>' +
'<style>' +
'@media only screen and (max-width:620px){' +
'.wrap{width:100%!important}.pad{padding-left:24px!important;padding-right:24px!important}' +
'.btn-cell{display:block!important;width:100%!important;padding:0 0 10px 0!important}' +
'.btn-a{display:block!important}.h1{font-size:30px!important;line-height:36px!important}}' +
'</style></head>' +
'<body style="margin:0;padding:0;background:' + c.navy + ';">' +
'<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:' + c.navy + ';">' +
  escapeHtml_(opts.preheader) + '&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + c.navy + ';">' +
'<tr><td align="center" style="padding:24px 12px 40px;">' +
'<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:' + c.navy + ';">' +
  opts.body +
  footer_() +
'</table></td></tr></table>' +
(opts.pixel ? '<img src="' + escapeHtml_(opts.pixel) + '" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;opacity:0;">' : '') +
'</body></html>';
}

function footer_() {
  var c = EMAIL_COLORS;
  return '' +
'<tr><td class="pad" style="padding:36px 48px 0;border-top:1px solid ' + c.line + ';font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:' + c.muted + ';text-align:center;">' +
  '<strong style="color:' + c.ink + ';letter-spacing:2px;">JUPITER TEXAS</strong><br>' +
  '<span style="letter-spacing:1.5px;">REAL ESTATE GROUP &middot; </span><span style="color:' + c.gold + ';letter-spacing:1.5px;">CASH TO CASHFLOW</span><br><br>' +
  'You are receiving this invitation as a valued Jupiter Texas investor.<br>' +
  'Questions? Just reply to this email or write to ' +
  '<a href="mailto:' + CONFIG.REPLY_TO + '" style="color:' + c.gold + ';text-decoration:none;">' + CONFIG.REPLY_TO + '</a><br>' +
  '<a href="' + CONFIG.EVENT.WEBSITE + '" style="color:' + c.muted + ';">jupitertexas.com</a>' +
'</td></tr>';
}

function detailsBlock_() {
  var c = EMAIL_COLORS, e = CONFIG.EVENT;
  var label = 'font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;color:' + c.gold + ';font-weight:bold;';
  var value = 'font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:' + c.ink + ';';
  return '' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + c.navyCard + ';border:1px solid ' + c.line + ';border-radius:12px;">' +
'<tr><td style="padding:22px 24px 6px;"><div style="' + label + '">WHEN</div>' +
  '<div style="' + value + '">' + escapeHtml_(e.DATE_LABEL) + '<br><span style="color:' + c.muted + ';">' + escapeHtml_(e.TIME_LABEL) + '</span></div></td></tr>' +
'<tr><td style="padding:16px 24px 22px;"><div style="' + label + '">WHERE</div>' +
  '<div style="' + value + '">' + escapeHtml_(e.VENUE_NAME) + '<br>' +
  '<a href="' + e.MAP_URL + '" style="color:' + c.muted + ';text-decoration:underline;">' + escapeHtml_(e.VENUE_ADDRESS) + '</a></div></td></tr>' +
'</table>';
}

function button_(href, text, primary) {
  var c = EMAIL_COLORS;
  var bg = primary ? c.gold : 'transparent';
  var color = primary ? c.navy : c.ink;
  var border = primary ? c.gold : '#5A6590';
  return '<td class="btn-cell" style="padding:0 5px;">' +
    '<a class="btn-a" href="' + escapeHtml_(href) + '" target="_blank" style="display:inline-block;background:' + bg + ';border:1.5px solid ' + border +
    ';border-radius:999px;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:' + color +
    ';text-decoration:none;text-align:center;mso-padding-alt:0;">' + text + '</a></td>';
}

function rsvpButtons_(links, which) {
  which = which || ['yes', 'maybe', 'no'];
  var labels = { yes: 'Yes, I&rsquo;ll be there', maybe: 'Maybe', no: 'Can&rsquo;t make it' };
  var cells = which.map(function (key) { return button_(links[key], labels[key], key === 'yes'); }).join('');
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>' + cells + '</tr></table>';
}

function paragraph_(html) {
  return '<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:' + EMAIL_COLORS.ink + ';">' + html + '</p>';
}

/** The main invitation. */
function buildInviteEmail(guest) {
  var c = EMAIL_COLORS, e = CONFIG.EVENT, links = rsvpLinks_(guest);
  var body = '' +
'<tr><td style="padding:0;">' +
  '<a href="' + escapeHtml_(links.yes) + '" target="_blank"><img src="' + links.poster + '" width="600" alt="Jupiter Texas Real Estate Group invites you and your family to The Holiday Party, Saturday December 12, 6 PM onwards, Elegance Ballroom, Plano TX" ' +
  'style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:14px;"></a></td></tr>' +
'<tr><td class="pad" style="padding:40px 48px 8px;">' +
  paragraph_('Dear ' + escapeHtml_(firstName_(guest.name)) + ',') +
  paragraph_('As the year comes to a close, we would love to celebrate it with the people who made it possible: our investors. ' +
             'Please join us for an evening of food, music and festive cheer, and bring your family and friends along.') +
'</td></tr>' +
'<tr><td class="pad" style="padding:8px 48px 0;">' + detailsBlock_() + '</td></tr>' +
'<tr><td class="pad" style="padding:40px 48px 8px;text-align:center;">' +
  '<div class="h1" style="font-family:Georgia,\'Times New Roman\',serif;font-size:34px;line-height:40px;color:' + c.gold + ';">Will you join us?</div>' +
  '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:' + c.muted + ';padding:8px 0 24px;">Kindly RSVP by ' + escapeHtml_(e.RSVP_BY_LABEL) + '</div>' +
  rsvpButtons_(links) +
  '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:' + c.muted + ';padding:20px 0 0;">One tap is all it takes. Your calendar invite follows automatically.</div>' +
'</td></tr>' +
'<tr><td class="pad" style="padding:36px 48px 40px;">' +
  paragraph_('Warm regards,<br><strong>The Jupiter Texas Team</strong>') +
'</td></tr>';

  return {
    subject: CONFIG.SUBJECT,
    html: emailShell_({
      title: CONFIG.SUBJECT,
      preheader: 'You and your family are invited. ' + e.DATE_LABEL + ', ' + e.TIME_LABEL + ', Plano TX. RSVP by ' + e.RSVP_BY_LABEL + '.',
      body: body,
      pixel: links.pixel
    }),
    text: 'Dear ' + firstName_(guest.name) + ',\n\n' +
      'Jupiter Texas Real Estate Group invites you and your family to ' + e.TITLE + '.\n\n' +
      'When: ' + e.DATE_LABEL + ', ' + e.TIME_LABEL + '\nWhere: ' + e.VENUE_NAME + ', ' + e.VENUE_ADDRESS + '\n\n' +
      'Kindly RSVP by ' + e.RSVP_BY_LABEL + ':\n' +
      'Yes, I will be there: ' + links.yes + '\nMaybe: ' + links.maybe + '\nCan\'t make it: ' + links.no + '\n\n' +
      'Warm regards,\nThe Jupiter Texas Team'
  };
}

/** Countdown reminder for people who said Yes or Maybe. */
function buildReminderEmail(guest, daysLeft) {
  var c = EMAIL_COLORS, e = CONFIG.EVENT, links = rsvpLinks_(guest);
  var when = daysLeft === 1 ? 'tomorrow' : 'in ' + daysLeft + ' days';
  var isMaybe = guest.rsvp === 'Maybe';
  var headline = isMaybe ? 'Still deciding?' : 'See you ' + when + '!';
  var intro = isMaybe
    ? 'The Jupiter Texas Holiday Party is ' + when + ' and we would still love to have you there. Let us know when you can, it helps us plan seating and food.'
    : 'Just a reminder that the Jupiter Texas Holiday Party is ' + when + '. We have you down for ' +
      (guest.partySize && guest.partySize !== '1' ? 'a party of ' + guest.partySize : 'one') + '. Family and friends are welcome.';
  var buttons = isMaybe
    ? rsvpButtons_(links, ['yes', 'no'])
    : '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>' +
      button_(links.manage, 'View or change my RSVP', false) + '</tr></table>';

  var body = '' +
'<tr><td class="pad" style="padding:40px 48px 8px;text-align:center;">' +
  '<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:3px;color:' + c.muted + ';">JUPITER TEXAS &middot; HOLIDAY PARTY</div>' +
  '<div class="h1" style="font-family:Georgia,\'Times New Roman\',serif;font-size:38px;line-height:46px;color:' + c.gold + ';padding:14px 0 0;">' + headline + '</div>' +
'</td></tr>' +
'<tr><td class="pad" style="padding:24px 48px 8px;">' +
  paragraph_('Dear ' + escapeHtml_(firstName_(guest.name)) + ',') + paragraph_(intro) +
'</td></tr>' +
'<tr><td class="pad" style="padding:8px 48px 0;">' + detailsBlock_() + '</td></tr>' +
'<tr><td class="pad" style="padding:32px 48px 40px;text-align:center;">' + buttons + '</td></tr>';

  var subject = isMaybe ? 'Still deciding? The Jupiter Texas Holiday Party is ' + when
                        : 'See you ' + when + ': Jupiter Texas Holiday Party';
  return {
    subject: subject,
    html: emailShell_({ title: subject, preheader: e.DATE_LABEL + ', ' + e.TIME_LABEL + ', ' + e.VENUE_ADDRESS, body: body, pixel: null }),
    text: 'Dear ' + firstName_(guest.name) + ',\n\n' + intro + '\n\nWhen: ' + e.DATE_LABEL + ', ' + e.TIME_LABEL +
      '\nWhere: ' + e.VENUE_NAME + ', ' + e.VENUE_ADDRESS + '\n\n' +
      (isMaybe ? 'Yes: ' + links.yes + '\nCan\'t make it: ' + links.no : 'View or change your RSVP: ' + links.manage) +
      '\n\nWarm regards,\nThe Jupiter Texas Team'
  };
}

/** Gentle follow-up for people who haven't answered. Same buttons, shorter note. */
function buildNudgeEmail(guest) {
  var c = EMAIL_COLORS, e = CONFIG.EVENT, links = rsvpLinks_(guest);
  var body = '' +
'<tr><td class="pad" style="padding:40px 48px 8px;">' +
  paragraph_('Dear ' + escapeHtml_(firstName_(guest.name)) + ',') +
  paragraph_('We would love to see you and your family at our Holiday Party on <strong>' + escapeHtml_(e.DATE_LABEL) + '</strong>. ' +
             'Could you let us know if you can make it? It is a single tap.') +
'</td></tr>' +
'<tr><td class="pad" style="padding:8px 48px 0;">' + detailsBlock_() + '</td></tr>' +
'<tr><td class="pad" style="padding:32px 48px 40px;text-align:center;">' + rsvpButtons_(links) + '</td></tr>';
  var subject = 'Will we see you on December 12?';
  return {
    subject: subject,
    html: emailShell_({ title: subject, preheader: 'One tap to RSVP for the Jupiter Texas Holiday Party.', body: body, pixel: links.pixel }),
    text: 'Dear ' + firstName_(guest.name) + ',\n\nCould you let us know if you can make our Holiday Party on ' + e.DATE_LABEL + '?\n\n' +
      'Yes: ' + links.yes + '\nMaybe: ' + links.maybe + '\nCan\'t make it: ' + links.no + '\n\nWarm regards,\nThe Jupiter Texas Team'
  };
}

/* The Google Sheet this script is attached to is the database.
 * Runs as info@jupitertexas.com, so every email and calendar invite comes from that account. */

var GUEST_SHEET = 'Guests';
var SETTINGS_SHEET = 'Settings';
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

  setupSettings_();
  installTriggers_();
  ensureTokens_();
  SpreadsheetApp.getActive().toast('Sheet and reminders are ready. Paste Name, Email and Phase into columns A to C.', 'Jupiter RSVP', 8);
}

function setupSettings_() {
  var ss = SpreadsheetApp.getActive();
  if (ss.getSheetByName(SETTINGS_SHEET)) return;
  var sheet = ss.insertSheet(SETTINGS_SHEET);
  sheet.getRange(1, 1, 3, 3).setValues([
    ['Setting', 'Paste here', 'What it is'],
    ['API link', '', 'From Apps Script: Deploy > New deployment > Web app > Who has access: Anyone. Ends in /exec'],
    ['RSVP page link', '', 'Your Netlify address, e.g. https://jupitertexas-rsvp.netlify.app']
  ]);
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#0B1330').setFontColor('#F2B01E');
  sheet.getRange(2, 2, 2, 1).setBackground('#FFF6DF');
  sheet.setColumnWidth(1, 140); sheet.setColumnWidth(2, 420); sheet.setColumnWidth(3, 520);
}

/** Reads the two links from the Settings tab. Throws a plain-English error if they are missing. */
function loadSettings_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SETTINGS_SHEET);
  if (!sheet) throw new Error('Run setup first.');
  var api = String(sheet.getRange('B2').getValue()).trim();
  var site = String(sheet.getRange('B3').getValue()).trim().replace(/\/+$/, '');
  var id = (api.match(/^https:\/\/script\.google\.com\/(?:a\/macros\/[^\/]+|macros)\/s\/([A-Za-z0-9_-]+)\/exec/) || [])[1];
  if (!id) {
    throw new Error('The "API link" in the Settings tab is missing or wrong. It should start with https://script.google.com and end with /exec.');
  }
  if (!/^https:\/\//.test(site)) throw new Error('The "RSVP page link" in the Settings tab is missing. Paste your Netlify address there.');
  // Workspace gives /a/macros/<domain>/ links, which can force a login. The plain form works for everyone.
  CONFIG.API_URL = 'https://script.google.com/macros/s/' + id + '/exec';
  CONFIG.SITE_URL = site;
}

function installTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'hourlyJobs') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('hourlyJobs').timeBased().everyHours(1).create();
}

function menuSendTest() {
  loadSettings_();
  var to = Session.getActiveUser().getEmail();
  sendEmail_(to, buildInviteEmail({ name: 'Test Investor', token: TEST_TOKEN }));
  var result = { to: to };
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
  loadSettings_();
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
  loadSettings_();
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
  loadSettings_();
  var to = Session.getActiveUser().getEmail();
  sendEmail_(to, buildInviteEmail({ name: 'Test Investor', token: TEST_TOKEN }));
  return { to: to };
}

function getEmailPreview(kind) {
  requireOwner_();
  loadSettings_();
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
  loadSettings_();
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
  if (hour >= 10 && hour <= 19) { loadSettings_(); sendReminders_(); }
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
