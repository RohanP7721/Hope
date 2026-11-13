/**
 * Jupiter Texas Holiday Party: invitations, RSVP tracking and reminders.
 * Investors answer from inside their email: each button opens a ready-made reply to info@.
 * Every 5 minutes this script reads those replies, updates the sheet and sends the calendar invite.
 */
var CONFIG = {
  // Only this Google account can open the dashboard.
  OWNER_EMAIL: 'info@jupitertexas.com',

  // How the sender appears in the investor's inbox.
  SENDER_NAME: 'Jupiter Texas',
  REPLY_TO: 'info@jupitertexas.com',
  SUBJECT: "You're invited: The Jupiter Texas Holiday Party, Sat Dec 12",

  // Optional. Filled in from the "Settings" tab; only used to track email opens.
  API_URL: '',
  // Where setup downloads the poster from, once. It is then kept in info@'s Google Drive
  // and embedded inside every invitation, so no website is needed.
  POSTER_SOURCE_URL: 'https://raw.githubusercontent.com/RohanP7721/Hope/claude/serene-cray-w4x1e9/jupiter-rsvp/assets/poster.jpg',
  // 'cid:poster' = the image travels inside the email. Previews swap in a data: URL.
  POSTER_SRC: 'cid:poster',

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

  // Reply subjects start with this, so the script can recognise RSVPs in info@'s inbox.
  RSVP_SUBJECT: 'Holiday Party RSVP',

  PARTY_OPTIONS: [
    { size: '1', button: 'Just me', words: 'just me' },
    { size: '2', button: 'Me +1', words: '2 of us' },
    { size: '3', button: 'Me +2', words: '3 of us' },
    { size: '4+', button: 'Me +3 or more', words: '4 or more of us' }
  ],

  TIMEZONE: 'America/Chicago'
};

/* ------------------------------------------------------------------ */
/* All wording investors see. Editable from the dashboard              */
/* ("Edit text & poster"); saved changes become the new default.       */
/* Placeholders in {curly brackets} are filled in per person.          */
/* ------------------------------------------------------------------ */

var TEXT_FIELDS = [
  // group, key, label, default, hint
  ['Event details', 'event_date', 'Date', 'Saturday, December 12, 2026', 'Shown in every email and the calendar invite. The calendar time itself is fixed in the code.'],
  ['Event details', 'event_time', 'Time', '6 PM onwards', ''],
  ['Event details', 'event_venue', 'Venue', 'Elegance Ballroom & Event Center (Hello India)', ''],
  ['Event details', 'event_address', 'Address', '8740 Ohio Dr A1, Plano, TX 75024', 'Tapping it opens Google Maps.'],
  ['Event details', 'rsvp_by', 'RSVP deadline', 'Saturday, December 5', ''],

  ['Invitation email', 'invite_subject', 'Subject line', "You're invited: The Jupiter Texas Holiday Party, Sat Dec 12", ''],
  ['Invitation email', 'invite_preview', 'Inbox preview line', 'You and your family are invited. {date}, {time}, Plano TX. RSVP by {rsvp_by}.', 'The grey line shown next to the subject in the inbox.'],
  ['Invitation email', 'invite_greeting', 'Greeting', 'Dear {first_name},', ''],
  ['Invitation email', 'invite_body', 'Message', 'As the year comes to a close, we would love to celebrate it with the people who made it possible: our investors. Please join us for an evening of food, music and festive cheer, and bring your family and friends along.', 'Leave an empty line between paragraphs. Put **two stars** around words to make them bold.'],
  ['Invitation email', 'invite_question', 'Big heading above the buttons', 'Will you join us?', ''],
  ['Invitation email', 'invite_rsvp_line', 'Line under the heading', 'Kindly RSVP by {rsvp_by}', ''],
  ['Invitation email', 'resend_subject', 'Subject when resending', 'RSVP in one tap: The Jupiter Texas Holiday Party, Sat Dec 12', 'Used by the "Resend" button for people who got the older buttons.'],

  ['Buttons', 'buttons_heading', 'Label above the buttons', 'COMING? TAP HOW MANY OF YOU', ''],
  ['Buttons', 'button_1', 'Button: 1 person', 'Just me', ''],
  ['Buttons', 'button_2', 'Button: 2 people', 'Me +1', ''],
  ['Buttons', 'button_3', 'Button: 3 people', 'Me +2', ''],
  ['Buttons', 'button_4', 'Button: 4 or more', 'Me +3 or more', ''],
  ['Buttons', 'button_maybe', 'Button: Maybe', 'Maybe', ''],
  ['Buttons', 'button_no', "Button: Can't make it", "Can't make it", ''],
  ['Buttons', 'button_changed', 'Button in "Yes" reminders', 'Plans changed? Let us know', ''],
  ['Buttons', 'buttons_note', 'Small note under the buttons', 'One tap is all it takes. Your calendar invite follows automatically.', ''],

  ['Sign-off & footer', 'signoff', 'Sign-off', 'Warm regards,\n**The Jupiter Texas Team**', ''],
  ['Sign-off & footer', 'footer_note', 'Footer note', 'You are receiving this invitation as a valued Jupiter Texas investor.', ''],

  ['Nudge email', 'nudge_subject', 'Subject line', 'Will we see you at the Jupiter Texas Holiday Party?', 'Sent once, from the "Nudge non-responders" button.'],
  ['Nudge email', 'nudge_body', 'Message', 'We would love to see you and your family at our Holiday Party on **{date}**. Could you let us know if you can make it? Just tap a button below.', ''],

  ['Reminder: said Yes', 'reminder_yes_subject', 'Subject line', 'See you {when}: Jupiter Texas Holiday Party', '{when} becomes "in 7 days", "in 3 days" or "tomorrow".'],
  ['Reminder: said Yes', 'reminder_yes_headline', 'Big heading', 'See you {when}!', ''],
  ['Reminder: said Yes', 'reminder_yes_body', 'Message', 'Just a reminder that the Jupiter Texas Holiday Party is {when}. We have you down for {party}. Family and friends are welcome.', '{party} becomes "just you", "2 people", "3 people" or "4 or more people".'],

  ['Reminder: said Maybe', 'reminder_maybe_subject', 'Subject line', 'Still deciding? The Jupiter Texas Holiday Party is {when}', ''],
  ['Reminder: said Maybe', 'reminder_maybe_headline', 'Big heading', 'Still deciding?', ''],
  ['Reminder: said Maybe', 'reminder_maybe_body', 'Message', 'The Jupiter Texas Holiday Party is {when} and we would still love to have you there. Let us know when you can, it helps us plan seating and food.', ''],

  ['Page after tapping a button', 'page_yes_title', 'Yes: heading', "You're in, {first_name}.", 'Shown for a moment after an investor taps a button.'],
  ['Page after tapping a button', 'page_yes_body', 'Yes: message', "We're planning for {party}. A calendar invite is on its way to your email. You can close this page.", ''],
  ['Page after tapping a button', 'page_maybe_title', 'Maybe: heading', "We've pencilled you in, {first_name}.", ''],
  ['Page after tapping a button', 'page_maybe_body', 'Maybe: message', "A calendar hold is on its way so the date doesn't slip away. Tap an answer below whenever you know.", ''],
  ['Page after tapping a button', 'page_no_title', "Can't make it: heading", "We'll miss you, {first_name}.", ''],
  ['Page after tapping a button', 'page_no_body', "Can't make it: message", 'Thank you for letting us know. If your plans change, tap a new answer below.', ''],

  ['Reply to email RSVPs', 'thanks_yes', 'Yes', "Thank you, {first_name}! You're confirmed for {party}. A calendar invite is on its way, and we'll send a reminder before the day.", 'Only used when someone answers by typing a reply instead of tapping.'],
  ['Reply to email RSVPs', 'thanks_maybe', 'Maybe', "Thanks, {first_name}. We've pencilled you in and sent a calendar hold so the date doesn't slip away. Just reply \"Yes\" or \"No\" here whenever you know.", ''],
  ['Reply to email RSVPs', 'thanks_no', "Can't make it", "Thank you for letting us know, {first_name}. We'll miss you! If your plans change, just reply \"Yes\" here.", ''],

  ['Calendar invite', 'calendar_title', 'Event name', 'The Jupiter Texas Holiday Party', ''],
  ['Calendar invite', 'calendar_description', 'Description', 'Jupiter Texas Real Estate Group invites you and your family. Friends are welcome too.\n\n{date}, {time}\n{venue}\n{address}\n\nQuestions? Write to info@jupitertexas.com', '']
];

