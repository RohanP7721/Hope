# Jupiter Texas: Option B redesign

A second, fully re-structured design of www.jupitertexas.com. The content is the same as the live site and as Option A (`../jupiter-texas`). The layout, components and motion are all new.

To open it, double-click `index.html`. Everything is local, including the fonts, so it works straight from Finder.

## What's different from Option A

| | Option A | Option B |
|---|---|---|
| Type | Instrument Sans throughout | Newsreader serif headlines, Manrope text |
| Navigation | Inline menu with dropdowns | "Menu" opens a full-screen index with a photo preview per page |
| Page headers | Full-bleed photo with the title on it | Large title on white, with the photo as a panoramic strip that settles as you scroll |
| Home hero | Photo slideshow | Headline slides that rise from a mask; the photo window widens to full-bleed as you scroll |
| Home links to Strategy / Portfolio / Who We Are | Image cards | Large text rows; on hover, the photo follows the cursor |
| Who We Are | Alternating image rows | Sticky photo that changes as you read Acquire, Add Value and Sell |
| Strategy ecosystem | Orbit diagram | Network diagram whose lines draw in |
| Portfolio | Cards plus a horizontal scroller | Gallery or List (switch remembered); List view shows a photo preview on hover |
| Newsletter | Centred pop-up | Card that slides in at the bottom right |
| Forms | Boxed fields | Underlined fields with floating labels |
| Page changes | Instant | Fade between pages |

## Editing

The pages are generated. Edit the source, then run:

```
python3 _src/build.py
```

| What | Where |
|---|---|
| Copy, links, menu, footer | `_src/build.py` |
| Properties | `_src/properties.json` |
| Styles (tokens at the top) | `assets/css/b.css` |
| Behaviour | `assets/js/b.js` |

## Notes

- **Video poster.** The live video's poster is its first frame, which is solid black. Option B uses a frame from 5 seconds into the same video.
- **Forms.** As in Option A, Contact Us and the newsletter open the visitor's email app, addressed to info@jupitertexas.com. Connect them to a form handler at launch.
- **Phone number.** The phone number is +1 (940) 331-5175. The live site's `tel:` link dials 331-6222; confirm which number is right.
- **Fonts.** Newsreader and Manrope are under the SIL Open Font License; see `assets/fonts/`.
