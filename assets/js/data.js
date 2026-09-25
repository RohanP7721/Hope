/* ============================================================
   THE DOLKAR HOTEL — SITE DATA
   This is the one file to edit for rooms, photos, prices and menu.
   See HOW-TO-UPDATE.md for step-by-step instructions.
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
    dinnerOpen: 18,   /* 24-hour clock, India time — drives the live "Open now" badge */
    dinnerClose: 23
  },

  /* Photos shown at the end of EVERY room's gallery (things all rooms share).
     Remove lines here once each room has enough of its own photos. */
  sharedRoomImages: [
    'assets/images/gallery/05.jpg',
    'assets/images/gallery/07.jpg'
  ],

  /* ---------- ROOMS ----------
     To add photos to a room: put the files in its folder
     (e.g. assets/images/rooms/family-suite/02.jpg) and add the path to `images`.
     The first image is the cover used on the home page. */
  rooms: [
    {
      slug: 'deluxe-non-view',
      name: 'Deluxe Room',
      variant: 'Non-View',
      tier: 'Deluxe · interior-facing',
      badge: '',
      price: 3000,
      size: 208,
      guests: 2,
      beds: '1 King Bed',
      view: 'Interior-facing',
      summary: 'Everything our Deluxe rooms offer, at our gentlest nightly rate.',
      description: 'A comfortable, well-appointed room on the interior side of the property — the same comfort and amenities as our Nature View category, at a gentler nightly rate.',
      images: [
        'assets/images/rooms/deluxe-non-view/01.jpg'
      ],
      amenities: ['bed:King bed, pressed linen', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet', 'housekeeping:Daily housekeeping', 'toiletries:Bath amenities']
    },
    {
      slug: 'deluxe-nature-view',
      name: 'Deluxe Room',
      variant: 'Nature View',
      tier: 'Deluxe · garden-facing',
      badge: '',
      price: 3500,
      size: 208,
      guests: 2,
      beds: '1 King Bed',
      view: 'Garden & greenery',
      summary: 'Windows onto greenery, and a quiet, leafy start to the morning.',
      description: 'The same room, with windows opening onto greenery rather than the courtyard. A quiet, leafy start to the morning.',
      images: [
        'assets/images/rooms/deluxe-nature-view/01.jpg'
      ],
      amenities: ['view:Garden-facing windows', 'bed:King bed, pressed linen', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet', 'housekeeping:Daily housekeeping']
    },
    {
      slug: 'deluxe-mountain-view',
      name: 'Deluxe Room',
      variant: 'Mountain View',
      tier: 'Deluxe · our most requested view',
      badge: 'Most requested',
      price: 4500,
      size: 208,
      guests: 2,
      beds: '1 King Bed',
      view: 'Kanchenjunga range',
      summary: 'Windows facing the Kanchenjunga range, best with morning tea.',
      description: "Windows facing the Kanchenjunga range, best caught with your morning tea. The room guests ask for by name once they've seen it.",
      images: [
        'assets/images/rooms/deluxe-mountain-view/01.jpg'
      ],
      amenities: ['view:Kanchenjunga-facing windows', 'bed:King bed, pressed linen', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet', 'housekeeping:Daily housekeeping']
    },
    {
      slug: 'twin-quad',
      name: 'Twin Bed',
      variant: 'Quad Sharing',
      tier: 'For groups & families',
      badge: '',
      price: 5500,
      size: 288,
      guests: 4,
      beds: '2 Twin Beds',
      view: 'Varies by room',
      summary: 'Built for four travelling together — one room, not two.',
      description: "Two twin beds arranged for four guests travelling together — built for friends or colleagues who'd rather share a room than split into two.",
      images: [
        'assets/images/rooms/twin-quad/01.jpg'
      ],
      amenities: ['bed:Two beds, pressed linen', 'guests:Sleeps four', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet', 'housekeeping:Daily housekeeping']
    },
    {
      slug: 'family-suite',
      name: 'Family Suite',
      variant: 'Quad Sharing',
      tier: 'Our largest room',
      badge: 'Largest room',
      price: 6500,
      size: 288,
      guests: 4,
      beds: '2 King Beds',
      view: 'Varies by room',
      summary: 'Two king beds and genuine space to spread out.',
      description: 'Two king beds and genuine space to spread out. Built for families who want to stay together without feeling cramped.',
      images: [
        'assets/images/rooms/family-suite/01.jpg'
      ],
      amenities: ['bed:Two king beds, pressed linen', 'guests:Sleeps four', 'size:Our most generous floor space', 'shower:Rain shower', 'water:Filtered mountain-source water', 'wifi:Complimentary Wi-Fi', 'tv:Flat-screen TV', 'service:Room service from Taste of Tibet']
    }
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

  menu: [
    { group: 'Savory', items: [
      { name: 'Steamed Momo', note: 'Hand-folded Tibetan dumplings', price: 130 },
      { name: 'Thenthuk', note: 'Hand-pulled noodle soup', price: 210 },
      { name: 'Gyathuk', note: 'Tibetan noodle soup', price: 210 }
    ]},
    { group: 'Starters', items: [
      { name: 'Spring Roll', note: 'Crisp, golden, made to share', price: 190 },
      { name: 'Lafing', note: 'Chilled mung-bean noodles, spiced', price: 90 },
      { name: 'Thali', note: 'A full plate, the house way', price: 490 }
    ]}
  ],

  /* Gallery — add as many as you like. */
  gallery: [
    { src: 'assets/images/gallery/08.jpg', alt: 'Lobby lounge' },
    { src: 'assets/images/gallery/01.jpg', alt: 'Reading corner in a guest room' },
    { src: 'assets/images/gallery/06.jpg', alt: 'Taste of Tibet dining room with valley views' },
    { src: 'assets/images/gallery/02.jpg', alt: 'A guest at dinner' },
    { src: 'assets/images/gallery/03.jpg', alt: 'The bar' },
    { src: 'assets/images/gallery/04.jpg', alt: 'Lounge seating' },
    { src: 'assets/images/gallery/05.jpg', alt: 'Rain shower' }
  ],

  testimonials: [
    { quote: 'You come for a room. You stay because Taste of Tibet is upstairs.', by: 'A Gangtok regular' },
    { quote: 'Asked for a quiet room facing the valley, got exactly that — no upsell.', by: 'Guest, this spring' },
    { quote: 'The momos alone are worth the trip up the hill.', by: 'Local food writer' }
  ]
};
