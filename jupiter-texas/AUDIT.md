# jupitertexas.com: audit and redesign brief

**How this was researched:** this environment's network policy blocks jupitertexas.com, so the live pages couldn't be loaded or screenshotted. Everything below comes from the site's own pages as indexed by search: page titles, URLs and the copy on each page. Points that need the live layout to judge are marked **(verify on live site)**.

---

## 1. What the site does

Jupiter Texas Real Estate Group is a Dallas-area commercial real estate investment firm. The site is a lead-generation tool for private investors. It tries to do four things:

1. Explain the model: buy, value-add, manage and sell commercial property, with each property set up as an independent joint venture between Jupiter and its investors.
2. Prove the track record through the portfolio and previous opportunities, each listing a purchase price, cash-on-cash return and forecasted return.
3. Sell the upside: "2X S&P average returns", a 15–20% expected AAR against 8–10% for the S&P, and a 1:200 pick-to-reject ratio.
4. Turn interest into contact through the contact pages, the current-opportunity lead page and the investor profile page.

The platform is Wix. You can tell from `/post/…` blog URLs, the `copy-of-…` page slug that Wix generates when you duplicate a page, and the `/blog` index.

## 2. Page map

| Page | URL | Role |
|---|---|---|
| Home | `/` | Positioning, asset mix, headline returns |
| Who We Are | `/who-we-are` | Buy → value-add → sell process, 1 in 200 acceptance |
| Strategy | `/strategy` | Returns compared with the S&P, 1:200 ratio, risk disclaimer |
| Portfolio | `/portfolios` | Property cards: price, cash-on-cash and forecasted return |
| Current Opportunities | `/lead-collection` (title: "OH - Opportunities") | Live deal: 26 single-family homes in Oklahoma City, $9.92M |
| Previous Opportunities | `/copy-of-current-opportunities` | About 14 past deals with the same fields |
| Who are our Investors? | `/who-are-our-investors` | Investor profile: HNWIs, busy professionals, business owners |
| Jupiter Insights | `/blog` + `/post/…` | Articles and webinars |
| Careers | `/job-board` | Job listings |
| Contact Us | `/contactus` | Email + phone |
| Others | `/contact` | A second contact page |

## 3. Components and elements found

- Top navigation across about 8 destinations.
- Hero with the positioning statement ("Jupiter Texas helps investment in commercial real estate in USA").
- Asset-mix statement: retail, day care, medical, single-family rentals.
- Returns comparison: S&P AAR against Jupiter expected AAR.
- Property cards: name, location, Purchase Price, Projected Annual Cash On Cash\*, Forecasted Annual Return\*.
- An opportunity card with total cost, average annual return and hold period.
- An investor profile block.
- Blog list and post pages.
- Contact blocks with email and phone.
- Risk disclaimers: "All returns are subject to market risk…" and "Testimonials may not be representative…".

---

## 4. What's wrong

### A. Information architecture and hierarchy

1. **The portfolio is split across three pages that don't talk to each other.** These are `/portfolios`, `/copy-of-current-opportunities` and `/lead-collection`. They use the same card format and some of the same deals (Gaylord, Grapevine and Franklin show up on both Portfolio and Previous). An investor can't tell what's owned, what's sold and what's open to invest in. **This is the biggest flaw.** The portfolio is the proof, and it's scattered.
2. **There are two contact pages with two different phone numbers.** `/contactus` lists +1 (940) 331-5175, while `/who-are-our-investors` and third-party listings use +1 (940) 331-5148. A second page at `/contact` has the title "Others". A high-net-worth investor who sees conflicting numbers starts doubting the firm.
3. **The pages are named after internal process, not the investor.** "Lead-collection", "OH - Opportunities" and "copy-of-current-opportunities" show up in URLs and browser tabs. To an investor they look unfinished.
4. **The best proof points are buried.** "1:200 pick to reject" and "each property is an independent joint venture" are the strongest trust signals the firm has. They sit on interior pages (Strategy, Who We Are) instead of leading the homepage.
5. **"Who we are" and "Strategy" overlap.** Both describe how deals are picked and how value is added, so the story is told twice in different words and never finishes on either page.
6. **There's no clear main call to action.** Contact, opportunities and the investor profile all compete. The path should be one route: see proof (portfolio) → see what's open (current opportunity) → talk to us.

### B. Content and credibility