var TEXTS_ = null;

/** Default wording merged with whatever was saved from the dashboard (and unsaved preview edits, if given). */
function loadTexts_(overrides) {
  var texts = {};
  TEXT_FIELDS.forEach(function (f) { texts[f[1]] = f[3]; });
  if (typeof PropertiesService !== 'undefined') {
    var saved = PropertiesService.getScriptProperties().getProperties();
    Object.keys(saved).forEach(function (k) {
      if (k.indexOf('TEXT_') === 0 && texts.hasOwnProperty(k.slice(5))) texts[k.slice(5)] = saved[k];
    });
  }
  Object.keys(overrides || {}).forEach(function (k) {
    if (texts.hasOwnProperty(k) && typeof overrides[k] === 'string') texts[k] = overrides[k];
  });
  TEXTS_ = texts;
  var e = CONFIG.EVENT;
  e.DATE_LABEL = texts.event_date;
  e.TIME_LABEL = texts.event_time;
  e.VENUE_NAME = texts.event_venue;
  e.VENUE_ADDRESS = texts.event_address;
  e.RSVP_BY_LABEL = texts.rsvp_by;
  e.TITLE = texts.calendar_title;
  e.MAP_URL = 'https://maps.google.com/?q=' + encodeURIComponent(texts.event_address);
  return texts;
}

function event_() {
  if (!TEXTS_) loadTexts_();
  return CONFIG.EVENT;
}

/** Plain text of one field with {placeholders} filled in. */
function T_(key, vars) {
  if (!TEXTS_) loadTexts_();
  var e = CONFIG.EVENT;
  var all = { date: e.DATE_LABEL, time: e.TIME_LABEL, venue: e.VENUE_NAME, address: e.VENUE_ADDRESS, rsvp_by: e.RSVP_BY_LABEL };
  Object.keys(vars || {}).forEach(function (k) { all[k] = vars[k]; });
  return String(TEXTS_[key] == null ? '' : TEXTS_[key]).replace(/\{(\w+)\}/g, function (m, name) {
    return all.hasOwnProperty(name) ? String(all[name]) : m;
  });
}

