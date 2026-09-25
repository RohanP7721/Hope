# The Dolkar Hotel website: how to add photos

No coding needed. Drop photos into the right folder and the website shows them automatically.

## The only rule: number your photos

Name them **01, 02, 03, 04 …** (two digits, no gaps).

- ✅ `01.jpg`, `02.jpg`, `03.jpg`
- ❌ `IMG_4521.jpg`, `room photo.jpg`, `1.jpg`
- ❌ Skipping a number (01, 02, **04**): the site stops at the gap and won't show 04.

`.jpg`, `.jpeg`, `.png` and `.webp` all work, in upper or lower case.

## Where each photo goes

Open the `assets` folder, then `images`:

| I want to add photos to… | Put them in this folder |
|---|---|
| Deluxe Room (Non-View) | `rooms/deluxe-non-view` |
| Deluxe Room (Nature View) | `rooms/deluxe-nature-view` |
| Deluxe Room (Mountain View) | `rooms/deluxe-mountain-view` |
| Twin Bed Quad Sharing | `rooms/twin-quad` |
| Family Suite | `rooms/family-suite` |
| **Every** room (e.g. the bathroom) | `rooms/every-room` |
| The gallery on the home page | `gallery` |

- Photo `01` in a room folder is that room's cover picture on the home page.
- Photos in `every-room` appear at the end of every room's slideshow. Delete them once each room has enough photos of its own.
- To remove a photo, delete the file and renumber the ones after it so there's no gap.
- To change the order, rename the files.

## Before you add photos from a phone

Phone photos are huge (4–8 MB) and will make the site slow. Shrink each one first:

1. Go to **squoosh.app** in your browser and drop the photo in.
2. On the right, set **Resize** to width **2000**, and **Quality** to about **75**.
3. Download it. It should now be under ~400 KB.
4. Rename it to the next number (`02.jpg`, `03.jpg` …) and put it in the folder.

iPhone tip: iPhones save photos as `.HEIC`, which websites can't show. Either set *Settings → Camera → Formats → Most Compatible*, or convert them to JPG in squoosh.

Landscape (wide) photos look best in the room slideshows.

## Putting the update online

- **Netlify:** open your site in Netlify, go to **Deploys**, and drag the whole website folder onto the page. Same link, updated in a few seconds.
- **Preview first on your laptop:** double-click `index.html`. It opens in your browser, no internet needed except for the fonts.

## Moving the website to another laptop

The website is just this folder. Copy it or the zip anywhere (USB drive, Google Drive, email) and it works exactly the same. Nothing to install.

---

### Other things you can change

- **Prices, room details, menu, phone numbers:** in `assets/js/data.js` (open it with Notepad or TextEdit).
- **Any text on the page:** open the site with `?edit` at the end of the address (e.g. `index.html?edit`), click the text and type, then press **Download content.js** and replace the file `assets/js/content.js` with the downloaded one.
- **Gallery captions** (the text under a photo in full-screen view): the `galleryCaptions` list in `data.js`, in photo-number order. Optional.

### Before going live, confirm with the hotel
- House policies (check-in/out times, cancellations) in `data.js` are placeholders.
- In-room amenity lists per room are based on the photos.
- Deluxe Nature View and Deluxe Mountain View currently use the same photo.
