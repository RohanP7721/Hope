/* ============================================================
   JUPITER TEXAS — site content
   Every word, figure and link on the redesign comes from here,
   and every value was taken from www.jupitertexas.com.
   Check each one against the live site before launch
   (see README.md → "Content check").
   ============================================================ */

window.JT = (function () {
  var LIVE = 'https://www.jupitertexas.com';

  var links = {
    home:        LIVE + '/',
    whoWeAre:    LIVE + '/who-we-are',
    strategy:    LIVE + '/strategy',
    portfolio:   LIVE + '/portfolios',
    current:     LIVE + '/lead-collection',
    previous:    LIVE + '/copy-of-current-opportunities',
    investors:   LIVE + '/who-are-our-investors',
    insights:    LIVE + '/blog',
    careers:     LIVE + '/job-board',
    contact:     LIVE + '/contactus',
    contactAlt:  LIVE + '/contact',
    valuePost:   LIVE + '/post/how-jupiter-adds-value-to-commercial-properties',
    linkedin:    'https://www.linkedin.com/company/jupitertexas',
    facebook:    'https://www.facebook.com/JupiterTexasRealEstate/',
    email:       'mailto:info@jupitertexas.com',
    phone:       'tel:+19403315175',
    phoneAlt:    'tel:+19403315148'
  };

  /* Asset classes named on the home page. */
  var assetClasses = [
    { key: 'retail',  label: 'Commercial retail' },
    { key: 'daycare', label: 'Day care centers' },
    { key: 'medical', label: 'Medical buildings' },
    { key: 'homes',   label: 'Single-family rental homes' }
  ];

  /* Portfolio + previous opportunities, as listed on
     /portfolios and /copy-of-current-opportunities.
     Fields left out are fields the live page doesn't show for that property. */
  var properties = [
    {
      id: 'gaylord',
      name: 'Mclauren Cardilogy and Medical Building',
      place: 'Gaylord, Michigan',
      type: 'medical',
      price: '$3.3M',
      cashOnCash: '9%',
      forecast: '18-20%+'
    },
    {
      id: 'grapevine',
      name: 'Grapevine Mustang Business Park',
      place: 'Grapevine, TX',
      type: 'business',
      price: '$4M',
      cashOnCash: '7%',
      forecast: '25%'
    },
    {
      id: 'franklin',
      name: 'Jupiter Franklin Retail Park',
      place: 'Chicago, IL',
      type: 'retail',
      price: '$4.68M',
      cashOnCash: '8%',
      forecast: '18-21%'
    },
    {
      id: 'oaks',
      name: 'Oaks Crossing',
      place: 'Michigan',
      type: 'retail',
      price: '$2.25M',
      cashOnCash: '10%',
      forecast: '25%+'
    },
    {
      id: 'fayetteville',
      name: 'Gas Station',
      place: 'Fayetteville, Arkansas',
      type: 'fuel',
      price: '$1.70M',
      cashOnCash: '10%',
      forecast: '20-25%'
    },
    {
      id: 'fredericksburg',
      name: 'Medical Building',
      place: 'Fredericksburg, VA',
      type: 'medical',
      price: '$4.5M'
    },
    {
      id: 'hermitage',
      name: 'Medical Eye-Care Building',
      place: 'Hermitage, PA',
      type: 'medical',
      price: '$1.4M'
    },
    {
      id: 'joliet',
      name: 'Medical & Office Center',
      place: 'Joliet, IL',
      type: 'medical'
    }
  ];

  /* Current opportunity, from /lead-collection ("OH - Opportunities"). */
  var opportunity = {
    name: '26 newly built single-family homes',
    place: 'Oklahoma City',
    type: 'homes',
    totalCost: '$9.92M',
    returns: '20-24%',
    hold: '5-6 years'
  };

  var typeLabels = {
    medical:  'Medical',
    retail:   'Retail',
    business: 'Business Park',
    fuel:     'Gas Station',
    homes:    'Single-Family',
    daycare:  'Day Care'
  };

  var copy = {
    title: 'Investment in Commercial Real Estate: Jupiter Texas Group',
    lead: 'Jupiter Texas helps investment in commercial real estate in USA.',
    accessible: 'Making commercial real estate accessible',
    platform: 'A vertically integrated platform that buys, value-adds, manages and sells properties.',
    mission: 'Jupiter Texas is an acquisition and property management company to create consistent cash-flow for the owners.',
    mix: 'Our portfolio is a balanced combination of commercial retail, day care centers, medical buildings, and single-family rental homes.',
    picked: 'Picked by experts based on returns, stability and value to our investors.',
    jv: 'Each property is an independent joint venture where we and the investors own the property.',
    twoX: '2X S&P average returns',
    sp: { label: 'S&P AAR', value: '8-10%', note: 'in last 40 year' },
    jupiter: { label: 'Jupiter Expected AAR', value: '15-20%', note: '(typically 20+%)' },
    ratio: '1:200',
    ratioLabel: 'pick to reject ratio',
    risk: 'All returns are subject to market risk. Returns are not guaranteed.',
    testimonialNote: 'Testimonials may not be representative of the experience of other clients or investors.',
    whoWeAre: [
      { step: 'Buy',       text: 'We buy properties after due diligence — a 1 in 200 acceptance ratio.' },
      { step: 'Value-add', text: 'We add value through redevelopment and rent increases.' },
      { step: 'Manage',    text: 'An acquisition and property management company to create consistent cash-flow for the owners.' },
      { step: 'Sell',      text: 'We sell at the right time, with the sole objective of giving the highest appreciation returns.' }
    ],
    clients: {
      heading: 'Who are our clients?',
      list: ['High-net-worth individuals', 'Busy professionals', 'Business owners'],
      note: 'With capital to deploy for 2 to 5 years.'
    },
    post: {
      title: 'How Jupiter adds value to commercial properties?',
      date: 'Aug 31, 2022',
      excerpt: 'Re-vitalizing an asset — new paint, flooring or light fixtures — can increase its value.'
    },
    careers: 'Information on available job positions at Jupiter.',
    email: 'info@jupitertexas.com',
    phone: '+1 (940) 331-5175',
    phoneAlt: '+1 (940) 331-5148'
  };

  return {
    links: links,
    assetClasses: assetClasses,
    properties: properties,
    opportunity: opportunity,
    typeLabels: typeLabels,
    copy: copy
  };
})();
