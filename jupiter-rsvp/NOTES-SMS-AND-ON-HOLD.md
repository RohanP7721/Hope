# Jupiter Holiday Party: SMS / WhatsApp, and on-hold work

Read this first when the user says "let's continue our conversation about SMS" (or WhatsApp, texts, or the on-hold items).

Last updated: 2026-11-18.

## Where things stand

- Email invitations: working. About 3,000 investors, sent in phases. Gmail allows about 1,500 per day from the script.
- Dashboard, one-tap RSVP, scanner protection, calendar invites, calendar-response sync, reminders (automatic Dec 5, 9 and 11 for Yes/Maybe; manual to ticked people, matched to their answer): all live.

## SMS / WhatsApp decision

**WhatsApp was ruled out.** Meta has paused WhatsApp *marketing* template messages to US (+1) numbers since April 2025, and as of mid-2026 the pause is still in effect with no end date. An event invitation is marketing. Labelling it "utility" to get around this would break Meta policy, so we didn't. Re-check this before revisiting; Meta could lift the pause.

**SMS was chosen**, through Twilio using a **verified toll-free number** (not 10DLC: no monthly campaign fees, which suits a one-off event).

User's answers (2026-11-18):
- All numbers are US.
- Jupiter has a Meta Business account (only relevant if WhatsApp becomes possible again).
- About $100 to $150 budget OK on a company card.
- Send to all 3,000.
- Consent: investors agreed by signing up to the investor portal.

## What's built (code is in apps-script/Code.gs and Dashboard.html)

- **Sheet:** columns `Phone`, `SMS Status` and `SMS Sent At` are added automatically at the far right of Guests.
- **Dashboard:**
  - A **Send SMS** window: Twilio setup (Account SID, Auth Token, toll-free number, stored in Script Properties, not the sheet).
  - Who: everyone with a phone / only no answer yet / a phase.
  - A poster tick box (sends as MMS), a preview with an estimated cost, a test send, and batched sending.
- **Text** (editable in Edit text & poster, field `sms_text`), 2 SMS segments:
  "Jupiter Texas: Hi {first_name}, you & your family are invited to our Holiday Party, Sat Dec 12, 6PM, Plano TX. RSVP: {link} Reply STOP to opt out."
- **Link:** opens `choosePage_` with the usual RSVP buttons. Opening the page saves nothing; only a tap saves an answer, through the same scanner-protected tap page. Answers land on the same dashboard.
- **Handling:**
  - Nobody is texted twice.
  - Duplicate numbers get one text.
  - STOP replies (Twilio error 21610) are marked "Opted out".
  - Landlines (21211/21614) are marked "Failed: not a mobile number".
  - Both are skipped on future sends.
- **Guide:** Part S of guide/index.html has the setup steps, with copy-paste answers for the toll-free verification form, a privacy-policy sentence, and a VLOOKUP formula to pull phones in by email.

## What the user still has to do (not yet confirmed done)

1. Get a screenshot of the portal sign-up consent and make sure a privacy policy exists on jupitertexas.com.
2. Set up Twilio: create the account, upgrade it, add $150, buy a toll-free number (SMS + MMS), and submit toll-free verification. Twilio says about 3 business days; it can take up to 2 weeks. The party is Dec 12, so this is the deadline risk.
3. Update the code and redeploy both deployments (Tracking + Dashboard) with a New version.
4. Fill in the Phone column.
5. Connect Twilio in the dashboard, send a test once it's verified, then send.

Nothing about SMS has been tested against the real Twilio service yet; only simulated responses.

## On hold (user asked to finish email invitations first; do nothing until asked)

1. **Confirmation email for every tap:** anyone who taps any option gets a short "we got your answer" email, sent a few minutes later with the calendar invite, once per answer change.
2. **Team summary calendar event:** one event on info@'s calendar with no guests, showing a live headcount and the attendee list. Keep per-guest events for investors, for privacy and to avoid spamming them with "updated invitation" emails. Recommended over one shared event.
3. **Rename sheet columns:** "Opened" becomes "Email arrived" and "Open Count" becomes "Times loaded", because the team confused Opened=Yes with an RSVP.
4. **Grey out the Send button** when the daily Gmail limit is 0.
