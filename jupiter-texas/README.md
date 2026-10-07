# Jupiter Texas: website redesign

A modern rebuild of www.jupitertexas.com. It's plain HTML, CSS and JS, with no build step.

- `index.html`: Home
- `portfolio.html`: Portfolio (the main piece: horizontal gallery, filters, list view, property sheets)
- `AUDIT.md`: the site audit, its flaws and the redesign rationale

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Where things live

| What | File |
|---|---|
| All copy, figures and link URLs | `assets/js/content.js` |
| Styles (colours are tokens at the top) | `assets/css/jt.css` |
| Interactions and animation | `assets/js/main.js` |
| 3D isometric property art | `assets/js/art.js` |
| GSAP, ScrollTrigger, Lenis (vendored) | `assets/vendor/` |

**To add a property:** add an entry to `properties` in `content.js`. The gallery, list view, filters, counts and detail sheet all update on their own.

**To use a real photo instead of the 3D art:** add `image: 'assets/img/your-photo.jpg'` to that property.

**To deep-link a property:** use `portfolio.html#<id>`, for example `portfolio.html#grapevine`.

## Links

Home and Portfolio are rebuilt here. Every other nav item points to the existing page on www.jupitertexas.com, at the same URL as today:
Who We Are, Strategy, Current Opportunities (`/lead-collection`), Previous Opportunities (`/copy-of-current-opportunities`), Investors, Insights (`/blog`), Careers (`/job-board`) and Contact Us (`/contactus`).
The email, both phone numbers, LinkedIn and Facebook come from the live site or the company's own profiles.

## Content check (do this before launch)

The live site couldn't be loaded from the build environment, so copy and figures were collected from the site's search-indexed pages. Check `content.js` against the live site:

- [ ] Property list on `/portfolios` matches. Add any property that's missing; the Orlando-area cardiology center turned up in one search result but couldn't be confirmed.
- [ ] Figures for each property (price, cash-on-cash, forecast)
- [ ] Current opportunity: Oklahoma City, $9.92M, 20–24%, 5–6 years
- [ ] Which phone number is current: 5175 or 5148
- [ ] Facebook and LinkedIn links match what the live site uses
- [ ] Real property photos added to `assets/img/`

Section labels and button text ("Explore the Portfolio", "View details", "Scroll to explore" and the like) are new interface text. Everything else is the site's own wording.
