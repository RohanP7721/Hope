/**
 * Jupiter Texas Holiday Party: settings.
 * This is the only file that should need editing.
 */
var CONFIG = {
  // Only this Google account can open the dashboard.
  OWNER_EMAIL: 'info@jupitertexas.com',

  // How the sender appears in the investor's inbox.
  SENDER_NAME: 'Jupiter Texas',
  REPLY_TO: 'info@jupitertexas.com',
  SUBJECT: "You're invited: The Jupiter Texas Holiday Party, Sat Dec 12",

  // Fill these two in after deploying (see SETUP.md, steps 4 and 5).
  // API_URL: the "Anyone" web app URL from Apps Script (ends in /exec).
  // SITE_URL: where the rsvp-site folder is hosted, no trailing slash.
  API_URL: 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE',
  SITE_URL: 'https://rsvp.jupitertexas.com',

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
