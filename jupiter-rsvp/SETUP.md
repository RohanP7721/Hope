# Jupiter Texas Holiday Party: invitations & RSVPs

Sends the invitation from **info@jupitertexas.com**, tracks who opened it, and records one-tap RSVPs (Yes / Maybe / Can't make it) in the Google Sheet.

## How it works

```
Google Sheet (database)  ←→  Apps Script (runs as info@)  ←→  RSVP page (rsvp.jupitertexas.com)
                                  │
                                  ├── sends invites, nudges, reminders via Gmail (info@)
                                  ├── sends calendar invites via Google Calendar (info@)
                                  └── serves the private dashboard (only info@ can open it)
```

| Investor does | What happens |
|---|---|
| Opens the email | Marked **Opened** with the time (invisible tracking image) |
| Taps **Yes** | RSVP saved → real calendar invite sent from info@ → page asks party size (Just me / +1 / +2 / +3 or more) |
| Taps **Maybe** | RSVP saved → calendar invite sent → page asks the reason (Schedule clash / Travelling / Checking with family / Other) |
| Taps **Can't make it** | RSVP saved, removed from the calendar if it was there, no more emails |
| Said Yes or Maybe | Reminder emails 7 days, 3 days and 1 day before (sent automatically, 10 AM to 7 PM Central) |

## Folders

- `guide/index.html`: the step-by-step setup guide with copy buttons (rebuild with `python3 guide/build.py` after code changes)
- `apps-script/Code.gs` + `apps-script/Dashboard.html`: the two files pasted into Google Apps Script
- `rsvp-site/`: the RSVP page investors land on (`jupiter-rsvp-page.zip` is the same folder, ready to drag onto Netlify)
- `preview/`: the emails rendered as files you can open in a browser to check them

The two web links (API link, RSVP page link) go in the sheet's **Settings** tab, not in code, so no redeploy is needed after setup.
The RSVP page needs no configuration: every email link carries the Apps Script deployment id (`k=`).

Follow `guide/index.html` for setup.

## Before the first real send

1. **Test email:** Dashboard → Send invitations → **Send test to me**. Tap the buttons in it. The test invite saves nothing, so tap freely.
2. **Full dry run:** add your own personal email as a row with Phase `0`. Send Phase 0, then open it on your phone, tap **Yes**, and check:
   - the row in the dashboard shows Opened and Attending
   - a calendar invite from info@ shows up
   - party size saves
   Then tap **Can't make it** and check that the calendar event disappears.
3. Also check that the email doesn't land in Promotions or Spam in Gmail and Outlook.

## Using it

- **Add investors:** paste **Name, Email, Phase** into columns A to C of the `Guests` tab. Leave the grey columns alone, the system fills them in.
- **Send a phase:** Dashboard → **Send invitations** → choose the phase → it shows how many it found, skipped and will send → **Send**. Anyone already invited is skipped automatically, so sending the same phase twice is harmless.
- **Follow up:** **Nudge non-responders** sends one short follow-up to people who got the invite 4 or more days ago and haven't answered.
- **Reminders** are fully automatic.
- **Bounced emails** are detected from info@'s inbox every hour and show up as **Bounced**.

## Good to know

- **Gmail limit:** about 2,000 emails a day from a Workspace account. 500 invites in phases is well within that.
- **"Opened" is close but not exact.** Apple Mail loads every image automatically, so some Apple users show as opened before they've actually read it. The RSVP is the number to trust.
- **Forwarding:** each investor's buttons are personal. If someone forwards the email and their friend taps Yes, it counts as the investor's RSVP. That's fine here, because party size covers guests.
- **info@'s calendar** gets one event per Yes or Maybe guest at 6 PM on Dec 12. Each guest only sees their own invite and never the guest list.
- **To change event details** (time, venue): edit `Config.gs` and `rsvp-site/index.html` and the `.ics` file, then redeploy. Calendar invites already sent won't update on their own.
