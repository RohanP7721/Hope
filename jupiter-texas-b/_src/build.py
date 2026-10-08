#!/usr/bin/env python3
"""Option B: builds every page of the Jupiter Texas site.

Same words, figures, images and links as www.jupitertexas.com; new structure.
Run:  python3 _src/build.py
"""
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROPS = json.load(open(os.path.join(ROOT, '_src', 'properties.json'), encoding='utf-8'))

LIVE = 'https://www.jupitertexas.com'
JOIN = 'https://investors.appfolioim.com/jupitertexas/investor/request_access'
LOGIN = 'https://investors.appfolioim.com/jupitertexas/investor'
INSIGHTS_POST = LIVE + '/post/how-jupiter-adds-value-to-commercial-properties'
CAREERS = LIVE + '/job-board'
EMAIL = 'info@jupitertexas.com'
PHONE_TEXT = '+1 (940) 331-5175'
PHONE_TEL = '+19403315175'
IMG = 'assets/img/site/'

e = html.escape

ICON = {
    'arrow': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
    'out': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 14 14 6M7 6h7v7"/></svg>',
    'play': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
    'x': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>',
    'plus': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>',
    'search': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="m13 13 4 4"/></svg>',
    'check': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3.2L15 7"/></svg>',
    'grid': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="5.5" height="5.5" rx="1"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1"/></svg>',
    'list': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/></svg>',
    'fb': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46H16.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 3.95v2.25H8v3h2.5V21h3Z"/></svg>',
    'in': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.75h4V21H3V9.75Zm7 0h3.8v1.6h.05c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.9c0-1.17-.02-2.68-1.63-2.68-1.64 0-1.89 1.28-1.89 2.6V21h-4V9.75Z"/></svg>',
    'ig': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    'yt': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
}


def attrs(href):
    if href.startswith(('http', 'mailto:', 'tel:')):
        return f'href="{href}"' + ('' if href.startswith(('mailto:', 'tel:')) else ' target="_blank" rel="noopener"')
    return f'href="{href}"'


def btn(href, text, cls=''):
    """Button-styled link. The label rolls up on hover (two stacked copies)."""
    c = 'btn' + (f' {cls}' if cls else '')
    return f'<a class="{c}" {attrs(href)}><span class="roll" data-t="{e(text)}"><span>{e(text)}</span></span></a>'


def more(href, text):
    """Quiet text link with a drawn underline and a sliding arrow."""
    return f'<a class="more" {attrs(href)}><span>{e(text)}</span>{ICON["arrow"]}</a>'


# ------------------------------------------------------------------ chrome

MENU = [
    ('About', [('The Company', 'who-we-are.html', 'wwa-acquire.jpg'),
               ('Our Investors', 'who-are-our-investors.html', 'investors.jpg'),
               ('Our Strategy', 'strategy.html', 'card-strategy.jpg')]),
    ('Portfolio', [('Portfolio', 'portfolio.html', 'card-portfolio.jpg'),
                   ('Current Opportunities', 'current-opportunities.html', 'home-portfolio.jpg'),
                   ('Previous Opportunities', 'previous-opportunities.html', 'card-who-we-are.jpg')]),
    ('Insights', [('Jupiter Insights', 'insights.html', 'webinar-tax-series.jpg')]),
    ('Learn', [('Learn More', 'learn.html', 'page-hero.jpg'),
               ('FAQs', 'faqs.html', 'city-sky.jpg'),
               ('Careers', CAREERS, 'wwa-add-value.jpg')]),
    ('Contact', [('Contact Us', 'contact-us.html', 'home-hero.jpg')]),
]


def header(page):
    groups = []
    for label, links in MENU:
        lis = ''
        for t, h, img in links:
            cur = ' aria-current="page"' if h == page else ''
            icon = ICON['out'] if h.startswith('http') else ''
            lis += f'<li><a {attrs(h)}{cur} data-img="{IMG}{img}"><span>{t}</span>{icon}</a></li>'
        groups.append(f'<div class="m-group"><p>{label}</p><ul>{lis}</ul></div>')
    return f'''<a class="skip" href="#main">Skip to Main Content</a>
<header class="bar">
  <div class="wrap bar-in">
    <a class="brand" href="index.html" aria-label="Jupiter Texas, Home"><img src="{IMG}logo-navy.png" alt="Jupiter Texas Real Estate Group" width="419" height="600"></a>
    <div class="bar-end">
      <a class="bar-login" href="{LOGIN}" target="_blank" rel="noopener">Investor Login</a>
      {btn(JOIN, 'JOIN', 'btn-sm')}
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-word"><span>Menu</span><span>Close</span></span><span class="menu-lines" aria-hidden="true"><i></i><i></i></span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" aria-hidden="true">
  <div class="wrap menu-in">
    <nav class="menu-nav" aria-label="Main">{''.join(groups)}</nav>
    <aside class="menu-side">
      <div class="menu-peek" aria-hidden="true"><img src="{IMG}home-hero.jpg" alt=""></div>
      <div class="menu-contact">
        <a href="mailto:{EMAIL}">{EMAIL}</a>
        <a href="tel:{PHONE_TEL}">{PHONE_TEXT}</a>
      </div>
      <div class="menu-actions">{btn(JOIN, 'JOIN')}{btn(LOGIN, 'Investor Login', 'btn-ghost')}</div>
    </aside>
  </div>
</div>'''


