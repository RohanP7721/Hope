# Investor Ops Daily Board: setup (one time, about 10 minutes)

Do this signed in as **rohanpradhan@jupitertexas.com**. Everything runs on that account: the data, the dashboard, and the 4 AM email to Bharath.

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
3. Back in the sheet you'll see the new tabs: **Tasks, Updates, Team, Categories, Config**.

## 4. Publish the dashboard
1. Click **Deploy → New deployment**, then the gear icon, then **Web app**.
2. Set **Execute as: Me** and **Who has access: Anyone within jupitertexas.com**, then click **Deploy**.
3. Copy the **Web app URL**.
4. In the sheet, open the **Config** tab and paste the URL into **WEBAPP_URL**. This is what the "Open dashboard" button in the email links to.
5. Send the URL to Megha, Sonia and Bharath. Bookmark it.

## 5. Test the email
In the Apps Script editor, pick **sendTestReportToMe** and click **Run**. Tonight's report arrives in your inbox; check it looks right.

From then on, Bharath gets it automatically **every day at 4 AM IST**.

---

## How it works
- **Work day = the shift (6 PM – 3 AM IST).** Anything logged between noon and the next day's noon counts as that night's shift, so 1 AM work stays on the right day.
- **Carry-over is automatic.** Anything not marked Done stays on the board the next day with a **Day N** tag, so you can see how long it's been open.
- **History.** Use the ‹ › arrows or click the date to see any past shift exactly as it stood at the end of that night. The email link opens the matching day.
- **Overdue** tasks (past their due date) and **Blocked** tasks go to the top of Bharath's report.
- Each update is logged with the person's name and the time. The **Updates** tab in the sheet is the full audit trail.

## Changing things later (no code needed)
| Want to… | Do this in the sheet |
|---|---|
| Add or remove a team member | **Team** tab. Set *Takes tasks* to `No` for people who only view (like Bharath). |
| Change who gets the report | **Config → REPORT_TO** (comma-separate several). Add a CC in **REPORT_CC**. |
| Edit categories | **Categories** tab, or choose "+ Add category…" in the app. |

## If you update the code later
Paste the new code, then go to **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.

## Troubleshooting
- **The app asks "Who's this?"** Google hides someone's email from the app when they open it from a personal Gmail session. They should use their jupitertexas account, or just pick their name once. It's remembered on that device.
- **No email at 4 AM.** In Apps Script, open **Triggers** (the clock icon). There should be one `sendNightlyReport` trigger. If not, run **installReportTrigger** once.
