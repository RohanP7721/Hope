// Renders the email templates to static HTML files for review: node preview/render.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = {};
vm.createContext(ctx);
for (const f of ['Code.gs']) vm.runInContext(fs.readFileSync(path.join(root, 'apps-script', f), 'utf8'), ctx);
vm.runInContext("CONFIG.SITE_URL = '../rsvp-site'; CONFIG.API_URL = 'https://script.google.com/macros/s/AKfycbEXAMPLEEXAMPLEEXAMPLE/exec';", ctx);
const out = {
  'invite.html': ctx.buildInviteEmail({ name: 'Raj Mehta', token: 'TEST' }),
  'reminder-yes.html': ctx.buildReminderEmail({ name: 'Raj Mehta', token: 'TEST', rsvp: 'Yes', partySize: '3' }, 3),
  'reminder-maybe.html': ctx.buildReminderEmail({ name: 'Raj Mehta', token: 'TEST', rsvp: 'Maybe' }, 7),
  'nudge.html': ctx.buildNudgeEmail({ name: 'Raj Mehta', token: 'TEST' })
};
for (const [file, email] of Object.entries(out)) {
  fs.writeFileSync(path.join(__dirname, file), email.html);
  console.log(file.padEnd(20), (Buffer.byteLength(email.html) / 1024).toFixed(1) + ' KB', '|', email.subject);
}