/** Same, as safe HTML: **bold**, line breaks kept. */
function TH_(key, vars) {
  return escapeHtml_(T_(key, vars)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

/** Message fields: blank lines start a new paragraph. */
function paragraphs_(key, vars) {
  return T_(key, vars).split(/\n\s*\n/).map(function (p) {
    return paragraph_(escapeHtml_(p.trim()).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
  }).join('');
}

function plain_(key, vars) {
  return T_(key, vars).replace(/\*\*(.+?)\*\*/g, '$1');
}

function partyWords_(size) {
  return { '1': 'just you', '2': '2 people', '3': '3 people', '4+': '4 or more people' }[size] || 'you';
}

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

/** Short reference that ties a reply back to the right investor, even if they reply from another address. */
function rsvpRef_(guest) {
  return String(guest.token || '').slice(0, 8).toUpperCase();
}

function mailto_(subject, body) {
  return 'mailto:' + CONFIG.REPLY_TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

var REPLY_HINT = 'Just press Send. You can add a note above if you like.';

/** Ready-made reply emails behind each button. */
function rsvpLinks_(guest) {
  var tag = ' [Ref ' + rsvpRef_(guest) + ']';
  var links = {
    maybe: mailto_(CONFIG.RSVP_SUBJECT + ': Maybe' + tag,
      'I might make it.\n\n(Optional: tell us what is holding you back, then press Send.)'),
    no: mailto_(CONFIG.RSVP_SUBJECT + ': Can\'t make it' + tag,
      'Sorry, I can\'t make it this time.\n\n' + REPLY_HINT),
    party: CONFIG.PARTY_OPTIONS.map(function (o, i) {
      return {
        label: TH_('button_' + (i + 1)),
        href: mailto_(CONFIG.RSVP_SUBJECT + ': Yes, ' + o.words + tag,
          'Count me in! We will be ' + (o.size === '1' ? 'just me' : o.words) + '.\n\n' + REPLY_HINT)
      };
    }),
    pixel: CONFIG.API_URL ? CONFIG.API_URL + '?api=o&t=' + encodeURIComponent(guest.token) : '',
    poster: CONFIG.POSTER_SRC
  };
  links.yes = links.party[0].href;
  links.oneTap = false;

  // With the Tracking link in Settings, every button is a one-tap link: tap and it's saved.
  if (CONFIG.API_URL) {
    var base = CONFIG.API_URL + '?t=' + encodeURIComponent(guest.token) + '&r=';
    links.party.forEach(function (p, i) { p.href = base + 'yes&n=' + CONFIG.PARTY_OPTIONS[i].size.replace('+', 'p'); });
    links.yes = links.party[0].href;
    links.maybe = base + 'maybe';
    links.no = base + 'no';
    links.oneTap = true;
  }
  return links;
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
'.btn-a{display:block!important;width:230px!important;margin:0 auto!important;box-sizing:border-box}.h1{font-size:30px!important;line-height:36px!important}}' +
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
  TH_('footer_note') + '<br>' +
  'Questions? Just reply to this email or write to ' +
  '<a href="mailto:' + CONFIG.REPLY_TO + '" style="color:' + c.gold + ';text-decoration:none;">' + CONFIG.REPLY_TO + '</a><br>' +
  '<a href="' + event_().WEBSITE + '" style="color:' + c.muted + ';">jupitertexas.com</a>' +
'</td></tr>';
}

function detailsBlock_() {
  var c = EMAIL_COLORS, e = event_();
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
    ';min-width:150px;box-sizing:border-box;border-radius:999px;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:' + color +
    ';text-decoration:none;text-align:center;mso-padding-alt:0;">' + text + '</a></td>';
}

function buttonRow_(cells) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>' + cells + '</tr></table>';
}

function smallLabel_(text) {
  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;color:' + EMAIL_COLORS.gold + ';font-weight:bold;padding:0 0 12px;">' + text + '</div>';
}

/**
 * The RSVP block. which: 'all' (invite, nudge), 'maybe-reminder' (Yes + Can't), 'yes-reminder' (Can't only).
 */
function rsvpButtons_(links, which) {
  which = which || 'all';
  var html = '';
  if (which !== 'yes-reminder') {
    html += smallLabel_(TH_('buttons_heading')) +
      buttonRow_(links.party.slice(0, 2).map(function (p) { return button_(p.href, p.label, true); }).join('')) +
      '<div style="height:10px;line-height:10px;">&nbsp;</div>' +
      buttonRow_(links.party.slice(2).map(function (p) { return button_(p.href, p.label, true); }).join('')) +
      '<div style="height:24px;line-height:24px;">&nbsp;</div>';
  }
  var others = which === 'all' ? button_(links.maybe, TH_('button_maybe'), false) + button_(links.no, TH_('button_no'), false)
    : button_(links.no, which === 'yes-reminder' ? TH_('button_changed') : TH_('button_no'), false);
  html += buttonRow_(others);
  html += '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:' + EMAIL_COLORS.muted + ';padding:20px 0 0;">' +
    (links.oneTap ? TH_('buttons_note')
      : 'Each button opens a ready-made reply. Just press <strong style="color:' + EMAIL_COLORS.ink + ';">Send</strong>.') + '</div>';
  return html;
}

function textButtons_() {
  return 'To RSVP, just reply to this email with one of:\n' +
    '  YES and how many of you (e.g. "Yes, 3 of us")\n  MAYBE\n  NO\n';
}

function paragraph_(html) {
  return '<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:' + EMAIL_COLORS.ink + ';">' + html + '</p>';
}

function signoffRow_() {
  return '<tr><td class="pad" style="padding:36px 48px 40px;">' + paragraph_(TH_('signoff')) + '</td></tr>';
}

/** The main invitation. */
function buildInviteEmail(guest) {
  var c = EMAIL_COLORS, e = event_(), links = rsvpLinks_(guest);
  var who = { first_name: firstName_(guest.name) };
  var subject = plain_('invite_subject', who);
  var body = '' +
'<tr><td style="padding:0;">' +
  '<img src="' + links.poster + '" width="600" alt="' + escapeHtml_(e.TITLE + ', ' + e.DATE_LABEL + ', ' + e.TIME_LABEL + ', ' + e.VENUE_NAME) + '" ' +
  'style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:14px;"></td></tr>' +
'<tr><td class="pad" style="padding:40px 48px 8px;">' +
  paragraph_(TH_('invite_greeting', who)) + paragraphs_('invite_body', who) +
'</td></tr>' +
'<tr><td class="pad" style="padding:8px 48px 0;">' + detailsBlock_() + '</td></tr>' +
'<tr><td class="pad" style="padding:40px 48px 8px;text-align:center;">' +
  '<div class="h1" style="font-family:Georgia,\'Times New Roman\',serif;font-size:34px;line-height:40px;color:' + c.gold + ';">' + TH_('invite_question', who) + '</div>' +
  '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:' + c.muted + ';padding:8px 0 24px;">' + TH_('invite_rsvp_line', who) + '</div>' +
  rsvpButtons_(links, 'all') +
'</td></tr>' + signoffRow_();

  return {
    subject: subject,
    html: emailShell_({ title: subject, preheader: plain_('invite_preview', who), body: body, pixel: links.pixel }),
    text: plain_('invite_greeting', who) + '\n\n' + plain_('invite_body', who) + '\n\n' +
      'When: ' + e.DATE_LABEL + ', ' + e.TIME_LABEL + '\nWhere: ' + e.VENUE_NAME + ', ' + e.VENUE_ADDRESS + '\n\n' +
      plain_('invite_rsvp_line', who) + '.\n' + textButtons_() + '\n' + plain_('signoff')
  };
}

/** Countdown reminder for people who said Yes or Maybe. */
function buildReminderEmail(guest, daysLeft) {
  var c = EMAIL_COLORS, e = event_(), links = rsvpLinks_(guest);
  var isMaybe = guest.rsvp === 'Maybe', kind = isMaybe ? 'reminder_maybe_' : 'reminder_yes_';
  var vars = {
    first_name: firstName_(guest.name),
    when: daysLeft === 1 ? 'tomorrow' : 'in ' + daysLeft + ' days',
    party: partyWords_(guest.partySize || '1')
  };
  var subject = plain_(kind + 'subject', vars);
  var body = '' +
'<tr><td class="pad" style="padding:40px 48px 8px;text-align:center;">' +
  '<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:3px;color:' + c.muted + ';">JUPITER TEXAS &middot; HOLIDAY PARTY</div>' +
  '<div class="h1" style="font-family:Georgia,\'Times New Roman\',serif;font-size:38px;line-height:46px;color:' + c.gold + ';padding:14px 0 0;">' + TH_(kind + 'headline', vars) + '</div>' +
'</td></tr>' +
'<tr><td class="pad" style="padding:24px 48px 8px;">' +
  paragraph_(TH_('invite_greeting', vars)) + paragraphs_(kind + 'body', vars) +
'</td></tr>' +
'<tr><td class="pad" style="padding:8px 48px 0;">' + detailsBlock_() + '</td></tr>' +
'<tr><td class="pad" style="padding:32px 48px 8px;text-align:center;">' + rsvpButtons_(links, isMaybe ? 'maybe-reminder' : 'yes-reminder') + '</td></tr>' +
  signoffRow_();

  return {
    subject: subject,
    html: emailShell_({ title: subject, preheader: e.DATE_LABEL + ', ' + e.TIME_LABEL + ', ' + e.VENUE_ADDRESS, body: body, pixel: null }),
    text: plain_('invite_greeting', vars) + '\n\n' + plain_(kind + 'body', vars) + '\n\nWhen: ' + e.DATE_LABEL + ', ' + e.TIME_LABEL +
      '\nWhere: ' + e.VENUE_NAME + ', ' + e.VENUE_ADDRESS + '\n\n' +
      (isMaybe ? textButtons_() : 'Plans changed? Just reply to this email and let us know.') + '\n\n' + plain_('signoff')
  };
}

/** Gentle follow-up for people who haven't answered. */
function buildNudgeEmail(guest) {
  var e = event_(), links = rsvpLinks_(guest), who = { first_name: firstName_(guest.name) };
  var subject = plain_('nudge_subject', who);
  var body = '' +
'<tr><td class="pad" style="padding:40px 48px 8px;">' +
  paragraph_(TH_('invite_greeting', who)) + paragraphs_('nudge_body', who) +
'</td></tr>' +
'<tr><td class="pad" style="padding:8px 48px 0;">' + detailsBlock_() + '</td></tr>' +
'<tr><td class="pad" style="padding:32px 48px 8px;text-align:center;">' + rsvpButtons_(links, 'all') + '</td></tr>' +
  signoffRow_();
  return {
    subject: subject,
    html: emailShell_({ title: subject, preheader: plain_('invite_preview', who), body: body, pixel: links.pixel }),
    text: plain_('invite_greeting', who) + '\n\n' + plain_('nudge_body', who) + '\n\n' + textButtons_() + '\n' + plain_('signoff')
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
  requireOwner_();
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
  savePoster_();
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
    ['API link', '', 'Optional, for open tracking. From Apps Script: Deploy > New deployment > Web app > Who has access: Anyone. Ends in /exec'],
    ['Dashboard access', '', 'Other jupitertexas.com emails that may open the dashboard, separated by commas. info@ always can.']
  ]);
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#0B1330').setFontColor('#F2B01E');
  sheet.getRange(2, 2).setBackground('#FFF6DF');
  sheet.setColumnWidth(1, 140); sheet.setColumnWidth(2, 420); sheet.setColumnWidth(3, 520);
}

/** Reads the optional API link (used only for open tracking) from the Settings tab. */
function loadSettings_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SETTINGS_SHEET);
  if (!sheet) throw new Error('Run setup first.');
  // Saved from the dashboard first, then the Settings tab's B2, then anywhere in the sheet.
  var api = (PropertiesService.getScriptProperties().getProperty('TRACKING_URL') || '').trim() ||
    String(sheet.getRange('B2').getValue()).trim() || findLinkInSheet_();
  if (!api) { CONFIG.API_URL = ''; return; }
  var id = (api.match(/^https:\/\/script\.google\.com\/(?:a\/macros\/[^\/]+|macros)\/s\/([A-Za-z0-9_-]+)\/exec/) || [])[1];
  if (!id) {
    throw new Error('The "API link" in the Settings tab looks wrong. It should start with https://script.google.com and end with /exec. Or leave it empty.');
  }
  // Workspace gives /a/macros/<domain>/ links, which can force a login. The plain form works for everyone.
  CONFIG.API_URL = 'https://script.google.com/macros/s/' + id + '/exec';
}

