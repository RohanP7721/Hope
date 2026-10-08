#!/usr/bin/env python3
"""Option C: an investor-first, plainly structured Jupiter Texas site.

Same words, figures, images and links as www.jupitertexas.com.
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
    'chev': '<svg class="i-chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg>',
    'lock': '<svg class="i" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="9" width="12" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9"/></svg>',
    'arrow': '<svg class="i" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
    'out': '<svg class="i i-out" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 13 13 7M8 7h5v5"/></svg>',
    'play': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
    'x': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>',
    'menu': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14"/></svg>',
    'plus': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>',
    'search': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="m13 13 4 4"/></svg>',
    'check': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3.2L15 7"/></svg>',
    'mail': '<svg class="i" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="14" height="10" rx="2"/><path d="m3.5 6 6.5 5 6.5-5"/></svg>',
    'phone': '<svg class="i" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5h-2a1 1 0 0 0-1 1.1A12.5 12.5 0 0 0 15.4 16.5a1 1 0 0 0 1.1-1v-2l-3-1.2-1.4 1.4a9 9 0 0 1-4.8-4.8l1.4-1.4z"/></svg>',
    'fb': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46H16.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 3.95v2.25H8v3h2.5V21h3Z"/></svg>',
    'in': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.75h4V21H3V9.75Zm7 0h3.8v1.6h.05c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.9c0-1.17-.02-2.68-1.63-2.68-1.64 0-1.89 1.28-1.89 2.6V21h-4V9.75Z"/></svg>',
    'ig': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    'yt': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
}


def attrs(href):
    if href.startswith('http'):
        return f'href="{href}" target="_blank" rel="noopener"'
    return f'href="{href}"'


def btn(href, text, cls='', icon=''):
    c = 'btn' + (f' {cls}' if cls else '')
    return f'<a class="{c}" {attrs(href)}>{ICON[icon] if icon else ""}<span>{text}</span></a>'


def join(cls=''):
    return btn(JOIN, 'JOIN', cls)


def login(cls='btn-line'):
    return btn(LOGIN, 'Investor Login', cls, 'lock')


# ------------------------------------------------------------------ chrome

NAV = [
    ('About', [('The Company', 'who-we-are.html'), ('Our Investors', 'who-are-our-investors.html'), ('Our Strategy', 'strategy.html')]),
    ('Portfolio', [('Portfolio', 'portfolio.html'), ('Current Opportunities', 'current-opportunities.html'), ('Previous Opportunities', 'previous-opportunities.html')]),
    ('Insights', 'insights.html'),
    ('Learn', [('Learn More', 'learn.html'), ('FAQs', 'faqs.html'), ('Careers', CAREERS)]),
    ('Contact Us', 'contact-us.html'),
]


def section_of(page):
    for label, target in NAV:
        if isinstance(target, str) and target == page:
            return label
        if isinstance(target, list) and any(h == page for _, h in target):
            return label
    return ''


def sublink(t, h, page):
    cur = ' aria-current="page"' if h == page else ''
    return f'<a {attrs(h)}{cur}>{t}{ICON["out"] if h.startswith("http") else ""}</a>'


def header(page):
    here = section_of(page)
    items, drawer = [], []
    for label, target in NAV:
        on = ' is-on' if label == here else ''
        if isinstance(target, str):
            cur = ' aria-current="page"' if target == page else ''
            items.append(f'<li class="nav-item{on}"><a class="nav-link" href="{target}"{cur}>{label}</a></li>')
            drawer.append(f'<a class="dr-top" href="{target}"{cur}>{label}</a>')
        else:
            links = ''.join(sublink(t, h, page) for t, h in target)
            items.append(f'<li class="nav-item has-sub{on}"><button class="nav-link" type="button" aria-expanded="false">{label}{ICON["chev"]}</button><div class="sub"><div class="sub-in">{links}</div></div></li>')
            drawer.append(f'<div class="dr-group"><p>{label}</p>{links}</div>')
    return f'''<a class="skip" href="#main">Skip to Main Content</a>
<header class="hd">
  <div class="wrap hd-in">
    <a class="brand" href="index.html" aria-label="Jupiter Texas Real Estate Group, Home"><img src="{IMG}logo-navy.png" alt="" width="419" height="600"><span>Jupiter Texas<small>Real Estate Group</small></span></a>
    <nav class="nav" aria-label="Main"><ul>{''.join(items)}</ul></nav>
    <div class="hd-act">
      {login('btn-line btn-sm hd-login')}
      {join('btn-sm hd-join')}
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">{ICON["menu"]}</button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="dr-panel" role="dialog" aria-label="Menu">
    <div class="dr-head"><span>Menu</span><button class="dr-x" type="button" aria-label="Close menu">{ICON["x"]}</button></div>
    <div class="dr-act">{join()}{login()}</div>
    <nav class="dr-nav" aria-label="Main">{''.join(drawer)}</nav>
    <div class="dr-contact"><a href="mailto:{EMAIL}">{ICON["mail"]}{EMAIL}</a><a href="tel:{PHONE_TEL}">{ICON["phone"]}{PHONE_TEXT}</a></div>
  </div>
</div>'''


def footer():
    quick = [
        ('Home', 'index.html'), ('Development Projects', 'portfolio.html#development-projects'),
        ('About Us', 'who-we-are.html'), ('Current Opportunities', 'current-opportunities.html'),
        ('Jupiter Insights', INSIGHTS_POST), ('Previous Opportunities', 'previous-opportunities.html'),
        ('Portfolio', 'portfolio.html'), ('Contact Us', 'learn.html'),
    ]
    lis = ''.join(f'<li><a {attrs(h)}>{t}</a></li>' for t, h in quick)
    social = [('Facebook', 'https://www.facebook.com/JupiterTexasRealEstate', 'fb'),
              ('LinkedIn', 'https://www.linkedin.com/company/jupitertexas/', 'in'),
              ('Instagram', 'https://www.instagram.com/jupiterrealestateinvestments/', 'ig'),
              ('YouTube', 'https://www.youtube.com/channel/UCllm4AIj1HPq1GmLynSaWjA', 'yt')]
    soc = ''.join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="{n}">{ICON[i]}</a>' for n, u, i in social)
    return f'''<footer class="ft">
  <div class="wrap">
    <div class="ft-grid">
      <div class="ft-brand">
        <a href="index.html" aria-label="Jupiter Texas Real Estate Group, Home"><img src="{IMG}logo-white.png" alt="Jupiter Texas Real Estate Group" width="419" height="600" loading="lazy"></a>
        <div class="ft-act">{join('btn-white')}{login('btn-ghost-w')}</div>
      </div>
      <div class="ft-col ft-links"><h2>Quick Links</h2><ul>{lis}</ul></div>
      <div class="ft-col">
        <h2>Contact Info</h2>
        <ul class="ft-contact"><li><a href="mailto:{EMAIL}">{ICON["mail"]}{EMAIL}</a></li><li><a href="tel:{PHONE_TEL}">{ICON["phone"]}{PHONE_TEXT}</a></li></ul>
        <div class="social">{soc}</div>
      </div>
    </div>
    <div class="ft-legal">
      <p class="ft-copy">© 2022 by Jupiter Texas Real Estate Group.</p>
      <p>Disclaimer: The personal information collected is only used by Jupiter staff for the purposes to share information from Jupiter. We do not sell your information with any third parties and is confidential.</p>
      <p>*Returns are not guaranteed. Investment opportunities with <a href="http://jupitertexas.com/" target="_blank" rel="noopener">JupiterTexas.com</a> involve risk. You should not invest unless you can sustain the risk of loss of capital, including the risk of total loss of capital. Please see additional disclosures here. Information in this message, including information regarding forecasted returns, property performance, are subject to change. Also any Forward-looking statements, hypothetical information or calculations, financial estimates and forecasted returns are inherently uncertain. Such information should not be used as the only basis or primary basis for an investor’s decision to invest.</p>
    </div>
  </div>
</footer>
<div class="cta-bar" aria-label="Investor access">{login()}{join()}</div>'''


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
<link rel="stylesheet" href="assets/css/c.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body{bc}>
{header(filename)}
<main id="main">
{body}
</main>
{footer()}
<script src="assets/js/c.js" defer></script>
</body>
</html>
'''
    with open(os.path.join(ROOT, filename), 'w', encoding='utf-8') as f:
        f.write(doc)


def crumbs(trail):
    parts = ['<a href="index.html">Home</a>']
    for i, (t, h) in enumerate(trail):
        if i == len(trail) - 1:
            parts.append(f'<span aria-current="page">{t}</span>')
        else:
            parts.append(f'<a href="{h}">{t}</a>' if h else f'<span>{t}</span>')
    return f'<nav class="crumbs" aria-label="Breadcrumb">{"".join(parts)}</nav>'


def head(title, trail, img=IMG + 'page-hero.jpg', alt='', extra=''):
    """Inner-page header: breadcrumb and title on the left, photo on the right."""
    pic = f'<figure class="ph-img"><img src="{img}" alt="{alt}"></figure>' if img else ''
    return f'''<section class="ph">
  <div class="wrap ph-in{" no-img" if not img else ""}">
    <div class="ph-text">{crumbs(trail)}<h1>{title}</h1>{extra}</div>
    {pic}
  </div>
</section>'''


def sec_head(title, link=None, tag='h2'):
    l = f'<a class="link" {attrs(link[1])}><span>{link[0]}</span>{ICON["arrow"]}</a>' if link else ''
    return f'<div class="sh"><{tag} class="h2 rv">{title}</{tag}>{l}</div>'


def card(p):
    title = ' '.join(t.strip() for t in p['title'])
    st = ''.join(f'<div><dd>{e(s["value"])}</dd><dt>{e(s["label"])}</dt></div>' for s in p['stats'])
    return f'''<article class="prop rv">
  <div class="prop-img"><img src="{p["img"]}" alt="{e(title)}" loading="lazy"></div>
  <div class="prop-body"><h3>{e(title)}</h3><dl class="figs">{st}</dl></div>
</article>'''


# ------------------------------------------------------------------ pages

def home():
    facts = [('2X', 'S&amp;P 500 Average Returns'), ('15-20%', 'Jupiter Expected AAR (typically 20+%)'),
             ('8-10%', 'S&amp;P AAR in last 40 year'), ('1:200', 'pick to reject ratio')]
    fs = ''.join(f'<div class="fact rv"><b>{v}</b><span>{l}</span></div>' for v, l in facts)
    preview = ''.join(card(p) for p in PROPS['cash'][:3])
    body = f'''
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-text">
      <div class="slides" aria-live="polite">
        <div class="slide on"><p class="kicker">Smart Real Estate</p><h1>Cash Into Cash Flow</h1></div>
        <div class="slide" aria-hidden="true"><p class="kicker">Smart Real Estate Investments</p><p class="h1">An Experienced Partner</p></div>
      </div>
      <div class="hero-act">{btn(JOIN, 'Join Now', 'btn-lg')}{login('btn-line btn-lg')}</div>
      <div class="dots" role="group" aria-label="Slides"><button type="button" class="on" aria-label="Slide 1" aria-current="true"></button><button type="button" aria-label="Slide 2" aria-current="false"></button></div>
    </div>
    <figure class="hero-img"><img src="{IMG}home-hero.jpg" alt=""></figure>
  </div>
</section>

<section class="facts-sec">
  <div class="wrap">
    <div class="facts">{fs}</div>
    <div class="facts-foot"><p>All returns are subject to market risk. Returns are not guaranteed.</p><a class="link" href="strategy.html"><span>Our Strategy</span>{ICON["arrow"]}</a></div>
  </div>
</section>

<section class="sec">
  <div class="wrap split">
    <div class="split-text">
      <h2 class="h2 rv">An Experienced Partner In CRE</h2>
      <p class="rv">At Jupiter Texas We</p>
      <ol class="verbs rv"><li><span>1</span>Buy</li><li><span>2</span>Value add and manage</li><li><span>3</span>Sell</li></ol>
      <p class="rv">properties to deliver exceptional service to our clients</p>
      <div class="rv">{btn(JOIN, 'Join Now')}</div>
    </div>
    <div class="video rv">
      <video preload="none" playsinline poster="{IMG}partner-video-poster.jpg"><source src="assets/video/partner.mp4" type="video/mp4"></video>
      <img src="{IMG}partner-video-poster.jpg" alt="" loading="lazy">
      <button class="play" type="button" aria-label="Play video"><span>{ICON["play"]}</span></button>
    </div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap">
    <div class="tiles">
      <a class="tile rv" href="strategy.html"><span class="tile-img"><img src="{IMG}card-strategy.jpg" alt="Business Meeting" loading="lazy"></span><span class="tile-body"><span class="tile-t">Our Strategy</span><span class="link"><span>Learn More</span>{ICON["arrow"]}</span></span></a>
      <a class="tile rv" href="portfolio.html"><span class="tile-img"><img src="{IMG}card-portfolio.jpg" alt="Modern Building" loading="lazy"></span><span class="tile-body"><span class="tile-t">Portfolio</span><span class="link"><span>Learn More</span>{ICON["arrow"]}</span></span></a>
      <a class="tile rv" href="who-we-are.html"><span class="tile-img"><img src="{IMG}card-who-we-are.jpg" alt="Apartment Building" loading="lazy"></span><span class="tile-body"><span class="tile-t">Who We Are</span><span class="link"><span>Learn More</span>{ICON["arrow"]}</span></span></a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="split split-top">
      <figure class="frame rv"><img src="{IMG}home-portfolio.jpg" alt="Architectural Building" loading="lazy"></figure>
      <div class="split-text">
        <h2 class="h2 rv">Our Portfolio</h2>
        <p class="rv">Our portfolio is a <b>balanced combination</b> of:</p>
        <ul class="ticks rv"><li>{ICON["check"]}Commercial retail</li><li>{ICON["check"]}Day care centers</li><li>{ICON["check"]}Medical buildings</li><li>{ICON["check"]}Single-family rental homes</li></ul>
        <p class="rv">picked by <b>experts</b> based on returns, stability and value to our investors.</p>
        <div class="rv">{btn("portfolio.html", "Learn More")}</div>
      </div>
    </div>
    <div class="grid3 pre">{preview}</div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap">
    <figure class="quote rv">
      <h2 class="quote-h">What Our Clients Say About Us</h2>
      <blockquote>"At Jupiter I have invested in multiple projects. They provided me with healthy returns, complete transparency and A class projects to invest. They are best at what they do."</blockquote>
      <figcaption>- Anil Bariki</figcaption>
      <p class="fine">"This testimonial was provided by a current investor in a Jupiter Texas project. No cash or non-cash compensation was provided for this testimonial. This testimonial may not be representative of the experience of other clients or investors, and is no guarantee of future performance or success."</p>
    </figure>
  </div>
</section>

<section class="cta">
  <img src="{IMG}city-sky.jpg" alt="" loading="lazy">
  <div class="wrap cta-in">
    <h2 class="rv">Get in touch for more information!</h2>
    <div class="cta-act rv">{btn("contact-us.html", "Contact Us", "btn-white btn-lg")}{btn(JOIN, "JOIN", "btn-ghost-w btn-lg")}</div>
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
    st = ''.join(f'<article class="step rv"><div class="step-img"><img src="{IMG}{f}" alt="{a}" loading="lazy"></div><div class="step-body"><span class="num">{i + 1}</span><h3>{t}</h3><p>{x}</p></div></article>' for i, (t, f, a, x) in enumerate(steps))
    values = [
        'Jupiter is the largest planet in the solar system. Our Group is big and continually growing. We want to Grow Together with You.',
        'Jupiter is the fastest spinning planet. Our Group brings investment opportunities to you quickly and closes deals fast.',
        "The clouds on Jupiter are very thin. We don't believe in conducting business in a cloudy manner. We believe in clear, transparent information with our investors.",
        'The planet Jupiter has rings. Our Group has customers around us. You are our focus and we continually strive for the best customer experience.',
        'Jupiter has the strongest magnetic field of all the planets. We attract our investors through hard work, dedication and trust.',
    ]
    vs = ''.join(f'<li class="rv"><span class="num">{i + 1}</span><p>{t}</p></li>' for i, t in enumerate(values))
    body = f'''{head("Who We Are", [("About", None), ("The Company", None)])}
<section class="sec">
  <div class="wrap">
    {sec_head("About Jupiter Texas")}
    <div class="grid3">{st}</div>
  </div>
</section>
<section class="sec alt">
  <div class="wrap values">
    <div class="values-head">
      <h2 class="h2 rv">We Base Our Business On Core Values</h2>
      <p class="lead rv">Trust. Returns. Customer Experience.</p>
      <figure class="frame rv"><img src="{IMG}wwa-values.jpg" alt="" loading="lazy"></figure>
    </div>
    <ol class="vlist">{vs}</ol>
  </div>
</section>
<aside class="note" id="newsletter" role="dialog" aria-labelledby="nl-title" aria-hidden="true">
  <button class="note-x" type="button" data-close aria-label="Close">{ICON["x"]}</button>
  <h2 id="nl-title">SIGN UP TO OUR NEWSLETTER</h2>
  <p>Discover the latest news and information on Commercial Real Estate Investment</p>
  <form class="form" data-mailto="{EMAIL}" data-subject="SIGN UP TO OUR NEWSLETTER">
    <div class="field"><label for="nl-email">Email <span class="req">*</span></label><input id="nl-email" type="email" required data-label="Email"></div>
    <div class="field"><label for="nl-phone">Phone</label><input id="nl-phone" type="tel" data-label="Phone"></div>
    <button class="btn" type="submit"><span>Sign Up</span></button>
  </form>
</aside>'''
    page('who-we-are.html', 'Who We Are | Jupiter Texas Real Estate Investment Group',
         'About Jupiter Texas - We acquire properties after performing due diligence (with a 1 in 200 acceptance ratio) finding many pre-market deals..', body)


def investors():
    items = ['Are high net-worth individuals (>$250K/$1M net worth)', 'Are busy professionals or business owners',
             'Want exposure to commercial real estate investment in their portfolio', 'Have capital to deploy for 2-5 years',
             'Are looking for tax advantaged investments']
    lis = ''.join(f'<li><span class="ck">{ICON["check"]}</span>{e(t)}</li>' for t in items)
    body = f'''{head("Who are Our Clients?", [("About", None), ("Our Investors", None)])}
<section class="sec">
  <div class="wrap split">
    <div class="panel rv">
      <h2 class="h2">Who are our clients?</h2>
      <ul class="checks">{lis}</ul>
      <div class="row-act">{join()}{login()}</div>
    </div>
    <figure class="frame tall rv"><img src="{IMG}investors.jpg" alt="Image by Sebastian Herrmann" loading="lazy"></figure>
  </div>
</section>'''
    page('who-are-our-investors.html', 'Who are Our Investors? | Jupiter Texas Group', '', body)


def strategy():
    why = [
        ('2X S&amp;P 500 Average Returns', 'S&amp;P AAR 8-10% in last 40 year<br>Jupiter Expected AAR: 15-20% (typically 20+%)'),
        ('Rigorous due diligence', 'We pick gems from the mine!<br>1 to 200 pick to reject ratio. Invest in properties which you may not be able to buy individually'),
        ('Reduce Tax and Leverage', 'Get benefits of depreciation and leverage from strong lender network of Jupiter'),
    ]
    ws = ''.join(f'<article class="card rv"><span class="num">{i + 1}</span><h3>{h}</h3><p>{t}</p></article>' for i, (h, t) in enumerate(why))
    top = [('Lead Generators', '(brings deals to us before the market knows)'), ('Lenders', '(Established trusted partners who give us best leverage)'), ('Attorneys', '(they cover our clients back!)')]
    bottom = [('Realtors', '(they help in selling at best price)'), ('Employees', '(Help in Operations and management)'), ('Others', '(Tenant mgmt., appraisers, inspectors etc.)')]

    def nodes(g):
        return ''.join(f'<div class="node rv"><h3>{h}</h3><p>{t}</p></div>' for h, t in g)
    body = f'''{head("Strategy", [("About", None), ("Our Strategy", None)])}
<section class="sec">
  <div class="wrap">
    <div class="sh sh-stack"><h2 class="h2 rv">Why Jupiter?</h2><p class="lead rv">We make Commercial Real Estate accessible to you</p></div>
    <div class="grid3">{ws}</div>
  </div>
</section>
<section class="sec alt">
  <div class="wrap split">
    <figure class="frame rv"><img src="{IMG}strategy-unique.jpg" alt="" loading="lazy"></figure>
    <div class="panel navy rv">
      <h2 class="h2">What makes Jupiter unique?</h2>
      <ol class="abc">
        <li><span>a</span><p>Let us do the work while you benefit from the returns.</p></li>
        <li><span>b</span><p>We pick gems from the mine! 1:200 pick to reject ratio.</p></li>
        <li><span>c</span><div><p>Potential 2X S&amp;P average returns. Forecasted AAR is 15-25%.</p><p class="fine">All returns are subject to market risk. Returns are not guaranteed.</p></div></li>
      </ol>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sh sh-center"><h2 class="h2 rv">Jupiter in an Ecosystem for successful investments</h2></div>
    <div class="eco">
      <div class="eco-row">{nodes(top)}</div>
      <div class="eco-hub rv"><span>Customers</span></div>
      <div class="eco-row">{nodes(bottom)}</div>
    </div>
    <img class="partners rv" src="{IMG}strategy-partners.png" alt="Partners" loading="lazy">
  </div>
</section>'''
    page('strategy.html', 'Strategy | Jupiter Texas Real Estate Investment Group',
         'Why Jupiter? - ​We make Commercial Real Estate Investments accessible to you - Jupiter in an Ecosystem for successful investments', body)


def portfolio():
    cash = ''.join(card(p) for p in PROPS['cash'])
    dev = ''.join(card(p) for p in PROPS['dev'])
    body = f'''{head("Our Portfolio", [("Portfolio", None)], IMG + "portfolio-map.jpg", "", '<div class="ph-act">' + join() + login() + '</div>')}
<div class="tabs-bar">
  <div class="wrap"><nav class="tabs" aria-label="Portfolio sections"><a href="#cash-on-cash-properties" class="on">Cash On Cash Properties</a><a href="#development-projects">Development Projects</a></nav></div>
</div>
<section class="sec" id="cash-on-cash-properties">
  <div class="wrap">{sec_head("Cash On Cash Properties")}<div class="grid3">{cash}</div></div>
</section>
<section class="sec alt" id="development-projects">
  <div class="wrap">{sec_head("Development Projects")}<div class="grid3">{dev}</div></div>
</section>
<section class="sec">
  <div class="wrap grid2">
    <a class="jump-card rv" href="current-opportunities.html"><span>Current Opportunities</span>{ICON["arrow"]}</a>
    <a class="jump-card rv" href="previous-opportunities.html"><span>Previous Opportunities</span>{ICON["arrow"]}</a>
  </div>
</section>'''
    page('portfolio.html', 'Portfolio | Jupiter Investment Real Estate Group',
         'Looking for diversity in your investment portfolio? Visit us for our portfolio in commercial real estate investments. ', body)


def previous():
    cards = ''.join(card(p) for p in PROPS['previous'])
    body = f'''{head("Cash On Cash Properties", [("Portfolio", "portfolio.html"), ("Previous Opportunities", None)], None)}
<section class="sec sec-tight">
  <div class="wrap"><div class="grid3">{cards}</div></div>
</section>'''
    page('previous-opportunities.html', 'Previous Opportunities | Jupiter Texas', '', body)


def current():
    body = f'''{head("Current Opportunities", [("Portfolio", "portfolio.html"), ("Current Opportunities", None)], None)}
<section class="sec sec-tight">
  <div class="wrap">
    <div class="soon rv">
      <h2>New Opportunities Coming Soon!</h2>
      <div class="row-act">{join()}{btn("previous-opportunities.html", "Previous Opportunities", "btn-line")}</div>
    </div>
  </div>
</section>'''
    page('current-opportunities.html', 'Current Opportunities | Jupiter Texas', '', body)


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
    body = f'''{head("FAQs", [("Learn", "learn.html"), ("FAQs", None)])}
<section class="sec">
  <div class="wrap faq">
    <div class="faq-side">
      <h2 class="h2 rv">Frequently asked questions</h2>
      <label class="search rv"><span class="sr">Search</span>{ICON["search"]}<input id="faq-search" type="search" placeholder="Looking for something?"></label>
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
    body = f'''{head("Contact Us", [("Contact Us", None)], None)}
<section class="sec sec-tight">
  <div class="wrap contact">
    <form class="panel form form-2 rv" data-mailto="{EMAIL}" data-subject="Contact Us">
      <div class="field"><label for="c-first">First Name</label><input id="c-first" type="text" autocomplete="given-name" data-label="First Name"></div>
      <div class="field"><label for="c-last">Last Name</label><input id="c-last" type="text" autocomplete="family-name" data-label="Last Name"></div>
      <div class="field"><label for="c-email">Email <span class="req">*</span></label><input id="c-email" type="email" required autocomplete="email" data-label="Email"></div>
      <div class="field"><label for="c-phone">Phone <span class="req">*</span></label><input id="c-phone" type="tel" required autocomplete="tel" placeholder="Phone" data-label="Phone"></div>
      <button class="btn btn-lg" type="submit"><span>Submit</span></button>
    </form>
    <aside class="panel side rv">
      <h2>Contact Info</h2>
      <a href="mailto:{EMAIL}">{ICON["mail"]}{EMAIL}</a>
      <a href="tel:{PHONE_TEL}">{ICON["phone"]}{PHONE_TEXT}</a>
      <div class="side-act">{join()}{login()}</div>
    </aside>
  </div>
</section>'''
    page('contact-us.html', 'Contact Us | Jupiter Texas', '', body)


def learn():
    body = f'''{head("Learn More", [("Learn More", None)])}
<section class="sec">
  <div class="wrap narrow">
    {sec_head("Fill In To Know More")}
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
        f'<span class="post-body"><span class="meta"><b>{a}</b><span>{d}</span><span>{r}</span></span><span class="post-t">{e(t)}</span><span class="post-x">{e(x)}</span></span></a>'
        for img, a, d, r, t, x, u in posts)
    reg = 'https://forms.gle/rSXNMYYnfMruMNe38'
    watch = 'https://attendee.gotowebinar.com/register/4873745150956827743'
    rec = 'https://register.gotowebinar.com/recording/1892930639451625219'
    body = f'''{head("Jupiter Insights", [("Jupiter Insights", None)])}
<section class="sec">
  <div class="wrap event">
    <a class="poster rv" href="{reg}" target="_blank" rel="noopener"><img src="{IMG}webinar-tax-series.jpg" alt="Jupiter Texas Education With" loading="lazy"></a>
    <div class="prose">
      <h2 class="h2 rv">Jupiter Investor Education Series</h2>
      <p class="topic rv">Topic: New Tax Laws for Real Estate Investors &amp; FBAR and Repatriation of Funds from India</p>
      <p class="rv">Unlock powerful strategies to maximize your after-tax returns and stay ahead of the latest tax laws with insights from top industry experts.</p>
      <div class="people rv">
        <div><h3>Featured Speaker:</h3><ul><li>Prabhakar Boyapally – CPA Expert</li></ul></div>
        <div><h3>Moderators: Our Co-founders</h3><ul><li>Dr. Bharath Gangula</li><li>Dr. Homarjun Agrahari</li></ul></div>
      </div>
      <h3 class="rv">What You’ll Learn:</h3>
      <ul class="rv"><li>Smart tax strategies for real estate investors &amp; key OBBBA provisions</li><li>Converting ordinary income to long-term capital gains</li><li>Using depreciation &amp; deductions to reduce taxable income</li><li>Step-up basis benefits, 1031 exchanges &amp; SDIRA investing</li><li>FBAR compliance &amp; repatriation of funds from India</li></ul>
      <div class="act rv">{btn(reg, 'Register Here', 'btn-lg')}</div>
    </div>
  </div>
</section>
<section class="sec alt">
  <div class="wrap event flip">
    <a class="poster rv" href="{watch}" target="_blank" rel="noopener"><img src="{IMG}webinar-expert-talk.jpg" alt="Expert Talk Poster.png" loading="lazy"></a>
    <div class="prose">
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
      <div class="act rv">{btn(watch, 'Watch Here', 'btn-lg')}</div>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap narrow">
    {sec_head("Webinar")}
    <a class="video recording rv" href="{rec}" target="_blank" rel="noopener" aria-label="Webinar"><img src="{IMG}webinar-recording.jpg" alt="" loading="lazy"><span class="play" aria-hidden="true"><span>{ICON["play"]}</span></span></a>
  </div>
</section>
<section class="sec alt">
  <div class="wrap">
    <div class="sh"><h2 class="h2 rv">Blogs</h2><span class="muted rv">All Posts</span></div>
    <div class="grid2 posts">{ps}</div>
  </div>
</section>'''
    page('insights.html', 'Jupiter Insights | Jupiter Texas Group Blog',
         'Latest Blogs  - How Jupiter adds value to commercial properties? - Jupiters approach in high inflation periods - Our Perspective on the Market', body)


if __name__ == '__main__':
    for build in (home, who_we_are, investors, strategy, portfolio, previous, current, faqs, contact_us, learn, insights):
        build()
    print('built 11 pages')
