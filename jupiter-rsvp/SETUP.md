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

- `apps-script/`: the code to paste into Google Apps Script (5 files)
- `rsvp-site/`: the RSVP page investors land on after tapping a button (upload as is)
- `preview/`: the emails rendered as files you can open in a browser to check them

---

## Setup (about 30 minutes)

Do steps 1 to 4 **logged in as info@jupitertexas.com**. Every email and calendar invite comes from the account that runs the script.

### 1. Get the sheet into info@'s Drive
Open the Guests sheet as info@ and choose **File → Make a copy**. Use this copy from now on. That way the sheet, the script, Gmail and Calendar all belong to info@.

### 2. Add the code
1. In the sheet, go to **Extensions → Apps Script**.
2. Rename the default `Code.gs` file and paste in the contents of `apps-script/Code.gs`.
3. Click **+ → Script** and create `Config` and `EmailTemplates`. Paste in the matching files.
4. Click **+ → HTML** and create `Dashboard`. Paste in `apps-script/Dashboard.html`.
5. Go to **Project Settings (gear icon)**, tick **Show "appsscript.json"**, then open that file and paste in `apps-script/appsscript.json`.
6. Pick the `setup` function from the dropdown at the top and click **Run**. Approve the permissions it asks for (Sheets, Gmail, Calendar).
   This creates the sheet columns and turns on the automatic reminders.

### 3. Deploy the two web addresses
In Apps Script, click **Deploy → New deployment → Select type: Web app**.

**A. The RSVP connection, which is public:**
- Execute as: **Me (info@jupitertexas.com)**
- Who has access: **Anyone**
- Copy the URL (it ends in `/exec`). This is your **API URL**.

**B. The dashboard, which is private:** do **Deploy → New deployment** again.
- Execute as: **Me**
- Who has access: **Only myself**
- Copy this URL and bookmark it. **This is the dashboard.**

> If "Anyone" isn't offered, the Google Workspace admin has blocked public web apps. They can allow it under Admin console → Apps → Google Workspace → Drive and Docs → Sharing settings.

### 4. Put the RSVP page online
1. Paste the **API URL** into `rsvp-site/config.js`.
2. Go to <https://app.netlify.com/drop> and drag the whole `rsvp-site` folder onto it. You get an address like `https://something.netlify.app`.
3. Optional, but it looks far more professional: in Netlify, go to **Domain settings → Add custom domain → `rsvp.jupitertexas.com`**. Then add the `CNAME` record Netlify shows you wherever jupitertexas.com's DNS is managed.

### 5. Finish the config
In Apps Script, open `Config.gs` and set:
- `API_URL`: the API URL from step 3A
- `SITE_URL`: `https://rsvp.jupitertexas.com`, or the Netlify address (no trailing slash)

Then go to **Deploy → Manage deployments**, and for **both** deployments click ✏️ → Version: **New version** → Deploy. The URLs stay the same.

> Any time you change code in Apps Script, repeat this "New version" step or the live site keeps running the old code.

### 6. DMARC: one DNS record, recommended
Add a TXT record where jupitertexas.com's DNS is managed:
- Name: `_dmarc`
- Value: `v=DMARC1; p=none; rua=mailto:info@jupitertexas.com`

SPF and DKIM are already set up for Google Workspace. DMARC is the last piece Gmail and Yahoo check.

---

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
