# Jupiter Texas: Option C redesign

An investor-first version of www.jupitertexas.com. Same content, images and links as the live site and as Options A and B. The structure is simpler and the important things are easier to find.

To open it, double-click `index.html`. It works straight from Finder.

## What it does differently

- **Join and Investor Login are always within reach.**
  - In the header on every page; the header doesn't hide on scroll.
  - Next to each other in the home hero and in the footer.
  - On phones, in a bar fixed to the bottom of the screen.
  - Also on Our Investors, Contact Us and Portfolio.
- **Plain navigation.** Visible menu items with small dropdowns: About, Portfolio, Insights, Learn, Contact Us. Every inner page has a breadcrumb and the same header layout.
- **Key figures surfaced.** The Strategy page's headline numbers (2X S&P 500 average returns, 15-20% expected AAR, 8-10% S&P AAR, 1:200 pick to reject ratio) sit in one strip on Home, with the risk disclaimer next to them.
- **Readable property cards.** Price, cash-on-cash and forecast sit in one aligned row on every card. The Portfolio page has sticky section tabs.
- **Calm motion.** Soft fade-ins, gentle hover lift, and a simple crossfade between the two hero messages. Everything respects reduced-motion settings.

## Editing

Edit the source, then run `python3 _src/build.py`.

| What | Where |
|---|---|
| Copy, links, menu, footer | `_src/build.py` |
| Properties | `_src/properties.json` |
| Styles (tokens at the top) | `assets/css/c.css` |
| Behaviour | `assets/js/c.js` |

## Notes

- **Forms.** Contact Us and the newsletter open the visitor's email app, addressed to info@jupitertexas.com. Connect a form handler at launch.
- **Phone number.** The phone number is +1 (940) 331-5175. The live site's `tel:` link dials 331-6222; confirm which number is right.
- **Font.** Manrope, under the SIL Open Font License.