def footer():
    quick = [
        ('Home', 'index.html'), ('Development Projects', 'portfolio.html#development-projects'),
        ('About Us', 'who-we-are.html'), ('Current Opportunities', 'current-opportunities.html'),
        ('Jupiter Insights', INSIGHTS_POST), ('Previous Opportunities', 'previous-opportunities.html'),
        ('Portfolio', 'portfolio.html'), ('Contact Us', 'learn.html'),
    ]
    lis = ''.join(f'<li><a class="ul" {attrs(h)}>{t}</a></li>' for t, h in quick)
    social = [('Facebook', 'https://www.facebook.com/JupiterTexasRealEstate', 'fb'),
              ('LinkedIn', 'https://www.linkedin.com/company/jupitertexas/', 'in'),
              ('Instagram', 'https://www.instagram.com/jupiterrealestateinvestments/', 'ig'),
              ('YouTube', 'https://www.youtube.com/channel/UCllm4AIj1HPq1GmLynSaWjA', 'yt')]
    soc = ''.join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="{n}">{ICON[i]}</a>' for n, u, i in social)
    return f'''<footer class="foot">
  <div class="wrap">
    <div class="foot-top">
      <a class="foot-brand" href="index.html" aria-label="Jupiter Texas, Home"><img src="{IMG}logo-navy.png" alt="Jupiter Texas Real Estate Group" width="419" height="600" loading="lazy"></a>
      <div class="foot-col foot-links"><h2>Quick Links</h2><ul>{lis}</ul></div>
      <div class="foot-col">
        <h2>Contact Info</h2>
        <ul><li><a class="ul" href="mailto:{EMAIL}">{EMAIL}</a></li><li><a class="ul" href="tel:{PHONE_TEL}">{PHONE_TEXT}</a></li></ul>
        <div class="social">{soc}</div>
      </div>
    </div>
    <div class="foot-legal">
      <p class="foot-copy">© 2022 by Jupiter Texas Real Estate Group.</p>
      <p>Disclaimer: The personal information collected is only used by Jupiter staff for the purposes to share information from Jupiter. We do not sell your information with any third parties and is confidential.</p>
      <p>*Returns are not guaranteed. Investment opportunities with <a class="ul" href="http://jupitertexas.com/" target="_blank" rel="noopener">JupiterTexas.com</a> involve risk. You should not invest unless you can sustain the risk of loss of capital, including the risk of total loss of capital. Please see additional disclosures here. Information in this message, including information regarding forecasted returns, property performance, are subject to change. Also any Forward-looking statements, hypothetical information or calculations, financial estimates and forecasted returns are inherently uncertain. Such information should not be used as the only basis or primary basis for an investor’s decision to invest.</p>
    </div>
  </div>
</footer>
<div class="peek" aria-hidden="true"><img alt=""></div>'''


def page(filename, title, desc, body, body_class=''):
    d = f'\n<meta name="description" content="{e(desc)}">' if desc else ''
    bc = f' class="{body_class}"' if body_class else ''
    doc = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{e(title)}</title>{d}
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="{IMG}logo-navy.png">
<link rel="stylesheet" href="assets/css/b.css">
<script>document.documentElement.classList.add('js','entering');</script>
</head>
<body{bc}>
{header(filename)}
<main id="main">
{body}
</main>
{footer()}
<script src="assets/js/b.js" defer></script>
</body>
</html>
'''
    with open(os.path.join(ROOT, filename), 'w', encoding='utf-8') as f:
        f.write(doc)


def masthead(title, strip=True, h='h1'):
    """Text-first page header with the panoramic page photo underneath."""
    s = f'''
  <div class="wrap"><figure class="strip"><img src="{IMG}page-hero.jpg" alt="" data-scrub></figure></div>''' if strip else ''
    return f'''<section class="mast">
  <div class="wrap"><{h} class="mast-title lines">{lines(title)}</{h}></div>{s}
