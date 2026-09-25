# The Dolkar Hotel website: how to update it

No coding needed. Photos are just files in folders: what's in the folder is what's on the website.

## Photos

Open `assets`, then `images`:

| To change photos for… | Folder |
|---|---|
| Deluxe Room (Non-View) | `rooms/deluxe-non-view` |
| Deluxe Room (Nature View) | `rooms/deluxe-nature-view` |
| Deluxe Room (Mountain View) | `rooms/deluxe-mountain-view` |
| Twin Bed Quad Sharing | `rooms/twin-quad` |
| Family Suite | `rooms/family-suite` |
| Home page gallery | `gallery` |
| Pop-up (see below) | `pop-up` |

- **Add a photo:** name it with the next number (`04.jpg`, `05.jpg` …) and drop it in.
- **Delete a photo:** just delete the file. The others stay.
- **Change the order:** rename the files. Photos show in number order.
- **Cover picture:** the lowest-numbered photo in a room folder is that room's picture on the home page.

Naming rule: two-digit numbers (`01`, `02` … `99`). Don't leave more than 2 numbers missing in a row (01, 02, 06 won't show 06). `.jpg`, `.jpeg` and `.png` all work.

## Pop-up image

Put one image in the `pop-up` folder, named `01.jpg`.

- It shows on the home page 2 seconds after someone arrives, once per visit.
- Tapping it opens WhatsApp to the hotel.
- **Change it:** replace `01.jpg` with a new image of the same name.
- **Turn it off:** delete the image.

A portrait or square image works best, e.g. 1080 × 1350 like an Instagram post.

## Text

1. Open the website with `?edit` at the end of the address, e.g. `index.html?edit`.
2. Click any outlined text and type.
3. Click **Download content.js** (bottom-right box).
4. Put that file into `assets/js/`, replacing the old `content.js`.

Prices, room details (size, beds, guests), the menu and phone numbers are in `assets/js/data.js`. Open it with Notepad or TextEdit.

## Before adding photos from a phone

Phone photos are huge (4–8 MB) and make the site slow. Shrink each one first:
1. Open **squoosh.app** and drop the photo in.
2. Set **Resize** width to **2000** (1080 for the pop-up) and **Quality** to about **75**.
3. Download it, rename it to its number, and put it in the folder.

iPhone photos saved as `.HEIC` won't show on websites. Convert them in squoosh, or set *Settings → Camera → Formats → Most Compatible*.

## Putting changes online

In Netlify, open your site, go to **Deploys**, and drag the whole website folder in. Same link, updated in seconds.

To preview on your laptop first, double-click `index.html`.

## Another laptop

The website is just this folder. Copy it anywhere (USB drive, Google Drive, email) and it works the same. Nothing to install.

---

**Confirm with the hotel before going live:** house policies (check-in/out, cancellation) and the in-room amenity lists in `data.js` are placeholders. Nature View and Mountain View currently share the same `01` photo.