/** Finds a pasted Apps Script /exec link anywhere in the spreadsheet (in case it went into the wrong cell). */
function findLinkInSheet_() {
  var sheets = SpreadsheetApp.getActive().getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var cells = sheets[i].createTextFinder('script.google.com').findAll();
    for (var j = 0; j < cells.length; j++) {
      var m = String(cells[j].getValue()).match(/https:\/\/script\.google\.com\/\S+?\/exec/);
      if (m) return m[0];
    }
  }
  return '';
}

/** Saves the Tracking link pasted into the dashboard's warning box. */
function saveTrackingLink(url) {
  requireOwner_();
  url = String(url || '').trim();
  if (!/^https:\/\/script\.google\.com\/(?:a\/macros\/[^\/]+|macros)\/s\/[A-Za-z0-9_-]+\/exec/.test(url)) {
    throw new Error('That isn\'t the Tracking link. It starts with https://script.google.com and ends with /exec. Copy it from Deploy > Manage deployments > Tracking.');
  }
  url = url.replace(/\/exec.*$/, '/exec');
  PropertiesService.getScriptProperties().setProperty('TRACKING_URL', url);
  var settings = SpreadsheetApp.getActive().getSheetByName(SETTINGS_SHEET);
  if (settings) settings.getRange('B2').setValue(url);
  return trackingHealth_();
}

/* Poster: downloaded once into info@'s Drive, then attached inside each invitation. */
function savePoster_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('POSTER_FILE_ID');
  if (id) { try { DriveApp.getFileById(id).getSize(); return; } catch (e) { /* deleted, fetch again */ } }
  var blob = UrlFetchApp.fetch(CONFIG.POSTER_SOURCE_URL).getBlob().setName('Jupiter Holiday Party poster.jpg');
  var file = DriveApp.createFile(blob);
  props.setProperty('POSTER_FILE_ID', file.getId());
}