</section>'''


def lines(text):
    """Wrap each line (split on |) so it can rise out of a mask."""
    return ''.join(f'<span class="ln"><span>{t}</span></span>' for t in text.split('|'))


def stats(p):
    return ''.join(f'<div><dd>{e(s["value"])}</dd><dt>{e(s["label"])}</dt></div>' for s in p['stats'])


def name(p):
    return ' '.join(t.strip() for t in p['title'])


def lot(p):
    """One property, written once; CSS lays it out as a gallery card or a ledger row."""
    title = ''.join(f'<span>{e(t.strip())}</span> ' for t in p['title']).strip()
    return f'''<article class="lot rv" data-peek="{p["img"]}">
  <div class="lot-img"><img src="{p["img"]}" alt="{e(name(p))}" loading="lazy"></div>
  <h3 class="lot-name">{title}</h3>
  <dl class="lot-stats">{stats(p)}</dl>
</article>'''


def views(target):
    return f'''<div class="views" role="group" aria-label="Layout">
  <button type="button" class="on" aria-pressed="true" data-view="gallery" data-target="{target}">{ICON["grid"]}<span>Gallery</span></button>
  <button type="button" aria-pressed="false" data-view="ledger" data-target="{target}">{ICON["list"]}<span>List</span></button>
  <i class="views-knob" aria-hidden="true"></i>
</div>'''


# ------------------------------------------------------------------ pages

def home():
    body = f'''
<section class="hero">
  <div class="wrap hero-top">
    <div class="hero-slides" aria-live="polite">
      <div class="hs on">
        <p class="hero-kicker"><span class="ln"><span>Smart Real Estate</span></span></p>
        <h1 class="hero-title">{lines("Cash Into|Cash Flow")}</h1>
      </div>
      <div class="hs" aria-hidden="true">
        <p class="hero-kicker"><span class="ln"><span>Smart Real Estate Investments</span></span></p>
        <p class="hero-title">{lines("An Experienced|Partner")}</p>
      </div>
    </div>
    <div class="hero-side">
      {btn(JOIN, 'Join Now')}
      <div class="ticks" role="group" aria-label="Slides">
        <button type="button" class="on" aria-label="Slide 1" aria-current="true"><i></i></button>
        <button type="button" aria-label="Slide 2" aria-current="false"><i></i></button>
      </div>
    </div>
  </div>
  <div class="hero-window"><img src="{IMG}home-hero.jpg" alt=""></div>
</section>

<section class="sec partner">
  <div class="wrap">
    <div class="partner-head">
      <h2 class="h2 rv">An Experienced Partner In CRE</h2>
      <div class="film rv">
        <video preload="none" playsinline poster="{IMG}partner-video-poster.jpg"><source src="assets/video/partner.mp4" type="video/mp4"></video>
        <img src="{IMG}partner-video-poster.jpg" alt="" loading="lazy">
        <button class="film-play" type="button" aria-label="Play video"><span>{ICON["play"]}</span></button>
      </div>
    </div>
    <p class="partner-lead rv">At Jupiter Texas We</p>
    <ol class="steps">
      <li class="rv"><span class="step-n">1</span><span class="step-t">Buy</span></li>
      <li class="rv"><span class="step-n">2</span><span class="step-t">Value add and manage</span></li>
      <li class="rv"><span class="step-n">3</span><span class="step-t">Sell</span></li>
    </ol>
    <div class="partner-end rv">
      <p>properties to deliver exceptional service to our clients</p>
      {btn(JOIN, 'Join Now')}
    </div>
  </div>
</section>

<section class="sec doors">
  <div class="wrap">
    <a class="door rv" href="strategy.html" data-peek="{IMG}card-strategy.jpg"><span class="door-img"><img src="{IMG}card-strategy.jpg" alt="Business Meeting" loading="lazy"></span><span class="door-t">Our Strategy</span><span class="door-more">Learn More{ICON["arrow"]}</span></a>
    <a class="door rv" href="portfolio.html" data-peek="{IMG}card-portfolio.jpg"><span class="door-img"><img src="{IMG}card-portfolio.jpg" alt="Modern Building" loading="lazy"></span><span class="door-t">Portfolio</span><span class="door-more">Learn More{ICON["arrow"]}</span></a>
    <a class="door rv" href="who-we-are.html" data-peek="{IMG}card-who-we-are.jpg"><span class="door-img"><img src="{IMG}card-who-we-are.jpg" alt="Apartment Building" loading="lazy"></span><span class="door-t">Who We Are</span><span class="door-more">Learn More{ICON["arrow"]}</span></a>
  </div>
