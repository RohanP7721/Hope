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
| Small picture in the Welcome sentence | `welcome` (just `01.jpg`) |
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
- **Preview it:** open `index.html?popup`. It normally shows only once per visit, and never in Edit Mode.

A portrait or square image works best, e.g. 1080 × 1350 like an Instagram post.

## Text

1. Double-click **`EDIT-TEXT.html`** in the website folder. It opens the site in Edit Mode.
   (On the live site, add `?edit` to the end of the address instead: `https://your-site.netlify.app/?edit`.)
2. Click any outlined text and type. Use **Page to edit** in the dark box to switch to a room page.
   Tap the box's title to hide it if it's covering something.
3. Click **Download content.js**.
4. Put that file into `assets/js/`, replacing the old `content.js`.
   (If your computer saved it as `content (1).js`, rename it to `content.js`.)
5. Upload the folder to Netlify again.

Numbers are editable too: the big numbers under the Welcome text (they still count up), room **prices**, room size and number of guests.
Type a price like `₹5,200`. The new price is used everywhere: room cards, room page, booking estimate and WhatsApp message.
Changing a room's guests number also changes how many guests the booking form allows.

**Rates & meal plans (room pages):** every price in the four plan cards (Room Only, CP, MAP, AP), the plan names, what each plan includes, and the four remarks underneath (taxes, special requests, extra bed, extra meals) can be edited in Edit Mode. The Room Only price is also the "From" price shown on the home page. Guests pick a plan and it goes into the booking estimate and the WhatsApp message.

Room names you change here also update the WhatsApp booking messages.

The "Open now" badge next to the restaurant hours follows whatever hours you type, e.g. `10 AM – 10 PM`.

Phone numbers, email, address, room amenities and house policies are in `assets/js/data.js`. Open it with Notepad or TextEdit.

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