var posterBlobCache_ = null;
function posterBlob_() {
  if (posterBlobCache_) return posterBlobCache_;
  var id = PropertiesService.getScriptProperties().getProperty('POSTER_FILE_ID');
  if (!id) throw new Error('The poster is missing. Run setup again.');
  posterBlobCache_ = DriveApp.getFileById(id).getBlob().setName('poster.jpg');
  return posterBlobCache_;
}

function installTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['hourlyJobs', 'processReplies'].indexOf(t.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('hourlyJobs').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('processReplies').timeBased().everyMinutes(5).create();
}

function menuSendTest() {
  requireOwner_();
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
      case 'ping': return ContentService.createTextOutput(PING_REPLY);
    }
    if (p.r) return tapPage_(p.t, p.r, p.n);
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('');
  }

  if (!isOwner_()) {
    var who = Session.getActiveUser().getEmail();
    var msg = who
      ? 'You are signed in as <b>' + escapeHtml_(who) + '</b>, which isn\'t allowed to open this dashboard. ' +
        'Ask info@jupitertexas.com to add this email to the sheet\'s Settings tab, cell B3.'
      : 'This is the <b>Tracking</b> link. It powers the buttons inside the invitation and has no dashboard. ' +
        'Open your <b>Dashboard</b> link instead (Apps Script: Deploy &gt; Manage deployments &gt; Dashboard).';
    return HtmlService.createHtmlOutput('<div style="font:16px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;padding:48px 24px;color:#1D1D1F">' +
      '<h2 style="margin:0 0 12px">Jupiter Holiday Party dashboard</h2><p>' + msg + '</p></div>').setTitle('Jupiter RSVP');
  }
  return HtmlService.createTemplateFromFile('Dashboard').evaluate()
    .setTitle('Jupiter Holiday Party · RSVPs')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ------------------------------------------------------------------ */
/* Tracking link health check                                          */
/* ------------------------------------------------------------------ */

var PING_REPLY = 'jupiter-rsvp-ok-v4';

/**
 * Opens the Tracking link the way an investor's phone would, and reports in plain English what's wrong.
 * Without a working link, buttons can't save with one tap and opens can't be seen, so sending is blocked.
 */
function trackingHealth_() {
  loadSettings_();
  if (!CONFIG.API_URL) {
    return { ok: false, missing: true, message: 'The Tracking link is missing. Paste it in the box below and click Save.' };
  }
  var cache = CacheService.getScriptCache(), key = 'health:' + CONFIG.API_URL;
  var cached = cache.get(key);
  if (cached) return JSON.parse(cached);
  var result;
  try {
    var res = UrlFetchApp.fetch(CONFIG.API_URL + '?api=ping', { muteHttpExceptions: true, followRedirects: true });
    var body = res.getContentText();
    if (body.trim() === PING_REPLY) result = { ok: true, message: '' };
    else if (/accounts\.google\.com|ServiceLogin|Sign in/i.test(body) || res.getResponseCode() === 401 || res.getResponseCode() === 403) {
      result = { ok: false, message: 'The Tracking link is not open to everyone. In Apps Script: Deploy > Manage deployments > Tracking > pencil > Who has access: "Anyone" > Deploy.' };
    } else if (res.getResponseCode() === 404) {
      result = { ok: false, message: 'The Tracking link in Settings B2 doesn\'t exist. Copy it again from Deploy > Manage deployments > Tracking and paste it into B2.' };
    } else {
      result = { ok: false, message: 'The Tracking link is running old code. In Apps Script: Deploy > Manage deployments > Tracking > pencil > Version: "New version" > Deploy.' };
    }
  } catch (err) {
    result = { ok: false, message: 'Could not reach the Tracking link: ' + err.message };
  }
  cache.put(key, JSON.stringify(result), result.ok ? 600 : 30);
  return result;
}

function requireTracking_() {
  var h = trackingHealth_();
  if (!h.ok) throw new Error('Not sent. ' + h.message);
}

/**
 * The small confirmation shown after an investor taps a button in the email.
 * The answer is saved by the page's script, not by simply opening the link, so email security
 * scanners that pre-open every link in an email can't register a fake RSVP.
 */
