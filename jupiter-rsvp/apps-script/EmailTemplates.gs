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
  var base = CONFIG.SITE_URL + '/?t=' + encodeURIComponent(guest.token) + '&a=';
  return {
    yes: base + 'yes',
    maybe: base + 'maybe',
    no: base + 'no',
    manage: CONFIG.SITE_URL + '/?t=' + encodeURIComponent(guest.token),
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
