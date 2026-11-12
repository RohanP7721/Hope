# Jupiter Texas Holiday Party: invitations & RSVPs

Everything happens in email. No website.

- The invitation goes out from **info@jupitertexas.com** with the poster embedded inside the email.
- RSVP buttons (**Just me / Me +1 / Me +2 / Me +3 or more / Maybe / Can't make it**) each open a ready-made reply to info@. The investor presses **Send**.
- Every 5 minutes the script reads those replies in info@'s inbox, updates the Google Sheet, sends a Google Calendar invite (Yes/Maybe) and replies with a short thank-you in the same thread. Hand-typed replies ("Yes, 3 of us", "No sorry") are understood too; anything else stays unread for a person.
- Reminder emails go 7, 3 and 1 day before to Yes/Maybe guests. Bounces are detected hourly.
- Optional open tracking via an invisible image served by an "Anyone" Apps Script deployment (link pasted in the sheet's Settings tab).
- Private dashboard: an "Only myself" Apps Script deployment.

## Files

- `apps-script/Code.gs`, `apps-script/Dashboard.html`: the two files pasted into Apps Script
- `assets/poster.jpg`: downloaded once by `setup` into info@'s Drive (keep this path until setup has run)
- `guide/index.html`: step-by-step setup with copy buttons (rebuild with `python3 guide/build.py`)
- `preview/`: rendered emails (`node preview/render.js`)

## Sheet tabs

- **Guests**: Name, Email, Phase typed by you; the rest is filled by the system
- **Settings**: B2 = optional tracking link
- **Reply log**: every reply received and how it was read
