# jupitertexas.com: audit

Based on a full crawl of the live Wix site, covering text, links, images and layout at desktop and mobile widths.

## What the site does

Jupiter Texas Real Estate Group raises private investor capital for commercial real estate deals. Every page funnels toward one action: **Join**, which opens an AppFolio request-access form. Investor Login goes to the AppFolio portal.

## Site map

- **Home**: hero ("Cash Into Cash Flow" / "An Experienced Partner"), partner video, three tiles (Strategy, Portfolio, Who We Are), a parallax band, a quote, a portfolio feature and a Join CTA.
- **About**
  - **The Company** (`/who-we-are`): Acquire, Add Value, Sell, Core Values, plus a newsletter pop-up.
  - **Our Investors** (`/who-are-our-investors`).
  - **Our Strategy** (`/strategy`): Why Jupiter, What makes Jupiter unique (a, b, c), and the ecosystem diagram.
- **Portfolio** (`/portfolios`): 31 Cash On Cash properties and 9 Development Projects.
  - **Current Opportunities** (`/current-opportunities`).
  - **Previous Opportunities** (`/copy-of-current-opportunities`): 14 deals.
- **Insights** (`/blog`): webinars plus 4 posts.
- **Contact Us** (`/contactus`): a form.
- **Learn**
  - Careers (`/job-board`, a third-party widget).
  - FAQs (`/faqs`).
  - Learn More (`/contact`, page title "Others"): the embedded AppFolio form.

## Design and structure flaws

1. **Weak hierarchy.**
   - Headings, body copy and figures sit at similar weights.
   - Property figures (price, cash-on-cash, forecast) aren't aligned to a shared baseline, so cards are hard to compare.
2. **Portfolio is one long, undifferentiated list.**
   - 40 cards in a single scroll, with no jump between Cash On Cash and Development.
   - The image crops and card heights are inconsistent.
3. **Generic page heroes.** Every inner page reuses the same building photo at full height before any content.
4. **Navigation inconsistencies.**
   - There are two contact pages: `/contactus`, and `/contact`, which is titled "Others".
   - The footer's "Contact Us" goes to `/contact`, not `/contactus`.
   - The footer's "Jupiter Insights" goes to a single post, not the blog.
5. **Wix artefacts.** The `copy-of-current-opportunities` slug, the "© 2022" date, and hidden or orphaned pages still in the sitemap.
6. **Phone mismatch.** The site displays +1 (940) 331-5175, but its `tel:` link dials 331-6222.
7. **Mobile.**
   - Desktop blocks are stacked without being re-composed.
   - Text sits over images with low contrast.
   - Tap targets are small.
   - The strategy diagram is a flat image that doesn't scale.
8. **No motion system.** Reveals are Wix defaults, so nothing guides the eye down the page.

## What the redesign changes (and doesn't)

**Unchanged:** all wording, figures, images and link destinations. The footer's own links are kept as they are on the live site, including the oddities in point 4.

**Changed:**

- **Visual system.** White-dominant layout with a single deep-blue accent, on a 12-column grid with a 4px spacing scale.
- **Portfolio.** A sticky jump bar, plus uniform property cards with aligned stat rows.
- **Strategy.** The ecosystem diagram is rebuilt in HTML so it stays sharp and readable on mobile.
- **Motion.**
  - Scroll reveals and image parallax, plus a hide-on-scroll header.
  - All motion is disabled for visitors who prefer reduced motion.
