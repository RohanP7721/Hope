# The Dolkar Hotel — how to update the site

Everything is plain files, with no build step. Upload the whole folder to Netlify, Vercel or GitHub Pages and it works.

```
index.html              home page
room.html               one page for every room (room.html?r=family-suite, etc.)
assets/js/data.js       ← rooms, prices, photos, menu, gallery, contact details
assets/js/content.js    ← text edits made in Edit Mode
assets/images/rooms/    ← one folder per room
```

## Add more photos to a room

1. Put the photos in that room's folder, e.g. `assets/images/rooms/family-suite/02.jpg`, `03.jpg` …
   (JPG, about 2000px on the long side, under ~400 KB each keeps the site fast.)
2. Open `assets/js/data.js`, find the room, and add each file to its `images` list:

```js
images: [
  'assets/images/rooms/family-suite/01.jpg',
  'assets/images/rooms/family-suite/02.jpg',
  'assets/images/rooms/family-suite/03.jpg'
],
```

The first image is the cover on the home page. The room page gallery, thumbnails, photo count and full-screen viewer all update automatically.

`sharedRoomImages` (near the top of `data.js`) adds the same photos to the end of every room's gallery, which is useful while a room only has one photo. Remove them once each room has enough of its own.

## Change prices, room details, menu or gallery

All of it lives in `assets/js/data.js`: `price`, `size`, `guests`, `beds`, `amenities`, `menu`, `gallery`, `testimonials`, `policies`, phone numbers and the WhatsApp number.

## Edit text without touching code (Edit Mode)

1. Open any page with `?edit` at the end, e.g. `https://yoursite.com/index.html?edit` or `room.html?r=twin-quad&edit`.
2. Click any outlined text and type. Drafts save in your browser as you go.
3. Click **Download content.js** and replace `assets/js/content.js` on your host with that file.

Visitors only see your edits after step 3. Edit Mode handles text; photos and prices go in `data.js`.

## Before going live, confirm with the hotel

- `policies` in `data.js` (check-in/out times, cancellation wording) are sensible placeholders.
- In-room `amenities` per room (TV etc.) are based on the photos. Confirm each one.
- Deluxe Nature View and Deluxe Mountain View currently use the same photo.