</section>

<div class="vista" aria-hidden="true"><img src="{IMG}city-sky.jpg" alt="" loading="lazy" data-drift></div>

<section class="sec voice">
  <div class="wrap">
    <h2 class="voice-h rv">What Our Clients Say About Us</h2>
    <figure class="rv">
      <blockquote>"At Jupiter I have invested in multiple projects. They provided me with healthy returns, complete transparency and A class projects to invest. They are best at what they do."</blockquote>
      <figcaption>- Anil Bariki</figcaption>
    </figure>
    <p class="fine rv">"This testimonial was provided by a current investor in a Jupiter Texas project. No cash or non-cash compensation was provided for this testimonial. This testimonial may not be representative of the experience of other clients or investors, and is no guarantee of future performance or success."</p>
  </div>
</section>

<section class="sec mix">
  <div class="wrap mix-in">
    <div class="mix-copy">
      <h2 class="h2 rv">Our Portfolio</h2>
      <p class="rv">Our portfolio is a <b>balanced combination</b> of:</p>
      <ul class="mix-list rv">
        <li>Commercial retail</li><li>Day care centers</li><li>Medical buildings</li><li>Single-family rental homes</li>
      </ul>
      <p class="rv">picked by <b>experts</b> based on returns, stability and value to our investors.</p>
      <div class="rv">{btn("portfolio.html", "Learn More")}</div>
    </div>
    <figure class="mix-img rv"><img src="{IMG}home-portfolio.jpg" alt="Architectural Building" loading="lazy" data-drift></figure>
  </div>
</section>

<section class="call">
  <div class="wrap call-in">
    <svg class="orbits" viewBox="0 0 600 600" aria-hidden="true"><circle cx="300" cy="300" r="140"/><circle cx="300" cy="300" r="210"/><circle cx="300" cy="300" r="290"/></svg>
    <h2 class="rv">Get in touch for more information!</h2>
    <div class="rv">{btn("contact-us.html", "Contact Us", "btn-light")}</div>
  </div>
</section>'''
    page('index.html', 'Investment in Commercial Real Estate: Jupiter Texas Group',
         'Looking for investing in commercial real estate properties? Jupiter Texas helps investment in commercial real estate in USA. Top in among real estate companies',
         body, 'is-home')


def who_we_are():
    steps = [
        ('Acquire', 'wwa-acquire.jpg', 'Taking the Key', 'We acquire properties after performing due diligence (with a 1 in 200 acceptance ratio) finding many pre-market deals and working with trusted and competent professionals in our network.'),
        ('Add Value', 'wwa-add-value.jpg', 'Meetup with interior designer', 'We add value by further developing the property, increasing rents, and managing the health of the building, all while managing investor expectations for stable income flow and with zero headache.'),
        ('Sell', 'wwa-sell.jpg', 'Leasing a Home', 'We sell the properties at the right time with the sole objective of giving the highest appreciation returns on the property.'),
    ]
    frames = ''.join(f'<img src="{IMG}{f}" alt="{a}" loading="lazy" class="{"on" if i == 0 else ""}">' for i, (_, f, a, _) in enumerate(steps))
    chapters = ''.join(
        f'<div class="chap" data-i="{i}"><img class="chap-img" src="{IMG}{f}" alt="" loading="lazy"><span class="chap-n">{i + 1}</span><h3>{t}</h3><p>{x}</p></div>'
        for i, (t, f, a, x) in enumerate(steps))
    values = [
        'Jupiter is the largest planet in the solar system. Our Group is big and continually growing. We want to Grow Together with You.',
        'Jupiter is the fastest spinning planet. Our Group brings investment opportunities to you quickly and closes deals fast.',
        "The clouds on Jupiter are very thin. We don't believe in conducting business in a cloudy manner. We believe in clear, transparent information with our investors.",
        'The planet Jupiter has rings. Our Group has customers around us. You are our focus and we continually strive for the best customer experience.',
        'Jupiter has the strongest magnetic field of all the planets. We attract our investors through hard work, dedication and trust.',
    ]
    vals = ''.join(f'<li class="rv"><span class="val-n">{i + 1}</span><p>{t}</p></li>' for i, t in enumerate(values))
    body = f'''{masthead("Who We Are")}
