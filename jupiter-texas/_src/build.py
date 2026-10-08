#!/usr/bin/env python3
"""Builds every page of the Jupiter Texas site from one shared layout.

All words, figures and links are copied from www.jupitertexas.com.
Run:  python3 _src/build.py   (from the jupiter-texas folder or anywhere)
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

e = html.escape


def ext(href, text, cls=''):
    """Link that leaves this site (opens in a new tab)."""
    c = f' class="{cls}"' if cls else ''
    return f'<a{c} href="{href}" target="_blank" rel="noopener">{text}</a>'


ICON = {
    'chev': '<svg class="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5"/></svg>',
    'left': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>',
    'right': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>',
    'play': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>',
    'x': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>',
    'plus': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>',
    'search': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="m14 14 3.5 3.5"/></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    'fb': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46H16.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 3.95v2.25H8v3h2.5V21h3Z"/></svg>',
    'in': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.75h4V21H3V9.75Zm7 0h3.8v1.6h.05c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.9c0-1.17-.02-2.68-1.63-2.68-1.64 0-1.89 1.28-1.89 2.6V21h-4V9.75Z"/></svg>',
    'ig': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    'yt': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
}

# ------------------------------------------------------------------ layout

NAV = [
    ('About', None, [('The Company', 'who-we-are.html'), ('Our Investors', 'who-are-our-investors.html'), ('Our Strategy', 'strategy.html')]),
    ('Portfolio', 'portfolio.html', None),
    ('Insights', 'insights.html', None),
    ('Contact Us', 'contact-us.html', None),
    ('Learn', 'learn.html', [('Careers', CAREERS), ('FAQs', 'faqs.html')]),
]


def link_attrs(href, page):
    if href.startswith('http'):
        return f'href="{href}" target="_blank" rel="noopener"'
    cur = ' aria-current="page"' if href == page else ''
    return f'href="{href}"{cur}'


def header(page):
    items = []
    for label, href, sub in NAV:
        on = (href == page) or bool(sub and any(h == page for _, h in sub))
        cls = ' class="is-current"' if on and not sub else ''
        if sub:
            dcls = 'has-drop' + (' is-current' if on else '')
            links = (f'<a {link_attrs(href, page)}>{label}</a>' if href else '') + ''.join(f'<a {link_attrs(h, page)}>{t}</a>' for t, h in sub)
            items.append(
                f'<li class="{dcls}"><button type="button" aria-expanded="false" aria-haspopup="true">{label}{ICON["chev"]}</button>'
                f'<div class="drop">{links}</div></li>')
        else:
            items.append(f'<li{cls}><a {link_attrs(href, page)}>{label}</a></li>')
    sheet = []
    for label, href, sub in NAV:
        if sub:
            subl = (f'<a {link_attrs(href, page)}>{label}</a>' if href else '') + ''.join(f'<a {link_attrs(h, page)}>{t}</a>' for t, h in sub)
            sheet.append(f'<div class="group"><span>{label}</span><div class="sub">{subl}</div></div>')
        else:
            sheet.append(f'<div class="group"><a {link_attrs(href, page)}>{label}</a></div>')
    return f'''<a class="skip" href="#main">Skip to Main Content</a>
<header class="head">
  <div class="wrap head-bar">
    <a class="logo" href="index.html" aria-label="Jupiter Texas, Home">
      <img class="logo-navy" src="assets/img/site/logo-navy.png" alt="Jupiter Texas Real Estate Group" width="419" height="600">
      <img class="logo-white" src="assets/img/site/logo-white.png" alt="" width="419" height="600">
    </a>
    <nav aria-label="Main">
      <ul class="menu-main">
        {''.join(items)}
        <li class="menu-rule" aria-hidden="true"></li>
      </ul>
    </nav>
    <div class="head-end">
      {ext(LOGIN, 'Investor Login', 'head-login')}
      {ext(JOIN, 'JOIN', 'btn btn-sm')}
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="sheet-menu"><i></i><i></i></button>
    </div>
  </div>
</header>
<div class="sheet-menu" id="sheet-menu" aria-hidden="true">
  {''.join(sheet)}
  <div class="sheet-foot">
    {ext(JOIN, 'JOIN', 'btn')}
    {ext(LOGIN, 'Investor Login', 'btn btn-line')}
  </div>
</div>'''


def footer():
    quick = [
        ('Home', 'index.html'), ('Development  Projects', 'portfolio.html#development-projects'),
        ('About Us', 'who-we-are.html'), ('Current Opportunities', 'current-opportunities.html'),
        ('Jupiter Insights', INSIGHTS_POST), ('Previous Opportunities', 'previous-opportunities.html'),
        ('Portfolio', 'portfolio.html'), ('', ''),
        ('Contact Us', 'learn.html'),
    ]
    lis = ''.join(f'<li><a {link_attrs(h, "")}>{t.replace("  ", " ")}</a></li>' if t else '<li aria-hidden="true"></li>' for t, h in quick)
    return f'''<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-logo"><a href="index.html" aria-label="Jupiter Texas, Home"><img src="assets/img/site/logo-white.png" alt="Jupiter Texas Real Estate Group" width="419" height="600"></a></div>
      <div class="foot-links">
        <h4>Quick Links</h4>
        <ul>{lis}</ul>
      </div>
      <div class="foot-contact">
        <h4>Contact Info</h4>
        <ul>
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li><a href="tel:{PHONE_TEL}">{PHONE_TEXT}</a></li>
        </ul>
        <div class="socials">
          <a href="https://www.facebook.com/JupiterTexasRealEstate" target="_blank" rel="noopener" aria-label="Facebook">{ICON["fb"]}</a>
          <a href="https://www.linkedin.com/company/jupitertexas/" target="_blank" rel="noopener" aria-label="LinkedIn">{ICON["in"]}</a>
          <a href="https://www.instagram.com/jupiterrealestateinvestments/" target="_blank" rel="noopener" aria-label="Instagram">{ICON["ig"]}</a>
          <a href="https://www.youtube.com/channel/UCllm4AIj1HPq1GmLynSaWjA" target="_blank" rel="noopener" aria-label="YouTube">{ICON["yt"]}</a>
        </div>
      </div>
    </div>
    <div class="foot-base">
      <p class="copy">© 2022 by Jupiter Texas Real Estate Group.</p>
      <p>Disclaimer: The personal information collected is only used by Jupiter staff for the purposes to share information from Jupiter. We do not sell your information with any third parties and is confidential.</p>
      <p>*Returns are not guaranteed. Investment opportunities with <a href="http://jupitertexas.com/" target="_blank" rel="noopener">JupiterTexas.com</a> involve risk. You should not invest unless you can sustain the risk of loss of capital, including the risk of total loss of capital. Please see additional disclosures here. Information in this message, including information regarding forecasted returns, property performance, are subject to change. Also any Forward-looking statements, hypothetical information or calculations, financial estimates and forecasted returns are inherently uncertain. Such information should not be used as the only basis or primary basis for an investor’s decision to invest.</p>
    </div>
  </div>
</footer>'''


def page(filename, title, desc, body, body_class='', extra_head=''):
    d = f'\n<meta name="description" content="{e(desc)}">' if desc else ''
    bc = f' class="{body_class}"' if body_class else ''
    doc = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{e(title)}</title>{d}
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="assets/img/site/logo-navy.png">
<link rel="preload" href="assets/fonts/instrument-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">{extra_head}
<script>document.documentElement.classList.add('js');</script>
</head>
<body{bc}>
{header(filename)}
<main id="main">
{body}
</main>
{footer()}
<script src="assets/js/site.js" defer></script>
</body>
</html>
'''
    with open(os.path.join(ROOT, filename), 'w', encoding='utf-8') as f:
        f.write(doc)


def p_hero(title, img='assets/img/site/page-hero.jpg'):
    return f'''<section class="p-hero">
  <img src="{img}" alt="" data-drift="10">
  <div class="wrap"><h1 class="rv">{title}</h1></div>
</section>'''


def card(p, delay=0):
    title = ''.join(f'<span>{e(t.strip())}</span>' for t in p['title'])
    stats = ''.join(f'<div><dt>{e(s["label"])}</dt><dd>{e(s["value"])}</dd></div>' for s in p['stats'])
    return f'''<article class="prop rv" style="--d:{delay:.2f}s">
  <div class="img"><img src="{p["img"]}" alt="{e(" ".join(t.strip() for t in p["title"]))}" loading="lazy" width="1000" height="667"></div>
  <div class="body"><h3>{title}</h3><dl class="stats">{stats}</dl></div>
</article>'''


# ------------------------------------------------------------------ pages

def home():
    body = f'''
<section class="hero" aria-label="Smart Real Estate">
  <img src="assets/img/site/home-hero.jpg" alt="" data-drift="8" data-zoom>
  <div class="wrap">
    <div class="slides" aria-live="polite">
      <div class="slide on" aria-hidden="false">
        <span class="eyebrow">Smart Real Estate</span>
        <h1><span class="line"><span>Cash Into</span></span><span class="line"><span>Cash Flow</span></span></h1>
      </div>
      <div class="slide" aria-hidden="true">
        <span class="eyebrow">Smart Real Estate Investments</span>
        <h2 class="h1"><span class="line"><span>An Experienced</span></span><span class="line"><span>Partner</span></span></h2>
      </div>
    </div>
    <div class="hero-actions">
      {ext(JOIN, 'Join Now', 'btn btn-white')}
      <div class="hero-dots" role="group" aria-label="Slides"><button class="on" type="button" aria-label="Slide 1"></button><button type="button" aria-label="Slide 2"></button></div>
    </div>
  </div>
  <div class="hero-arrows">
    <button class="round round-glass" type="button" data-slide="-1" aria-label="Previous slide">{ICON["left"]}</button>
    <button class="round round-glass" type="button" data-slide="1" aria-label="Next slide">{ICON["right"]}</button>
  </div>
</section>

<section class="section">
  <div class="wrap partner">
    <div class="partner-copy">
      <h2 class="rv">An Experienced Partner In CRE</h2>
      <p class="rv" style="--d:.06s">At Jupiter Texas We</p>
      <ul class="verbs rv" style="--d:.12s"><li>Buy</li><li>Value add and manage</li><li>Sell</li></ul>
      <p class="rv" style="--d:.18s">properties to deliver exceptional service to our clients</p>
      <div class="rv" style="--d:.24s">{ext(JOIN, 'Join Now', 'btn')}</div>
    </div>
    <div class="partner-media">
      <div class="video clip">
        <video preload="none" playsinline poster="assets/img/site/partner-video-poster.jpg"><source src="assets/video/partner.mp4" type="video/mp4"></video>
        <img src="assets/img/site/partner-video-poster.jpg" alt="" loading="lazy">
        <button class="video-play" type="button" aria-label="Play video"><span>{ICON["play"]}</span></button>
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap trio">
    <a class="tile rv" href="strategy.html"><div class="img"><img src="assets/img/site/card-strategy.jpg" alt="Business Meeting" loading="lazy"></div><div class="body"><h3>Our Strategy</h3><span class="more">Learn More</span></div></a>
    <a class="tile rv" style="--d:.08s" href="portfolio.html"><div class="img"><img src="assets/img/site/card-portfolio.jpg" alt="Modern Building" loading="lazy"></div><div class="body"><h3>Portfolio</h3><span class="more">Learn More</span></div></a>
    <a class="tile rv" style="--d:.16s" href="who-we-are.html"><div class="img"><img src="assets/img/site/card-who-we-are.jpg" alt="Apartment Building" loading="lazy"></div><div class="body"><h3>Who We Are</h3><span class="more">Learn More</span></div></a>
  </div>
</section>

<div class="band" aria-hidden="true"><img src="assets/img/site/city-sky.jpg" alt="" data-drift="14" loading="lazy"></div>

<section class="section">
  <div class="wrap quote">
    <h2 class="rv">What Our Clients Say About Us</h2>
    <figure class="rv" style="--d:.1s">
      <blockquote>"At Jupiter I have invested in multiple projects. They provided me with healthy returns, complete transparency and A class projects to invest. They are best at what they do."</blockquote>
      <figcaption>- Anil Bariki</figcaption>
      <p class="fine">"This testimonial was provided by a current investor in a Jupiter Texas project. No cash or non-cash compensation was provided for this testimonial. This testimonial may not be representative of the experience of other clients or investors, and is no guarantee of future performance or success."</p>
    </figure>
  </div>
</section>

<section class="section cloud">
  <div class="wrap feature">
    <div class="feature-media clip"><img src="assets/img/site/home-portfolio.jpg" alt="Architectural Building" loading="lazy" data-drift="8"></div>
    <div class="feature-copy">
      <h2 class="rv">Our Portfolio</h2>
      <p class="rv" style="--d:.06s">Our portfolio is a <b>balanced combination</b> of:</p>
      <ul class="ticks rv" style="--d:.12s"><li>Commercial retail</li><li>Day care centers</li><li>Medical buildings</li><li>Single-family rental homes</li></ul>
      <p class="rv" style="--d:.18s">picked by <b>experts</b> based on returns, stability and value to our investors.</p>
      <a class="btn rv" style="--d:.24s" href="portfolio.html">Learn More</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cta">
    <h2 class="rv">Get in touch for more information!</h2>
    <a class="btn rv" style="--d:.08s" href="contact-us.html">Contact Us</a>
  </div>
</section>'''
    page('index.html', 'Investment in Commercial Real Estate: Jupiter Texas Group',
         'Looking for investing in commercial real estate properties? Jupiter Texas helps investment in commercial real estate in USA. Top in among real estate companies',
         body, 'over-hero')


def who_we_are():
    values = [
        ('1', 'Jupiter is the largest planet in the solar system. Our Group is big and continually growing. We want to Grow Together with You.'),
        ('2', 'Jupiter is the fastest spinning planet. Our Group brings investment opportunities to you quickly and closes deals fast.'),
        ('3', "The clouds on Jupiter are very thin. We don't believe in conducting business in a cloudy manner. We believe in clear, transparent information with our investors."),
        ('4', 'The planet Jupiter has rings. Our Group has customers around us. You are our focus and we continually strive for the best customer experience.'),
        ('5', 'Jupiter has the strongest magnetic field of all the planets. We attract our investors through hard work, dedication and trust.'),
    ]
    vals = ''.join(f'<li class="value rv" style="--d:{(i % 3) * .08:.2f}s"><span class="n">{n}</span><p>{t}</p></li>' for i, (n, t) in enumerate(values))
    body = f'''{p_hero("Who We Are")}
<section class="section">
  <div class="wrap">
    <div class="intro rv"><h2>About Jupiter Texas</h2></div>
    <div class="rows">
      <div class="row">
        <div class="media clip"><img src="assets/img/site/wwa-acquire.jpg" alt="Taking the Key" loading="lazy"></div>
        <p class="text rv"><em>acquire</em>We acquire properties after performing due diligence (with a 1 in 200 acceptance ratio) finding many pre-market deals and working with trusted and competent professionals in our network.</p>
      </div>
      <div class="row flip">
        <div class="media clip"><img src="assets/img/site/wwa-add-value.jpg" alt="Meetup with interior designer" loading="lazy"></div>
        <p class="text rv"><em>add value</em>We add value by further developing the property, increasing rents, and managing the health of the building, all while managing investor expectations for stable income flow and with zero headache.</p>
      </div>
      <div class="row">
        <div class="media clip"><img src="assets/img/site/wwa-sell.jpg" alt="Leasing a Home" loading="lazy"></div>
        <p class="text rv"><em>sell</em>We sell the properties at the right time with the sole objective of giving the highest appreciation returns on the property.</p>
      </div>
    </div>
  </div>
</section>
<section class="values-band">
  <img src="assets/img/site/wwa-values.jpg" alt="" data-drift="14" loading="lazy">
  <div class="wrap">
    <h2 class="rv">We Base Our Business On Core Values</h2>
    <p class="rv" style="--d:.08s">Trust. Returns. Customer Experience.</p>
  </div>
</section>
<section class="section cloud">
  <div class="wrap"><ol class="values">{vals}</ol></div>
</section>
<div class="pop" id="newsletter" role="dialog" aria-modal="true" aria-labelledby="nl-title" aria-hidden="true">
  <div class="pop-card">
    <button class="pop-x" type="button" data-close aria-label="Close">{ICON["x"]}</button>
    <h2 id="nl-title">SIGN UP TO OUR NEWSLETTER</h2>
    <p>Discover the latest news and information on Commercial Real Estate Investment</p>
    <form class="form" data-mailto="{EMAIL}" data-subject="SIGN UP TO OUR NEWSLETTER" style="grid-template-columns:1fr;text-align:left">
      <div class="field"><label for="nl-email">Email <span class="req">*</span></label><input id="nl-email" type="email" required data-label="Email"></div>
      <div class="field"><label for="nl-phone">Phone</label><input id="nl-phone" type="tel" data-label="Phone"></div>
      <button class="btn" type="submit" style="justify-self:stretch">Sign Up</button>
    </form>
  </div>
</div>'''
    page('who-we-are.html', 'Who We Are | Jupiter Texas Real Estate Investment Group',
         'About Jupiter Texas - We acquire properties after performing due diligence (with a 1 in 200 acceptance ratio) finding many pre-market deals..', body)


def investors():
    items = ['Are high net-worth individuals (>$250K/$1M net worth)', 'Are busy professionals or business owners',
             'Want exposure to commercial real estate investment in their portfolio', 'Have capital to deploy for 2-5 years',
             'Are looking for tax advantaged investments']
    lis = ''.join(f'<li>{ICON["check"]}<span>{e(t)}</span></li>' for t in items)
    body = f'''{p_hero("Who are Our Clients?")}
<section class="section">
  <div class="wrap clients">
    <div class="media clip"><img src="assets/img/site/investors.jpg" alt="Image by Sebastian Herrmann" loading="lazy"></div>
    <div class="copy">
      <h2 class="rv">Who are our clients?</h2>
      <ul class="checks rv" style="--d:.08s">{lis}</ul>
      <div class="rv" style="--d:.16s">{ext(JOIN, 'JOIN', 'btn')}</div>
    </div>
  </div>
</section>'''
    page('who-are-our-investors.html', 'Who are Our Investors? | Jupiter Texas Group', '', body)


def strategy():
    why = [
        ('2X S&amp;P 500 Average Returns', 'S&amp;P AAR 8-10% in last 40 year<br>Jupiter Expected AAR: 15-20% (typically 20+%)'),
        ('Rigorous due diligence', 'We pick gems from the mine!<br>1 to 200 pick to reject ratio. Invest in properties which you may not be able to buy individually'),
        ('Reduce Tax and Leverage', 'Get benefits of depreciation and leverage from strong lender network of Jupiter'),
    ]
    whys = ''.join(f'<li class="rv" style="--d:{i * .08:.2f}s"><h3>{h}</h3><p>{t}</p></li>' for i, (h, t) in enumerate(why))
    nodes = [  # position around the centre: (left %, top %)
        ('Lead Generators', '(brings deals to us before the market knows)', 18, 22),
        ('Lenders', '(Established trusted partners who give us best leverage)', 50, 8),
        ('Attorneys', '(they cover our clients back!)', 82, 22),
        ('Realtors', '(they help in selling at best price)', 18, 78),
        ('Employees', '(Help in Operations and management)', 50, 92),
        ('Others', '(Tenant mgmt., appraisers, inspectors etc.)', 82, 78),
    ]
    nd = ''.join(f'<div class="node" style="left:{x}%;top:{y}%"><h4>{h}</h4><p>{t}</p></div>' for h, t, x, y in nodes)
    body = f'''{p_hero("Strategy")}
<section class="section">
  <div class="wrap center">
    <h2 class="h2 rv">Why Jupiter?</h2>
    <p class="lead rv" style="--d:.06s;margin-top:16px">We make Commercial Real Estate accessible to you</p>
    <ul class="why" style="text-align:left">{whys}</ul>
  </div>
</section>
<section class="unique">
  <img src="assets/img/site/strategy-unique.jpg" alt="" data-drift="14" loading="lazy">
  <div class="wrap">
    <h2 class="rv">What makes Jupiter unique?</h2>
    <ul class="abc">
      <li class="rv"><span class="l">a</span><p>Let us do the work while you benefit from the returns.</p></li>
      <li class="rv" style="--d:.08s"><span class="l">b</span><p>We pick gems from the mine! 1:200 pick to reject ratio.</p></li>
      <li class="rv" style="--d:.16s"><span class="l">c</span><p>Potential 2X S&amp;P average returns. Forecasted AAR is 15-25%.</p><p class="fine">All returns are subject to market risk. Returns are not guaranteed.</p></li>
    </ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="eco-head rv"><h2>Jupiter in an Ecosystem for successful investments</h2></div>
    <div class="orbit rv">
      <span class="orbit-ring" aria-hidden="true"></span><span class="orbit-ring r2" aria-hidden="true"></span>
      <div class="orbit-core"><h3>Customers</h3></div>
      {nd}
    </div>
    <img class="partners-img rv" src="assets/img/site/strategy-partners.png" alt="Partners" loading="lazy">
  </div>
</section>'''
    page('strategy.html', 'Strategy | Jupiter Texas Real Estate Investment Group',
         'Why Jupiter? - ​We make Commercial Real Estate Investments accessible to you - Jupiter in an Ecosystem for successful investments', body)


def portfolio():
    cash = ''.join(card(p, (i % 3) * .06) for i, p in enumerate(PROPS['cash']))
    dev = ''.join(card(p) for p in PROPS['dev'])
    body = f'''<section class="wrap p-intro">
  <h1 class="rv">Our Portfolio</h1>
  <div class="map clip"><img src="assets/img/site/portfolio-map.jpg" alt=""></div>
</section>
<nav class="jump" aria-label="Portfolio sections" style="margin-top:64px">
  <div class="wrap"><a href="#cash-on-cash-properties" class="on">Cash On Cash Properties</a><a href="#development-projects">Development Projects</a></div>
</nav>
<section class="section" id="cash-on-cash-properties">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Cash On Cash Properties</h2></div>
    <div class="grid">{cash}</div>
  </div>
</section>
<section class="section cloud" id="development-projects" data-hrow>
  <div class="wrap">
    <div class="sec-head">
      <h2 class="rv">Development Projects</h2>
      <div class="hrow-nav"><button class="round round-line" type="button" data-prev aria-label="Previous projects">{ICON["left"]}</button><button class="round round-line" type="button" data-next aria-label="Next projects">{ICON["right"]}</button></div>
    </div>
  </div>
  <div class="hrow">{dev}</div>
  <div class="wrap"><div class="hrow-progress" aria-hidden="true"><i></i></div></div>
</section>'''
    page('portfolio.html', 'Portfolio | Jupiter Investment Real Estate Group',
         'Looking for diversity in your investment portfolio? Visit us for our portfolio in commercial real estate investments. ', body)


def previous():
    cards = ''.join(card(p, (i % 3) * .06) for i, p in enumerate(PROPS['previous']))
    body = f'''<section class="section plain-top">
  <div class="wrap">
    <div class="sec-head"><h1 class="rv" style="font-size:var(--t-3xl);letter-spacing:-.035em;color:var(--navy)">Cash On Cash Properties</h1></div>
    <div class="grid">{cards}</div>
  </div>
</section>'''
    page('previous-opportunities.html', 'Previous Opportunities | Jupiter Texas', '', body)


def current():
    body = '''<section class="soon"><div class="wrap"><h1 class="rv">New Opportunities Coming Soon!</h1></div></section>'''
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
        cls = 'faq-item open' if open_ else 'faq-item'
        return (f'<div class="{cls}"><button class="faq-q" type="button" aria-expanded="{"true" if open_ else "false"}">{q}<span class="pm">{ICON["plus"]}</span></button>'
                f'<div class="faq-a"><div><ul>{lis}</ul></div></div></div>')
    body = f'''{p_hero("FAQs")}
<section class="section">
  <div class="wrap" style="max-width:calc(880px + 2 * var(--edge))">
    <div class="faq-top">
      <h2 class="rv">Frequently asked questions</h2>
      <label class="search rv" style="--d:.06s"><span class="sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Search</span><input id="faq-search" type="search" placeholder="Looking for something?">{ICON["search"]}</label>
    </div>
    <div class="faq rv" style="--d:.1s">
      {item("JV LLC Structure", jv, True)}
      {item("Liability Protection", lp)}
    </div>
    <p class="faq-empty">No results</p>
  </div>
</section>'''
    page('faqs.html', 'FAQs | Frequently Asked Questions from Jupiter Texas Group', '', body)


def contact_us():
    body = f'''<section class="section plain-top">
  <div class="wrap form-wrap">
    <div>
      <h1 class="rv">Contact Us</h1>
      <form class="form rv" style="--d:.08s" data-mailto="{EMAIL}" data-subject="Contact Us">
        <div class="field"><label for="c-first">First Name</label><input id="c-first" type="text" autocomplete="given-name" data-label="First Name"></div>
        <div class="field"><label for="c-last">Last Name</label><input id="c-last" type="text" autocomplete="family-name" data-label="Last Name"></div>
        <div class="field"><label for="c-email">Email <span class="req">*</span></label><input id="c-email" type="email" required autocomplete="email" data-label="Email"></div>
        <div class="field"><label for="c-phone">Phone <span class="req">*</span></label><input id="c-phone" type="tel" required autocomplete="tel" placeholder="Phone" data-label="Phone"></div>
        <button class="btn full" type="submit">Submit</button>
      </form>
    </div>
  </div>
</section>'''
    page('contact-us.html', 'Contact Us | Jupiter Texas', '', body)


def learn():
    body = f'''{p_hero("Learn More")}
<section class="section">
  <div class="wrap" style="max-width:calc(880px + 2 * var(--edge))">
    <h2 class="h2 center rv" style="margin-bottom:48px;color:var(--navy)">Fill In To Know More</h2>
    <div class="frame rv" style="--d:.08s"><iframe src="https://investors.appfolioim.com/jupitertexas/investor/contact-us" title="Fill In To Know More" loading="lazy"></iframe></div>
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
        f'<a class="post rv" href="{u}" target="_blank" rel="noopener"><div class="img"><img src="assets/img/site/{img}" alt="{e(t)}" loading="lazy"></div>'
        f'<div class="body"><div class="meta"><b>{a}</b><span>{d}</span><span>{r}</span></div><h3>{e(t)}</h3><p>{e(x)}</p></div></a>'
        for img, a, d, r, t, x, u in posts)
    reg = 'https://forms.gle/rSXNMYYnfMruMNe38'
    watch = 'https://attendee.gotowebinar.com/register/4873745150956827743'
    rec = 'https://register.gotowebinar.com/recording/1892930639451625219'
    body = f'''{p_hero("Jupiter Insights")}
<section class="section">
  <div class="wrap webinar">
    <div class="copy">
      <h2 class="rv">Jupiter Investor Education Series</h2>
      <p class="rv"><b style="color:var(--ink)">Topic: New Tax Laws for Real Estate Investors &amp; FBAR and Repatriation of Funds from India</b></p>
      <p class="rv">Unlock powerful strategies to maximize your after-tax returns and stay ahead of the latest tax laws with insights from top industry experts.</p>
      <h3 class="rv">Featured Speaker:</h3>
      <ul class="rv"><li>Prabhakar Boyapally – CPA Expert</li></ul>
      <h3 class="rv">Moderators: Our Co-founders</h3>
      <ul class="rv"><li>Dr. Bharath Gangula</li><li>Dr. Homarjun Agrahari</li></ul>
      <h3 class="rv">What You’ll Learn:</h3>
      <ul class="rv"><li>Smart tax strategies for real estate investors &amp; key OBBBA provisions</li><li>Converting ordinary income to long-term capital gains</li><li>Using depreciation &amp; deductions to reduce taxable income</li><li>Step-up basis benefits, 1031 exchanges &amp; SDIRA investing</li><li>FBAR compliance &amp; repatriation of funds from India</li></ul>
      <div class="rv">{ext(reg, 'Register Here', 'btn')}</div>
    </div>
    <a class="poster clip" href="{reg}" target="_blank" rel="noopener"><img src="assets/img/site/webinar-tax-series.jpg" alt="Jupiter Texas Education With" loading="lazy"></a>
  </div>
</section>
<section class="section cloud">
  <div class="wrap webinar flip">
    <div class="copy">
      <h2 class="rv">Watch Our Free Webinar:</h2>
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
      <div class="rv">{ext(watch, 'Watch Here', 'btn')}</div>
    </div>
    <a class="poster clip" href="{watch}" target="_blank" rel="noopener"><img src="assets/img/site/webinar-expert-talk.jpg" alt="Expert Talk Poster.png" loading="lazy"></a>
  </div>
</section>
<section class="section">
  <div class="wrap webinar-video">
    <h2 class="rv">Webinar</h2>
    <a class="clip" href="{rec}" target="_blank" rel="noopener" aria-label="Webinar"><img src="assets/img/site/webinar-recording.jpg" alt="" loading="lazy"><span class="video-play" aria-hidden="true"><span>{ICON["play"]}</span></span></a>
  </div>
</section>
<section class="section cloud">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv">Blogs</h2><span class="count">All Posts</span></div>
    <div class="posts">{ps}</div>
  </div>
</section>'''
    page('insights.html', 'Jupiter Insights | Jupiter Texas Group Blog',
         'Latest Blogs  - How Jupiter adds value to commercial properties? - Jupiters approach in high inflation periods - Our Perspective on the Market', body)


if __name__ == '__main__':
    for build in (home, who_we_are, investors, strategy, portfolio, previous, current, faqs, contact_us, learn, insights):
        build()
    print('built 11 pages')
