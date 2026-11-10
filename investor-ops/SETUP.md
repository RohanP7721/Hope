# Investor Ops Daily Board: setup (one time, about 10 minutes)

Do this signed in as **rohanpradhan@jupitertexas.com**. Everything runs on that account: the data, the dashboard, and every email (the 6 PM reminders, Megha's 3:30 AM review email, and Bharath's 4 AM report).

## 1. Create the sheet
1. Go to sheets.new and name the file **Investor Ops Board**.
2. Open **Extensions → Apps Script**. A code editor opens in a new tab.

## 2. Paste the code
1. In the editor, click **Project Settings** (the gear on the left) and tick **Show "appsscript.json" manifest file in editor**.
2. Go back to **Editor** (`< >` icon) and add the three files:
   - **Code.gs**: replace everything in it with the contents of `Code.gs`.
   - **appsscript.json**: replace everything with the contents of `appsscript.json`.
   - Click **+ → HTML**, name it **Index** (no `.html`), and replace its contents with `Index.html`.
3. Press **Ctrl/Cmd + S**.

## 3. Run setup
1. In the function dropdown at the top, pick **setup** and click **Run**.
2. Google asks for permission. Choose your account, then **Advanced → Go to project (unsafe) → Allow**. The warning appears because this is your own unpublished script, not something from the Workspace store.
3. Back in the sheet you'll see the new tabs: **Tasks, Updates, Report log, Team, Categories, Config**.

## 4. Publish the dashboard
1. Click **Deploy → New deployment**, then the gear icon, then **Web app**.
2. Set **Execute as: Me** and **Who has access: Anyone within jupitertexas.com**, then click **Deploy**.
3. Copy the **Web app URL**.
4. In the sheet, open the **Config** tab and paste the URL into **WEBAPP_URL**. This is what the "Open dashboard" button in the email links to.
5. Send the URL to Megha, Sonia and Bharath. Bookmark it.

## 5. Test the emails (they all come to you, nobody else)
In the Apps Script editor:
- Pick **sendTestReportToMe** and click **Run**. You get the report Bharath will see.
- Pick **sendTestRemindersToMe** and click **Run**. You get Megha's 3:30 AM review email and a sample 6 PM reminder (sent only if someone has carried-over tasks).

Neither test changes the schedule.

---

## The nightly schedule (IST)
| Time | What happens |
|---|---|
| **6:00 PM** | Everyone with carried-over tasks gets an email listing them: their own tasks plus tasks they're helping on. People with nothing carried over get no email. |
| **3:30 AM** | Megha gets a review email with the full report and a "Review on dashboard" button. |
| **4:00 AM** | The report goes to Bharath, unless Megha tapped **"Don't send tonight"**. |

- **If Megha does nothing, the report goes out.** Stopping it only affects that one night.
- Megha can also review, stop or **send early** at any time during the shift, from the report bar at the top of the dashboard.
- Each email goes out only once per night. The **Report log** tab records every send and every decision, with who made it and when.

## How it works
- **Work day = the shift (6 PM – 3 AM IST).** Anything logged between noon and the next day's noon counts as that night's shift, so 1 AM work stays on the right day.
- **Carry-over is automatic.** Anything not marked Done stays on the board the next day with a **Day N** tag, so you can see how long it's been open.
- **History.** Use the ‹ › arrows or click the date to see any past shift exactly as it stood at the end of that night. The email link opens the matching day.
- **Overdue** tasks (past their due date) and tasks **Waiting on others** go to the top of Bharath's report.
- **Working with:** a task has one owner, plus anyone helping. Helpers see it under their name and get it in their 6 PM reminder, but it's counted once, under the owner.
- **Eye icons:** hover over (or tap) any 👁 to see what that part of the dashboard means.
- Each update is logged with the person's name and the time. The **Updates** tab in the sheet is the full audit trail.

## Changing things later (no code needed)
| Want to… | Do this in the sheet |
|---|---|
| Add or remove a team member | **Team** tab. Set *Takes tasks* to `No` for people who only view (like Bharath). |
| Change who gets the report | **Config → REPORT_TO** (comma-separate several). Add a CC in **REPORT_CC**. |
| Change or add a reviewer | **Config → REPORT_REVIEWER**. Add yourself after a comma as Megha's backup. |
| Turn the 6 PM reminders off | **Config → REMINDERS_ON** → `No`. |
| Edit categories | **Categories** tab, or choose "+ Add category…" in the app. |

## If you update the code later
1. Paste the new code into all three files and save.
2. Run **setup** once more. This adds any new columns, tabs or settings and resets the schedule timer. Your data is kept.
3. Go to **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.

## Troubleshooting
- **The app asks "Who's this?"** Google hides someone's email from the app when they open it from a personal Gmail session. They should use their jupitertexas account, or just pick their name once. It's remembered on that device.
- **No emails at all.** In Apps Script, open **Triggers** (the clock icon). There should be exactly one trigger, `tick`, running every 5 minutes. If not, run **setup** again.
- **Bharath didn't get a report.** Open the **Report log** tab. It shows whether it was sent, stopped by Megha, or skipped because nothing was logged that shift.
- **Emails arrive a few minutes late.** That's normal. Google runs the timer every 5 minutes, so 4:00 can mean 4:00–4:05.