<section class="sec">
  <div class="wrap">
    <h2 class="h2 rv">About Jupiter Texas</h2>
    <div class="story">
      <div class="story-frame" aria-hidden="true">{frames}</div>
      <div class="story-text">{chapters}</div>
    </div>
  </div>
</section>
<section class="sec core">
  <div class="wrap core-in">
    <figure class="core-img rv"><img src="{IMG}wwa-values.jpg" alt="" loading="lazy" data-drift></figure>
    <div class="core-copy">
      <h2 class="h2 rv">We Base Our Business On Core Values</h2>
      <p class="core-sub rv">Trust. Returns. Customer Experience.</p>
    </div>
  </div>
  <div class="wrap"><ol class="vals">{vals}</ol></div>
</section>
<aside class="note" id="newsletter" role="dialog" aria-labelledby="nl-title" aria-hidden="true">
  <button class="note-x" type="button" data-close aria-label="Close">{ICON["x"]}</button>
  <h2 id="nl-title">SIGN UP TO OUR NEWSLETTER</h2>
  <p>Discover the latest news and information on Commercial Real Estate Investment</p>
  <form class="fields" data-mailto="{EMAIL}" data-subject="SIGN UP TO OUR NEWSLETTER">
    <label class="fld"><input type="email" required placeholder=" " data-label="Email"><span>Email *</span></label>
    <label class="fld"><input type="tel" placeholder=" " data-label="Phone"><span>Phone</span></label>
    <button class="btn" type="submit"><span class="roll" data-t="Sign Up"><span>Sign Up</span></span></button>
  </form>
</aside>'''
    page('who-we-are.html', 'Who We Are | Jupiter Texas Real Estate Investment Group',
         'About Jupiter Texas - We acquire properties after performing due diligence (with a 1 in 200 acceptance ratio) finding many pre-market deals..', body)


def investors():
    items = ['Are high net-worth individuals (>$250K/$1M net worth)', 'Are busy professionals or business owners',
             'Want exposure to commercial real estate investment in their portfolio', 'Have capital to deploy for 2-5 years',
             'Are looking for tax advantaged investments']
    lis = ''.join(f'<li class="rv"><span class="tick">{ICON["check"]}</span><span>{e(t)}</span></li>' for t in items)
    body = f'''{masthead("Who are|Our Clients?")}
<section class="sec">
  <div class="wrap clients">
    <div class="clients-copy">
      <h2 class="h2 rv">Who are our clients?</h2>
      <ul class="crit">{lis}</ul>
      <div class="rv">{btn(JOIN, 'JOIN')}</div>
    </div>
    <figure class="clients-img rv"><img src="{IMG}investors.jpg" alt="Image by Sebastian Herrmann" loading="lazy" data-drift></figure>
  </div>
</section>'''
    page('who-are-our-investors.html', 'Who are Our Investors? | Jupiter Texas Group', '', body)


def strategy():
    why = [
        ('2X S&amp;P 500 Average Returns', 'S&amp;P AAR 8-10% in last 40 year<br>Jupiter Expected AAR: 15-20% (typically 20+%)'),
        ('Rigorous due diligence', 'We pick gems from the mine!<br>1 to 200 pick to reject ratio. Invest in properties which you may not be able to buy individually'),
        ('Reduce Tax and Leverage', 'Get benefits of depreciation and leverage from strong lender network of Jupiter'),
    ]
    whys = ''.join(f'<li class="rv"><h3>{h}</h3><p>{t}</p></li>' for h, t in why)
    left = [('Lead Generators', '(brings deals to us before the market knows)'),
            ('Lenders', '(Established trusted partners who give us best leverage)'),
            ('Attorneys', '(they cover our clients back!)')]
    right = [('Realtors', '(they help in selling at best price)'),
             ('Employees', '(Help in Operations and management)'),
             ('Others', '(Tenant mgmt., appraisers, inspectors etc.)')]

    def nodes(group, side):
        return ''.join(f'<div class="nd nd-{side}"><h3>{h}</h3><p>{t}</p></div>' for h, t in group)
    body = f'''{masthead("Strategy")}
<section class="sec">
  <div class="wrap why">
    <div class="why-head">
      <h2 class="h2 rv">Why Jupiter?</h2>
      <p class="lead rv">We make Commercial Real Estate accessible to you</p>
    </div>
    <ul class="why-cols">{whys}</ul>
  </div>
