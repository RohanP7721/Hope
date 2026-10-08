# Jupiter Texas: website redesign

This is a redesign of www.jupitertexas.com. The text, figures and links are the same as the live site; only the design, layout, imagery and scroll motion are new.

It's plain HTML, CSS and JS. Every file is local, so double-clicking `index.html` in Finder opens the site.

## Pages

| File | Live page |
|---|---|
| `index.html` | `/` Home |
| `who-we-are.html` | `/who-we-are` |
| `who-are-our-investors.html` | `/who-are-our-investors` |
| `strategy.html` | `/strategy` |
| `portfolio.html` | `/portfolios` (Cash On Cash Properties + Development Projects) |
| `current-opportunities.html` | `/current-opportunities` |
| `previous-opportunities.html` | `/copy-of-current-opportunities` |
| `faqs.html` | `/faqs` |
| `contact-us.html` | `/contactus` |
| `learn.html` | `/contact` ("Learn More", with the embedded AppFolio form) |
| `insights.html` | `/blog` |

These stay as links to the live site or a third-party service, because they are hosted elsewhere:

- Careers (`/job-board`) and the four blog posts.
- AppFolio "Join" / "Investor Login".
- The webinar registration and recording links.

## Editing

The pages are generated. Don't edit the `.html` files by hand. Edit the source and rebuild:

```
python3 _src/build.py
```

| What | Where |
|---|---|
| Page copy, nav, footer, links | `_src/build.py` |
| Property cards (title, figures, photo) | `_src/properties.json` |
| Styles (colour tokens at the top) | `assets/css/site.css` |
| Interactions and scroll animation | `assets/js/site.js` |
| Photos | `assets/img/site/`, `assets/img/props/` |
| Font (Instrument Sans, SIL OFL) | `assets/fonts/` |

**To add a property:** add an entry to the right list (`cash`, `dev` or `previous`) in `_src/properties.json`, drop its photo in `assets/img/props/`, then rebuild.

## Known differences from the live site

- **Forms.** The Contact Us form and the newsletter form can't post to Wix's backend from a static site. On submit, each one opens the visitor's email app with a message to info@jupitertexas.com. Connect them to a real form handler at launch.
- **Blog widgets.** The blog's view and like counters and the Wix chat bubble are Wix widgets, so they aren't reproduced.
- **Phone link.** On the live site the phone number shows as +1 (940) 331-5175, but its `tel:` link dials 331-6222. This build uses 5175 for both. Confirm which number is correct.