function tapPage_(token, action, size, preview) {
  if (!preview) loadSettings_();
  var boot = {
    t: String(token || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 40),
    r: ['yes', 'maybe', 'no'].indexOf(String(action).toLowerCase()) !== -1 ? String(action).toLowerCase() : '',
    n: ['1', '2', '3', '4p'].indexOf(String(size)) !== -1 ? String(size) : '',
    base: CONFIG.API_URL,
    text: {},
    preview: preview || null
  };
  ['page_yes_title', 'page_yes_body', 'page_maybe_title', 'page_maybe_body', 'page_no_title', 'page_no_body',
   'button_1', 'button_2', 'button_3', 'button_4', 'button_maybe', 'button_no'].forEach(function (k) {
    boot.text[k] = plain_(k); // placeholders like {first_name} are filled in on the page
  });
  var e = event_();
  var html = TAP_PAGE_HTML
    .replace('__BOOT__', JSON.stringify(boot))
    .replace(/__DATE__/g, escapeHtml_(e.DATE_LABEL)).replace(/__TIME__/g, escapeHtml_(e.TIME_LABEL))
    .replace(/__VENUE__/g, escapeHtml_(e.VENUE_NAME)).replace(/__ADDRESS__/g, escapeHtml_(e.VENUE_ADDRESS))
    .replace(/__MAP__/g, e.MAP_URL);
  return HtmlService.createHtmlOutput(html)
    .setTitle('RSVP · The Jupiter Texas Holiday Party')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Called by the confirmation page. Public on purpose: it only works with the guest's private token. */
function tapRsvp(token, action, size) {
  var result = handleRsvp_(token, action);
  if (!result.ok || action !== 'yes' || !size) return result;
  var party = size === '4p' ? '4+' : size;
  if (['1', '2', '3', '4+'].indexOf(party) === -1) return result;
  result.partySize = party;
  if (token !== TEST_TOKEN) {
    var found = findGuestByToken_(token);
    if (found) setCells_(found.sheet, found.col, found.guest.row, { 'Party Size': party });
  }
  return result;
}

var TAP_PAGE_HTML = [
'<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">',
'<style>',
'  body{margin:0;background:#0B1330;color:#fff;font:16px/1.55 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh}',
'  .page{max-width:480px;margin:0 auto;padding:36px 20px 48px}',
'  .brand{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#B7BED6}.brand b{color:#fff}.brand i{font-style:normal;color:#F2B01E}',
'  .icon{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:rgba(242,176,30,.14);border:1px solid rgba(242,176,30,.4);margin:36px 0 20px;font-size:24px;color:#F2B01E}',
'  h1{font-family:"Playfair Display",Georgia,serif;font-weight:500;font-size:38px;line-height:1.15;margin:0}h1 em{font-style:normal;color:#F2B01E}',
'  .lede{color:#B7BED6;font-size:17px;margin:14px 0 0}',
'  .card{margin-top:28px;background:#121C40;border:1px solid #26305A;border-radius:16px;padding:20px}',
'  .k{font-weight:500}.v{color:#B7BED6;font-size:14px}.v a{color:#B7BED6}.row+.row{margin-top:14px}',
'  .change{margin-top:28px;text-align:center;color:#8890AE;font-size:14px;line-height:2}.change a{color:#B7BED6;margin:0 6px}',
'  .spin{width:28px;height:28px;border:2.5px solid #26305A;border-top-color:#F2B01E;border-radius:50%;animation:s .8s linear infinite;margin:90px auto 16px}',
'  @keyframes s{to{transform:rotate(360deg)}}.c{text-align:center;color:#B7BED6}',
'</style>',
'<main class="page"><div class="brand"><b>Jupiter Texas</b> · <i>Holiday Party</i></div><div id="view"><div class="spin"></div><p class="c">Saving your RSVP…</p></div></main>',
'<script>',
'(function(){',
'  var B = __BOOT__, view = document.getElementById("view");',
'  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}',
'  function link(r,n,label){return \'<a target="_top" href="\'+B.base+"?t="+B.t+"&r="+r+(n?"&n="+n:"")+\'">\'+label+"</a>";}',
'  var details = \'<div class="card"><div class="row"><div class="k">__DATE__</div><div class="v">__TIME__</div></div>\' +',
'    \'<div class="row"><div class="k">__VENUE__</div><div class="v"><a target="_blank" href="__MAP__">__ADDRESS__</a></div></div></div>\';',
'  function fill(key, d, nameAsGold){',
'    var name = esc(d.firstName), party = {"1":"just you","2":"2 people","3":"3 people","4+":"4 or more people"}[d.partySize] || "you";',
'    return esc(B.text[key]).replace(/\{first_name\}/g, nameAsGold ? "<em>"+name+"</em>" : name).replace(/\{party\}/g, party);',
'  }',
'  function show(d){',
'    var change = \'<div class="change">Change your answer:<br>\' + link("yes","1",esc(B.text.button_1)) + link("yes","2",esc(B.text.button_2)) + link("yes","3",esc(B.text.button_3)) +',
'      link("yes","4p",esc(B.text.button_4)) + "<br>" + link("maybe","",esc(B.text.button_maybe)) + link("no","",esc(B.text.button_no)) + "</div>";',
'    var k = d.rsvp === "Yes" ? "yes" : d.rsvp === "Maybe" ? "maybe" : "no";',
'    view.innerHTML = \'<div class="icon">\' + (k === "no" ? "♡" : "✓") + "</div><h1>" + fill("page_" + k + "_title", d, true) + "</h1>" +',
'      \'<p class="lede">\' + fill("page_" + k + "_body", d) + "</p>" + (k === "no" ? "" : details) + change;',
'  }',
'  function fail(){ view.innerHTML = \'<h1 style="margin-top:36px">We couldn\\\'t <em>save that</em>.</h1><p class="lede">Please tap the button in your email again, or simply reply to the email with Yes, Maybe or No.</p>\'; }',
'  function go(){',
'    if (B.preview) return show(B.preview);',
'    if (!B.t || !B.r) return fail();',
'    google.script.run.withSuccessHandler(function(d){ d && d.ok ? show(d) : fail(); }).withFailureHandler(fail).tapRsvp(B.t, B.r, B.n);',
'  }',
'  // Wait until a person is actually looking at the page (email scanners open links in hidden browsers).',
'  if (!document.hidden) setTimeout(go, 200);',
'  else document.addEventListener("visibilitychange", function once(){ if (!document.hidden){ document.removeEventListener("visibilitychange", once); setTimeout(go, 200);} });',
'})();',
'</script>'
].join('\n');

/**
 * Who may open the dashboard: info@ plus any emails typed into the Settings tab, cell B3
 * (comma-separated). Everything still runs and sends as info@.
 */
function dashboardUsers_() {
  var users = [CONFIG.OWNER_EMAIL.toLowerCase()];
  try {
    var sheet = SpreadsheetApp.getActive().getSheetByName(SETTINGS_SHEET);
    if (sheet) String(sheet.getRange('B3').getValue()).split(/[\s,;]+/).forEach(function (e) {
      if (EMAIL_PATTERN.test(e)) users.push(e.toLowerCase());
    });
  } catch (err) { /* sheet unavailable: info@ only */ }
  return users;
}

function isOwner_() {
  var user = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  return !!user && dashboardUsers_().indexOf(user) !== -1;
}

function requireOwner_() {
  if (!isOwner_()) throw new Error('This Google account can\'t use the dashboard. Add it to the Settings tab, cell B3.');
}

function publicGuest_(g, extra) {
  var out = {
    ok: true,
    firstName: firstName_(g.name),
    email: g.email,
    rsvp: g.rsvp,
    partySize: g.partySize,
    reason: g.reason
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

/* ------------------------------------------------------------------ */
/* Reading RSVP replies from info@'s inbox (runs every 5 minutes)      */
/* ------------------------------------------------------------------ */

var REPLY_LOG_SHEET = 'Reply log';
var RSVP_LABEL = 'Holiday Party RSVPs';

function replyLog_() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(REPLY_LOG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(REPLY_LOG_SHEET);
    sheet.getRange(1, 1, 1, 6).setValues([['Received', 'From', 'Subject', 'Read as', 'Matched investor', 'Message ID']])
      .setFontWeight('bold').setBackground('#0B1330').setFontColor('#F2B01E');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Works out what a reply means. Returns null if it isn't an RSVP. */
function parseReply_(subject, body) {
  var text = (subject + '\n' + body).toLowerCase();
  var ref = (subject.match(/\[ref\s+([a-z0-9]{4,})\]/i) || [])[1] || '';
  var choice = null, party = '';

  // Button replies carry the answer in the subject. A later "Re:" reply may change it, so read its message instead.
  var tagged = /^\s*re:/i.test(subject) ? null : subject.match(/holiday party rsvp:\s*(yes|maybe|can.?t make it)/i);
  if (tagged) {
    choice = /^yes/i.test(tagged[1]) ? 'Yes' : /^maybe/i.test(tagged[1]) ? 'Maybe' : 'No';
  } else {
    // Plain reply typed by hand, e.g. "Yes, 3 of us" or "no sorry". Look at the first line only.
    var first = String(body).replace(/^\s+/, '').split(/\n/)[0].toLowerCase();
    if (/^(yes|yep|yeah|count (me|us) in|we('| a)re in|i('| a)m in|attending)\b/.test(first)) choice = 'Yes';
    else if (/^(maybe|not sure|might)\b/.test(first)) choice = 'Maybe';
    else if (/^(no|sorry|unfortunately|can.?t|cannot|won.?t)\b/.test(first)) choice = 'No';
    text = first;
  }
  if (!choice) return null;

  if (choice === 'Yes') {
    if (/4 or more|\+ ?3 or more/.test(text)) party = '4+';
    else if (/just me|only me|myself/.test(text)) party = '1';
    else {
      var n = text.match(/\b([1-9])\s*(of us|people|persons|guests|adults|in total)\b/) || text.match(/\+\s*([1-9])\b/);
      if (n) {
        var count = n[0].indexOf('+') !== -1 ? Number(n[1]) + 1 : Number(n[1]);
        party = count >= 4 ? '4+' : String(count);
      }
    }
  }

  // Anything the investor typed themselves, minus our pre-filled lines.
  var note = String(body)
    .replace(/(^|\n)\s*>.*$/g, '')
    .split(/\n(?:on .+wrote:|-{2,}|_{2,}|from: )/i)[0]
    .replace(/I might make it\.|\(Optional: tell us what is holding you back, then press Send\.\)|Sorry, I can't make it this time\.|Count me in! We will be [^.]+\.|Just press Send\.( You can add a note above if you like\.)?/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, 300);

  return { choice: choice, party: party, ref: ref, note: note };
}

function emailAddress_(from) {
  var m = String(from).match(/<([^>]+)>/);
  return (m ? m[1] : String(from)).trim().toLowerCase();
}

function findGuestByRef_(ref) {
  if (!ref) return null;
  var sheet = guestSheet_(), col = columnMap_(sheet), last = sheet.getLastRow();
  if (last < 2) return null;
  var cell = sheet.getRange(2, col['Token'], last - 1, 1)
    .createTextFinder('^' + ref.toLowerCase().replace(/[^a-z0-9]/g, '')).useRegularExpression(true).findNext();
  if (!cell) return null;
  var values = sheet.getRange(cell.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
  return rowToGuest_(values, col, cell.getRow());
}

function findGuestByEmail_(email) {
  var guests = readGuests_().guests;
  for (var i = 0; i < guests.length; i++) if (guests[i].email === email) return guests[i];
  return null;
}

/** Trigger: reads new RSVP replies, records them, sends the calendar invite and a short thank-you in the same thread. */
function processReplies() {
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(1000)) return;
  try {
    var owner = CONFIG.OWNER_EMAIL.toLowerCase();
    var log = replyLog_();
    var seen = {};
    if (log.getLastRow() > 1) log.getRange(2, 6, log.getLastRow() - 1, 1).getValues().forEach(function (r) { seen[r[0]] = true; });

    var query = '{subject:"' + CONFIG.RSVP_SUBJECT + '" subject:"Jupiter Texas Holiday Party"} newer_than:21d -in:sent';
    var threads = GmailApp.search(query, 0, 100);
    var label = GmailApp.getUserLabelByName(RSVP_LABEL) || GmailApp.createLabel(RSVP_LABEL);

    threads.forEach(function (thread) {
      thread.getMessages().forEach(function (msg) {
        var id = msg.getId();
        if (seen[id]) return;
        var from = emailAddress_(msg.getFrom());
        var subject = msg.getSubject();
        var isTest = /\[ref test\]/i.test(subject);
        // Skip our own invites, reminders and thank-yous. A test RSVP from info@ to itself counts once, never its "Re:" thank-you.
        if (from === owner && (!isTest || /^\s*re:/i.test(subject))) return;
        seen[id] = true;

        var parsed = parseReply_(subject, msg.getPlainBody());
        var outcome = 'Not an RSVP (left for you to read)', who = '';
        if (parsed) {
          if (isTest) {
            outcome = 'Test reply: ' + parsed.choice + (parsed.party ? ', party ' + parsed.party : '');
            who = 'Test';
            sendThankYou_(msg, { name: 'Test Investor' }, parsed);
          } else {
            var guest = findGuestByRef_(parsed.ref) || findGuestByEmail_(from);
            if (!guest) {
              outcome = 'RSVP ' + parsed.choice + ', but no matching investor (check manually)';
            } else {
              who = guest.name + ' <' + guest.email + '>';
              applyRsvp_(guest, parsed);
              sendThankYou_(msg, guest, parsed);
              outcome = parsed.choice + (parsed.party ? ', party ' + parsed.party : '') + (parsed.note ? ', note: ' + parsed.note : '');
            }
          }
          msg.markRead();
          thread.addLabel(label);
        }
        log.appendRow([msg.getDate(), from, subject, outcome, who, id]);
      });
    });
  } finally { lock.releaseLock(); }
}

function applyRsvp_(guest, parsed) {
  handleRsvp_(guest.token, parsed.choice.toLowerCase());
  var found = findGuestByToken_(guest.token);
  var fields = {};
  if (parsed.choice === 'Yes' && parsed.party) fields['Party Size'] = parsed.party;
  if (parsed.choice === 'Maybe') fields['Maybe Reason'] = parsed.note || '';
  if (Object.keys(fields).length) setCells_(found.sheet, found.col, found.guest.row, fields);
}

function sendThankYou_(msg, guest, parsed) {
  var e = event_();
  var vars = { first_name: firstName_(guest.name), party: partyWords_(parsed.party || '1') };
  var line = TH_({ Yes: 'thanks_yes', Maybe: 'thanks_maybe', No: 'thanks_no' }[parsed.choice], vars);
  var html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#1D1D1F;">' +
    '<p>' + line + '</p>' +
    (parsed.choice === 'No' ? '' : '<p><strong>' + escapeHtml_(e.DATE_LABEL) + ', ' + escapeHtml_(e.TIME_LABEL) + '</strong><br>' +
      escapeHtml_(e.VENUE_NAME) + '<br><a href="' + e.MAP_URL + '">' + escapeHtml_(e.VENUE_ADDRESS) + '</a></p>') +
    '<p>' + TH_('signoff') + '</p></div>';
  var text = html.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').trim()
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  msg.reply(text, { htmlBody: html, name: CONFIG.SENDER_NAME });
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
  var e = event_();
  var event = CalendarApp.getDefaultCalendar().createEvent(
    e.TITLE, new Date(e.START_ISO), new Date(e.END_ISO), {
      location: e.VENUE_NAME + ', ' + e.VENUE_ADDRESS,
      description: plain_('calendar_description', { first_name: firstName_(guest.name) }) + '\n\nDirections: ' + e.MAP_URL,
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
    quota: MailApp.getRemainingDailyQuota(),
    tracking: trackingHealth_()
  };
}

/** Sends up to one batch; the dashboard keeps calling until remaining is 0. */
function sendPhaseBatch(phase) {
  requireOwner_();
  loadSettings_();
  requireTracking_();
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
  var options = { htmlBody: email.html, name: CONFIG.SENDER_NAME, replyTo: CONFIG.REPLY_TO };
  if (email.html.indexOf('cid:poster') !== -1) options.inlineImages = { poster: posterBlob_() };
  GmailApp.sendEmail(to, email.subject, email.text, options);
}

function sendTestToMe() {
  requireOwner_();
  loadSettings_();
  requireTracking_();
  var to = Session.getActiveUser().getEmail();
  sendEmail_(to, buildInviteEmail({ name: 'Test Investor', token: TEST_TOKEN }));
  return { to: to };
}

function posterDataUrl_() {
  var blob = posterBlob_();
  return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
}

/** Preview any email or the tap page, optionally with unsaved edits from the text editor. */
function getEmailPreview(kind, overrides) {
  requireOwner_();
  loadSettings_();
  loadTexts_(overrides);
  CONFIG.POSTER_SRC = posterDataUrl_(); // previews can't show the embedded poster, so use a copy
  var demo = { name: 'Raj Mehta', token: TEST_TOKEN, rsvp: kind === 'reminder-maybe' ? 'Maybe' : 'Yes', partySize: '3' };
  if (kind === 'nudge') return buildNudgeEmail(demo).html;
  if (kind && kind.indexOf('reminder') === 0) return buildReminderEmail(demo, 3).html;
  if (kind && kind.indexOf('page-') === 0) {
    var rsvp = { 'page-yes': 'Yes', 'page-maybe': 'Maybe', 'page-no': 'No' }[kind];
    return tapPage_('', '', '', { firstName: 'Raj', rsvp: rsvp, partySize: '3' }).getContent();
  }
  return buildInviteEmail(demo).html;
}

/** Everything the "Edit text & poster" screen needs. */
function getTextEditor() {
  requireOwner_();
  var texts = loadTexts_();
  return {
    fields: TEXT_FIELDS.map(function (f) { return { group: f[0], key: f[1], label: f[2], def: f[3], hint: f[4], value: texts[f[1]] }; }),
    poster: posterDataUrl_()
  };
}

/** Saves edited wording as the new default for every future email. */
function saveTexts(values) {
  requireOwner_();
  var props = PropertiesService.getScriptProperties();
  TEXT_FIELDS.forEach(function (f) {
    var key = f[1], value = values[key];
    if (typeof value !== 'string') return;
    value = value.replace(/\r\n/g, '\n');
    if (value.trim() === '' || value === f[3]) props.deleteProperty('TEXT_' + key);
    else props.setProperty('TEXT_' + key, value);
  });
  return getTextEditor();
}

/** Replaces the poster used in every future invitation. */
function savePosterUpload(base64, mimeType) {
  requireOwner_();
  if (['image/jpeg', 'image/png'].indexOf(mimeType) === -1) throw new Error('Please upload a JPG or PNG image.');
  var bytes = Utilities.base64Decode(base64);
  if (bytes.length > 3 * 1024 * 1024) throw new Error('That image is over 3 MB. Please export a smaller JPG (under 1 MB is best for email).');
  var file = DriveApp.createFile(Utilities.newBlob(bytes, mimeType, 'Jupiter Holiday Party poster ' + new Date().toISOString().slice(0, 10)));
  PropertiesService.getScriptProperties().setProperty('POSTER_FILE_ID', file.getId());
  posterBlobCache_ = null;
  return posterDataUrl_();
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

/* Resend: a fresh one-tap invite to people whose first invite had the old buttons and who haven't answered. */
function resendCandidates_(guests) {
  return guests.filter(function (g) {
    return g.status === 'Sent' && !g.rsvp && g.emailsSent.split(',').indexOf('resend') === -1;
  });
}

function sendResendBatch() {
  requireOwner_();
  loadSettings_();
  requireTracking_();
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) throw new Error('Another send is already running.');
  try {
    var data = readGuests_(), list = resendCandidates_(data.guests), batch = list.slice(0, SEND_BATCH), sent = 0;
    batch.forEach(function (g) {
      try {
        var email = buildInviteEmail(g);
        email.subject = plain_('resend_subject', { first_name: firstName_(g.name) });
        sendEmail_(g.email, email);
        setCells_(data.sheet, data.col, g.row, { 'Emails Sent': addTag_(g.emailsSent, 'resend') });
        sent++;
      } catch (err) { console.error('Resend failed for ' + g.email + ': ' + err); }
      SpreadsheetApp.flush();
    });
    return { sent: sent, remaining: list.length - batch.length };
  } finally { lock.releaseLock(); }
}

function previewNudge() {
  requireOwner_();
  return { count: nudgeCandidates_(readGuests_().guests).length, days: CONFIG.NUDGE_AFTER_DAYS };
}

function sendNudgeBatch() {
  requireOwner_();
  loadSettings_();
  requireTracking_();
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
    tracking: trackingHealth_(),
    resendCount: resendCandidates_(guests).length,
    sheetUrl: SpreadsheetApp.getActive().getUrl(),
    daysLeft: daysUntilEvent_(),
    updatedAt: new Date().toISOString()
  };
}