</section>
<section class="unique">
  <div class="unique-img"><img src="{IMG}strategy-unique.jpg" alt="" loading="lazy" data-drift></div>
  <div class="unique-copy">
    <h2 class="h2 rv">What makes Jupiter unique?</h2>
    <ol class="abc">
      <li class="rv"><span class="abc-l">a</span><p>Let us do the work while you benefit from the returns.</p></li>
      <li class="rv"><span class="abc-l">b</span><p>We pick gems from the mine! 1:200 pick to reject ratio.</p></li>
      <li class="rv"><span class="abc-l">c</span><div><p>Potential 2X S&amp;P average returns. Forecasted AAR is 15-25%.</p><p class="fine">All returns are subject to market risk. Returns are not guaranteed.</p></div></li>
    </ol>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <h2 class="h2 eco-h rv">Jupiter in an Ecosystem for successful investments</h2>
    <div class="net rv">
      <svg class="net-lines" aria-hidden="true"></svg>
      <div class="net-col">{nodes(left, "l")}</div>
      <div class="net-hub"><span>Customers</span></div>
      <div class="net-col">{nodes(right, "r")}</div>
    </div>
    <img class="partners rv" src="{IMG}strategy-partners.png" alt="Partners" loading="lazy">
  </div>
</section>'''
    page('strategy.html', 'Strategy | Jupiter Texas Real Estate Investment Group',
         'Why Jupiter? - ​We make Commercial Real Estate Investments accessible to you - Jupiter in an Ecosystem for successful investments', body)


def portfolio():
    cash = ''.join(lot(p) for p in PROPS['cash'])
    dev = ''.join(lot(p) for p in PROPS['dev'])
    body = f'''<section class="pf-head">
  <div class="wrap pf-head-in">
    <h1 class="mast-title lines">{lines("Our Portfolio")}</h1>
    <figure class="pf-map rv"><img src="{IMG}portfolio-map.jpg" alt=""></figure>
  </div>
</section>
<div class="dock">
  <div class="wrap dock-in">
    <nav class="tabs" aria-label="Portfolio sections"><a href="#cash-on-cash-properties" class="on">Cash On Cash Properties</a><a href="#development-projects">Development Projects</a><i class="tabs-bar" aria-hidden="true"></i></nav>
    {views("lots")}
  </div>
</div>
<section class="sec lots-sec" id="cash-on-cash-properties">
  <div class="wrap">
    <h2 class="h2 rv">Cash On Cash Properties</h2>
    <div class="lots" data-lots>{cash}</div>
  </div>
</section>
<section class="sec lots-sec" id="development-projects">
  <div class="wrap">
    <h2 class="h2 rv">Development Projects</h2>
    <div class="lots" data-lots>{dev}</div>
  </div>
</section>'''
    page('portfolio.html', 'Portfolio | Jupiter Investment Real Estate Group',
         'Looking for diversity in your investment portfolio? Visit us for our portfolio in commercial real estate investments. ', body)


def previous():
    cards = ''.join(lot(p) for p in PROPS['previous'])
    body = f'''<section class="pf-head pf-head-plain">
  <div class="wrap pf-head-in">
    <h1 class="mast-title lines">{lines("Cash On|Cash Properties")}</h1>
    {views("lots")}
  </div>
</section>
<section class="sec lots-sec">
  <div class="wrap"><div class="lots" data-lots>{cards}</div></div>
</section>'''
    page('previous-opportunities.html', 'Previous Opportunities | Jupiter Texas', '', body)


def current():
    body = f'''<section class="soon">
  <svg class="orbits" viewBox="0 0 600 600" aria-hidden="true"><circle cx="300" cy="300" r="110"/><circle cx="300" cy="300" r="190"/><circle cx="300" cy="300" r="280"/><circle class="moon" cx="300" cy="20" r="6"/></svg>
  <div class="wrap"><h1 class="mast-title lines">{lines("New Opportunities|Coming Soon!")}</h1></div>
</section>'''
    page('current-opportunities.html', 'Current Opportunities | Jupiter Texas', '', body, 'is-soon')


def faqs():
    jv = ['JV LLC is registered with the State of Texas and IRS', 'JV LLC Bank Account is opened for business',
          'JV LLC Operating Agreement is signed by shareholders', 'JV LLC Shareholders have access to all documents',
          'JV LLC Shareholders vote on all major decisions', 'JV Managers are paid fees as approved by members',
          'Each JV LLC Shareholder is also loan guarantor', 'Managers are responsible for managing the JV LLC as per the Operating Agreement',
          'Taxes are filed every year', 'Shareholders receive K-1s to assist in their tax filings', 'JV LLC is dissolved after property is sold']
    lp = ['LLC Structure protects personal property and assets from inside liability (lawsuit on the LLC)',
          'LLC Structure protects LLC property’s assets from outside liability (lawsuit on a member)']

    def item(q, answers, open_=False):
        lis = ''.join(f'<li>{e(a)}</li>' for a in answers)
        return (f'<div class="qa{" open" if open_ else ""}"><h3><button type="button" aria-expanded="{"true" if open_ else "false"}">'
                f'<span>{q}</span><i>{ICON["plus"]}</i></button></h3><div class="qa-a"><div><ul>{lis}</ul></div></div></div>')
    body = f'''{masthead("FAQs")}
