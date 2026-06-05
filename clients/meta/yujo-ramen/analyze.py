import re

with open('page.html', 'rb') as f:
    raw = f.read()
try:
    html = raw.decode('utf-8')
except UnicodeDecodeError:
    html = raw.decode('latin-1')

print('=' * 70)
print('1) WRAPPER MODALE - chercher le conteneur englobant le form')
print('=' * 70)
# Find the parent wrapper of the form
form_start = html.find('<form id="ContactForm"')
# Look backwards for a wrapper div with id/class containing lpForm/popup/modal
pre = html[max(0, form_start - 3000):form_start]
print('--- 3000 chars avant le form ---')
print(pre[-1500:])  # Last 1500 chars before form

print()
print('=' * 70)
print('2) TOUS LES <a class="lpOpenForm"> - CTA d ouverture')
print('=' * 70)
for m in re.finditer(r'<a[^>]*lpOpenForm[^>]*>[^<]*</a>', html, re.I):
    # Find approximate line number
    line_no = html[:m.start()].count('\n') + 1
    print(f'L{line_no}: {m.group()}')

print()
print('=' * 70)
print('3) STYLES INLINE / CLASSES qui pourraient cacher la modale')
print('=' * 70)
for m in re.finditer(r'(lpFormW|lpForm[A-Z]\w*|popupform)[\w\-]*', html):
    pass  # just count
keywords = ['lpFormW', 'lpFormHeader', 'lpFormContent', 'lpFormProofs', 'popupform', 'lpFormClose']
for kw in keywords:
    count = len(re.findall(re.escape(kw), html))
    print(f'  {kw}: {count} occurrences')

print()
print('=' * 70)
print('4) SCRIPTS EXTERNES - LISTE COMPLETE')
print('=' * 70)
for m in re.finditer(r'<script[^>]*src=["\']([^"\']+)["\']', html, re.I):
    print(f'  {m.group(1)}')

print()
print('=' * 70)
print('5) SCRIPTS INLINE - extraits pertinents')
print('=' * 70)
for m in re.finditer(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', html, re.I | re.S):
    code = m.group(1).strip()
    if not code:
        continue
    if len(code) < 30:
        continue
    # Look for tracking/form keywords
    interesting = any(k in code.lower() for k in ['fbq', 'gtag', 'gtm', 'submit', 'lpopenform', 'pixel', 'fbclid', 'gclid', 'ttq', 'clarity', 'hotjar'])
    if interesting:
        line_no = html[:m.start()].count('\n') + 1
        print(f'--- Script inline @ L{line_no} ({len(code)} chars) ---')
        print(code[:2000])
        print()

print()
print('=' * 70)
print('6) RECHERCHE TAGS TRACKING dans tout le HTML')
print('=' * 70)
for kw in ['GTM-', 'AW-', 'UA-', 'G-', 'fbq(', 'gtag(', 'ttq.', 'hotjar', 'clarity', 'linkedin', 'pinterest', 'snapchat', 'tiktok', 'pixel', 'fbclid', 'gclid']:
    matches = list(re.finditer(r'.{0,40}' + re.escape(kw) + r'.{0,80}', html, re.I))
    if matches:
        print(f'-- {kw}: {len(matches)} occ.')
        seen = set()
        for m in matches[:5]:
            snippet = m.group().strip()
            if snippet in seen:
                continue
            seen.add(snippet)
            print(f'   {snippet[:160]}')
