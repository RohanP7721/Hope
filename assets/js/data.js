/* ============================================================
   THE DOLKAR HOTEL — SITE DATA
   Room details and contact details live here. Prices, sizes and guest numbers
   can also be changed in Edit Mode (EDIT-TEXT.html) — an Edit Mode change wins.
   PHOTOS DO NOT — just add or delete numbered photos in the folders:
     assets/images/rooms/<room>/   01.jpg, 02.jpg, 03.jpg ...
     assets/images/gallery/        01.jpg, 02.jpg, 03.jpg ...
     assets/images/welcome/        01.jpg  (small picture in the Welcome sentence)
   See HOW-TO-UPDATE.md.
   ============================================================ */

window.DOLKAR = {
  hotel: {
    name: 'The Dolkar Hotel',
    whatsapp: '919151153030',
    phones: ['+91 9151153030', '+91 9151163030'],
    email: 'stay@thedolkarhotel.com',
    address: 'Tashi View Point, Bojoghari, Gangtok, Sikkim 737101',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Dolkar+Hotel+Tashi+View+Point+Gangtok',
    menuPdf: 'https://drive.google.com/file/d/1G9oGoJc1GYaVoJ8S8600_5xPds9bFYq3/view?usp=sharing',
    dinnerOpen: 18,   /* backup only: the "Open now" badge reads the hours you type in Edit Mode */
    dinnerClose: 23
  },


  /* ---------- ROOMS ----------
     Each room's photos are read automatically from assets/images/rooms/<slug>/
     (slug = the folder name). The lowest-numbered photo is the cover on the home page. */
  rooms: [
    {
      slug: 'deluxe-non-view',
      name: 'Deluxe Room',
      variant: 'Non-View',
      tier: 'Deluxe · interior-facing',
      badge: '',
      price: 2000,          /* = Room Only rate, shown as "From" */
      rates: { cp: 2600, map: 3900, ap: 5200 },
      size: 208,
      guests: 2,
      beds: '1 King Bed',
      view: 'Interior-facing',
      summary: 'Everything our Deluxe rooms offer, at our gentlest nightly rate.',
      description: 'A comfortable, well-appointed room on the interior side of the property — the same comfort and amenities as our Nature View category, at a gentler nightly rate.',
      amenities: ['bed:King bed, pressed linen', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet', 'housekeeping:Daily housekeeping', 'toiletries:Bath amenities']
    },
    {
      slug: 'deluxe-nature-view',
      name: 'Deluxe Room',
      variant: 'Nature View',
      tier: 'Deluxe · garden-facing',
      badge: '',
      price: 2500,          /* = Room Only rate, shown as "From" */
      rates: { cp: 3100, map: 4400, ap: 5700 },
      size: 208,
      guests: 2,
      beds: '1 King Bed',
      view: 'Garden & greenery',
      summary: 'Windows onto greenery, and a quiet, leafy start to the morning.',
      description: 'The same room, with windows opening onto greenery rather than the courtyard. A quiet, leafy start to the morning.',
      amenities: ['view:Garden-facing windows', 'bed:King bed, pressed linen', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet', 'housekeeping:Daily housekeeping']
    },
    {
      slug: 'deluxe-mountain-view',
      name: 'Deluxe Room',
      variant: 'Mountain View',
      tier: 'Deluxe · our most requested view',
      badge: 'Most requested',
      price: 3500,          /* = Room Only rate, shown as "From" */
      rates: { cp: 4100, map: 5400, ap: 6700 },
      size: 208,
      guests: 2,
      beds: '1 King Bed',
      view: 'Kanchenjunga range',
      summary: 'Windows facing the Kanchenjunga range, best with morning tea.',
      description: "Windows facing the Kanchenjunga range, best caught with your morning tea. The room guests ask for by name once they've seen it.",
      amenities: ['view:Kanchenjunga-facing windows', 'bed:King bed, pressed linen', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet', 'housekeeping:Daily housekeeping']
    },
    {
      slug: 'twin-quad',
      name: 'Twin Bed',
      variant: 'Quad Sharing',
      tier: 'For groups & families',
      badge: '',
      price: 4500,          /* = Room Only rate, shown as "From" */
      rates: { cp: 5700, map: 8300, ap: 10900 },
      size: 288,
      guests: 4,
      beds: '2 Twin Beds',
      view: 'Varies by room',
      summary: 'Built for four travelling together — one room, not two.',
      description: "Two twin beds arranged for four guests travelling together — built for friends or colleagues who'd rather share a room than split into two.",
      amenities: ['bed:Two beds, pressed linen', 'guests:Sleeps four', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet', 'housekeeping:Daily housekeeping']
    },
    {
      slug: 'family-suite',
      name: 'Family Suite',
      variant: 'Quad Sharing',
      tier: 'Our largest room',
      badge: 'Largest room',
      price: 5500,          /* = Room Only rate, shown as "From" */
      rates: { cp: 6700, map: 9300, ap: 11900 },
      size: 288,
      guests: 4,
      beds: '2 King Beds',
      view: 'Varies by room',
      summary: 'Two king beds and genuine space to spread out.',
      description: 'Two king beds and genuine space to spread out. Built for families who want to stay together without feeling cramped.',
      amenities: ['bed:Two king beds, pressed linen', 'guests:Sleeps four', 'size:Our most generous floor space', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet']
    }
  ],

  /* Meal plans shown on every room page (names and descriptions are editable in Edit Mode). */
  mealPlans: [
    { id: 'room', name: 'Room Only', note: 'Stay only, no meals included' },
    { id: 'cp', name: 'CP Plan', note: 'Breakfast included (Continental Plan)' },
    { id: 'map', name: 'MAP Plan', note: 'Breakfast + lunch or dinner (Modified American Plan)' },
    { id: 'ap', name: 'AP Plan', note: 'Breakfast, lunch & dinner (American Plan)' }
  ],

  /* Remarks shown under the rates on every room page. */
  rateNotes: [
    { icon: 'check', text: 'Prices are inclusive of taxes.' },
    { icon: 'bell', text: 'Special requests (early check-in or anything else) can be arranged upon request.' },
    { icon: 'bed', text: 'Extra bed at ₹1,000.' },
    { icon: 'service', text: 'Extra meal charge per person: CP ₹300 · MAP ₹950 · AP ₹1,600.' }
  ],

  /* Shown on every room page under "Good to know".
     CONFIRM these with the hotel before going live. */
  policies: [
    { title: 'Check-in & check-out', text: 'Check-in from 12:00 PM, check-out by 11:00 AM. Early arrival or late departure on request, subject to availability.' },
    { title: 'ID at check-in', text: 'A valid government-issued photo ID is required for every guest at check-in.' },
    { title: 'Foreign nationals', text: 'Sikkim requires an Inner Line Permit for foreign nationals. Message us and we will point you in the right direction.' },
    { title: 'Children & extra bedding', text: 'Children are welcome. Extra bedding can be arranged on request — ask when you enquire.' },
    { title: 'Cancellations', text: 'Cancellation terms are shared with your booking confirmation. Message us any time with questions.' }
  ],

  amenities: [
    { icon: 'parking', title: 'Free Parking', text: 'On-premises parking for every guest — safe, covered, and steps from the door.' },
    { icon: 'housekeeping', title: 'Daily Housekeeping', text: 'A refreshed room every day of your stay, without ever having to ask.' },
    { icon: 'wifi', title: 'Wi-Fi Throughout', text: 'Complimentary high-speed Wi-Fi in every room and common area.' },
    { icon: 'laundry', title: 'Laundry, On Demand', text: 'Same-day laundry and pressing, handled with care by the in-house team.' },
    { icon: 'service', title: 'Taste of Tibet, In-House', text: 'Dinner service every evening, plus room service from the same kitchen.' },
    { icon: 'events', title: 'Private Events', text: 'A dedicated space for gatherings, with catering straight from the restaurant.' }
  ],

  restaurantImages: [
    'assets/images/restaurant/01.jpg',
    'assets/images/restaurant/02.jpg',
    'assets/images/restaurant/03.jpg',
    'assets/images/restaurant/04.jpg'
  ],

  /* Optional captions for gallery photos, in number order (01, 02, 03 ...).
     Photos without a caption here still show — they just get a generic caption. */
  galleryCaptions: [
    'Lobby lounge',
    'Reading corner in a guest room',
    'Taste of Tibet dining room with valley views',
    'A guest at dinner',
    'The bar',
    'Lounge seating',
    'Rain shower'
  ],

  testimonials: [
    { quote: 'You come for a room. You stay because Taste of Tibet is upstairs.', by: 'A Gangtok regular' },
    { quote: 'Asked for a quiet room facing the valley, got exactly that — no upsell.', by: 'Guest, this spring' },
    { quote: 'The momos alone are worth the trip up the hill.', by: 'Local food writer' }
  ]
};