<section class="sec">
  <div class="wrap faq">
    <div class="faq-side">
      <h2 class="h2 rv">Frequently asked questions</h2>
      <label class="find rv"><span class="sr">Search</span>{ICON["search"]}<input id="faq-search" type="search" placeholder="Looking for something?"></label>
    </div>
    <div class="faq-list rv">
      {item("JV LLC Structure", jv, True)}
      {item("Liability Protection", lp)}
      <p class="faq-none">No results</p>
    </div>
  </div>
</section>'''
    page('faqs.html', 'FAQs | Frequently Asked Questions from Jupiter Texas Group', '', body)


def contact_us():
    body = f'''<section class="contact">
  <div class="wrap contact-in">
    <h1 class="mast-title lines">{lines("Contact Us")}</h1>
    <form class="fields contact-form rv" data-mailto="{EMAIL}" data-subject="Contact Us">
      <label class="fld"><input type="text" autocomplete="given-name" placeholder=" " data-label="First Name"><span>First Name</span></label>
      <label class="fld"><input type="text" autocomplete="family-name" placeholder=" " data-label="Last Name"><span>Last Name</span></label>
      <label class="fld"><input type="email" required autocomplete="email" placeholder=" " data-label="Email"><span>Email *</span></label>
      <label class="fld"><input type="tel" required autocomplete="tel" placeholder=" " data-label="Phone"><span>Phone *</span></label>
      <button class="btn" type="submit"><span class="roll" data-t="Submit"><span>Submit</span></span></button>
    </form>
  </div>
</section>'''
    page('contact-us.html', 'Contact Us | Jupiter Texas', '', body)


def learn():
    body = f'''{masthead("Learn More")}
<section class="sec">
  <div class="wrap learn">
    <h2 class="h2 rv">Fill In To Know More</h2>
    <div class="embed rv"><iframe src="https://investors.appfolioim.com/jupitertexas/investor/contact-us" title="Fill In To Know More" loading="lazy"></iframe></div>
  </div>
</section>'''
    page('learn.html', 'Others | Jupiter Investment Group, Commercial Real Estate',
         'Contact Us - Jupiter Texas Real Estate Investment Group | info@jupitertexas.com • https://www.jupitertexas.com', body)


def insights():
    posts = [
        ('post-pandemic.jpg', 'Jupiter Info', 'May 11, 2023', '3 min read', 'Investing in various types of properties after the Pandemic!!!',
         "Don't believe the media hype about commercial real estate - the hard numbers tell a different story!", LIVE + '/post/investing-in-various-types-of-properties-after-the-pandemic'),
        ('post-adds-value.jpg', 'Bharath Gangula', 'Aug 31, 2022', '2 min read', 'How Jupiter adds value to commercial properties?',
         'At Jupiter we strive to bring the best deals to our investors, sometimes it’s a diamond in the rough. Through the following, we explain...', LIVE + '/post/how-jupiter-adds-value-to-commercial-properties'),
        ('post-inflation.jpg', 'Bharath Gangula', 'Jul 8, 2022', '1 min read', 'Jupiters approach in high inflation periods',
         'Inflation flare is burning the saving of investors, stock market hasn’t shown much respite yet, and residential home values have moved...', LIVE + '/post/jupiters-approach-in-high-inflation-periods'),
        ('post-market.jpg', 'Homarjun Agrahari', 'Apr 28, 2022', '2 min read', 'Our Perspective on the Market',
         'Lately you have recently heard a lot of talk about the market.  The stock market.  The housing market.  Interest rates.  Supply and...', LIVE + '/post/our-perspective-on-the-market'),
    ]
    ps = ''.join(
        f'<a class="post rv" href="{u}" target="_blank" rel="noopener"><span class="post-img"><img src="{IMG}{img}" alt="{e(t)}" loading="lazy"></span>'
        f'<span class="post-body"><span class="post-meta"><b>{a}</b><span>{d}</span><span>{r}</span></span><span class="post-t">{e(t)}</span><span class="post-x">{e(x)}</span></span></a>'
        for img, a, d, r, t, x, u in posts)
    reg = 'https://forms.gle/rSXNMYYnfMruMNe38'
    watch = 'https://attendee.gotowebinar.com/register/4873745150956827743'
    rec = 'https://register.gotowebinar.com/recording/1892930639451625219'
    body = f'''{masthead("Jupiter Insights")}