7. **The return figures disagree with each other.** Strategy says "15–20% (typically 20+%)" in one place and "15–25%" in another. Return claims on an investment site have to be consistent everywhere.
8. **There are typos in property names.** "Mclauren Cardilogy and Medical Building" should almost certainly be "McLaren Cardiology". In a deal name, a typo costs credibility.
9. **The opening line is ungrammatical.** "Jupiter Texas helps investment in commercial real estate in USA" is the first sentence an investor reads. It should be rewritten (suggestion in §6).
10. **Asterisks have nothing attached.** "Projected Annual Cash On Cash\*" and "Forecasted Annual Return\*" carry asterisks, but no footnote sits next to the figures.
11. **Property data is incomplete.** Some cards (Fredericksburg, Hermitage, Joliet) show a price but no returns, or no figures at all. The display gives no reason why.
12. **The listings have no dates or status.** Nothing says when a deal was bought, whether it has exited, or how it actually performed against forecast.

### C. Visual design (from the brief and the platform; verify on live site)

13. It looks dated and static, as you described: a stock Wix template with no motion and no sense of scale. **(verify on live site)**
14. Every property gets the same card, so a $4.68M retail park looks identical to a $1.4M eye-care building. Nothing visual separates the asset classes. **(verify on live site)**
15. Wix builds tend to be heavy on mobile. Fixed-position sections and absolute layouts often break below 400px. **(verify on live site)**
16. The blue brand colour is the only design device, and it's used flat instead of as a range of tones. **(verify on live site)**

---

## 5. What the redesign changes

The working build is in this folder (`index.html`, `portfolio.html`). The rules were: **same words, same figures, same links, rebuilt presentation.**

### Structure
- **Home now reads as an argument in sequence:** positioning → asset mix → returns compared with the S&P → buy/value-add/manage/sell → 1:200 + joint venture → live portfolio strip → who it's for → insights/careers → contact.
- **Portfolio is the centre of the site:** owned properties, the current opportunity and a link to previous opportunities on one page, filterable by asset class.
- **One main action everywhere:** "Contact Us" sits in the nav, in every property sheet and in the closing band. "Current Opportunities" is the second action.
- Opportunities collapse into one nav dropdown (Current / Previous), so the nav stays readable.

### Design system
- **Colour:** deep saturated blue (`#1d3bff` → `#0b1fa8`) on ink navy (`#040a2a`), with pale blue paper sections for reading. Only two accents are used: amber (Jupiter's bands) and cyan (glow and data highlights).
- **Type:** Manrope for display, tight and heavy like Apple's or Google's marketing pages. Inter for body text and numbers.
- **3D:** an animated banded planet in the hero (it is "Jupiter"), with orbiting moons that follow the cursor, plus isometric 3D models for each asset class (medical tower, retail strip, business park, gas station, homes, day care). The models stand in until real property photos are added.

### Motion and interaction
- A floating glass nav that condenses on scroll, hides while reading and returns on scroll-up. A highlight glides between links on hover. On mobile it opens a full-screen menu with a circular reveal and staggered links.
- Smooth scrolling (Lenis) with scroll-linked animation (GSAP ScrollTrigger).
- **Horizontal scrolling** in two places, the process steps on Home and the property gallery on Portfolio. Both pin, and vertical scroll drives the sideways movement. On phones both become native swipe carousels.
- 3D tilt cards with a light glare that follows the cursor.
- Portfolio filter chips with a sliding pill, a Gallery/List toggle, a list view with a preview that follows the cursor, and a property detail sheet with next/previous arrows (keyboard arrows work too). Each property has its own deep link (e.g. `portfolio.html#grapevine`).
- Animated returns bars, and a 200-dot grid that scans and picks 1. It shows the 1:200 ratio instead of just stating it.
- All motion respects `prefers-reduced-motion`. Every section still reads correctly with JavaScript off.

---

## 6. Recommended content fixes (not applied, since the brief was to keep content as is)

| Issue | Current | Suggested |
|---|---|---|
| Typo | Mclauren Cardilogy and Medical Building | McLaren Cardiology and Medical Building *(confirm the tenant's spelling)* |
| Grammar | Jupiter Texas helps investment in commercial real estate in USA. | Jupiter Texas helps you invest in commercial real estate across the USA. |
| Conflicting phone | 5175 vs 5148 | Pick one and use it everywhere |
| Conflicting AAR | 15–20% vs 15–25% | Pick one figure for the whole site |
| URL slugs | `/lead-collection`, `/copy-of-current-opportunities`, `/contact` ("Others") | `/opportunities/current`, `/opportunities/previous`, retire `/contact` with a 301 to `/contactus` |
| Missing footnote | `*` on return labels | Put the risk disclaimer directly under every figure table (done in the redesign) |
| No dates | Deal cards | Add acquisition year and status (Owned / Exited / Open) |