<section class="sec">
  <div class="wrap event">
    <a class="event-poster rv" href="{reg}" target="_blank" rel="noopener"><img src="{IMG}webinar-tax-series.jpg" alt="Jupiter Texas Education With" loading="lazy"></a>
    <div class="event-copy prose">
      <h2 class="h2 rv">Jupiter Investor Education Series</h2>
      <p class="event-topic rv">Topic: New Tax Laws for Real Estate Investors &amp; FBAR and Repatriation of Funds from India</p>
      <p class="rv">Unlock powerful strategies to maximize your after-tax returns and stay ahead of the latest tax laws with insights from top industry experts.</p>
      <div class="people rv">
        <div><h3>Featured Speaker:</h3><ul><li>Prabhakar Boyapally – CPA Expert</li></ul></div>
        <div><h3>Moderators: Our Co-founders</h3><ul><li>Dr. Bharath Gangula</li><li>Dr. Homarjun Agrahari</li></ul></div>
      </div>
      <h3 class="rv">What You’ll Learn:</h3>
      <ul class="rv"><li>Smart tax strategies for real estate investors &amp; key OBBBA provisions</li><li>Converting ordinary income to long-term capital gains</li><li>Using depreciation &amp; deductions to reduce taxable income</li><li>Step-up basis benefits, 1031 exchanges &amp; SDIRA investing</li><li>FBAR compliance &amp; repatriation of funds from India</li></ul>
      <div class="rv">{btn(reg, 'Register Here')}</div>
    </div>
  </div>
</section>
<section class="sec tint">
  <div class="wrap event event-flip">
    <a class="event-poster rv" href="{watch}" target="_blank" rel="noopener"><img src="{IMG}webinar-expert-talk.jpg" alt="Expert Talk Poster.png" loading="lazy"></a>
    <div class="event-copy prose">
      <h2 class="h2 rv">Watch Our Free Webinar:</h2>
      <p class="rv">Unlock the secrets to growing cash flow from real estate strategies and profitable long-term investments with our FREE webinar on Optimal Real Estate &amp; Financial Strategies For Profitable Long Term Investments!</p>
      <p class="rv">This talk is lead by industry experts:</p>
      <p class="rv">Dr. Bharath Gangula &amp; Dr. Homarjun Agrahari , Co-founders of Jupiter Texas, a commercial real estate company and financial planning industry expert Remy Cruzmel.</p>
      <p class="rv">In this expert talk series we will cover:</p>
      <ol class="rv">
        <li>Steady cash flow through real estate investments, selecting the right real estate investment opportunities, maximizing returns, mitigating risks, and securing your financial future.</li>
        <li>Aligning employer coverage, building a multimillion-dollar asset, and implementing tax optimization techniques.</li>
        <li>Valuable tips on converting your old 401(k) into a reliable pension plan, securing a stable retirement income, and funding your children's education</li>
      </ol>
      <p class="rv">Don't miss this exclusive opportunity to learn from the experts in the industry.</p>
      <div class="rv">{btn(watch, 'Watch Here')}</div>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap replay">
    <h2 class="h2 rv">Webinar</h2>
    <a class="replay-card rv" href="{rec}" target="_blank" rel="noopener" aria-label="Webinar"><img src="{IMG}webinar-recording.jpg" alt="" loading="lazy"><span class="film-play" aria-hidden="true"><span>{ICON["play"]}</span></span></a>
  </div>
</section>
<section class="sec tint">
  <div class="wrap">
    <div class="blog-head"><h2 class="h2 rv">Blogs</h2><span class="rv">All Posts</span></div>
    <div class="posts">{ps}</div>
  </div>
</section>'''
    page('insights.html', 'Jupiter Insights | Jupiter Texas Group Blog',
         'Latest Blogs  - How Jupiter adds value to commercial properties? - Jupiters approach in high inflation periods - Our Perspective on the Market', body)


if __name__ == '__main__':
    for build in (home, who_we_are, investors, strategy, portfolio, previous, current, faqs, contact_us, learn, insights):
        build()
    print('built 11 pages')
