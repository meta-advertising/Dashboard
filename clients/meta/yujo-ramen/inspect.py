import re

with open('page.html', 'rb') as f:
    raw = f.read()
# Try utf-8 first, fall back to latin-1
try:
    html = raw.decode('utf-8')
except UnicodeDecodeError:
    html = raw.decode('latin-1')

print('=== Taille HTML:', len(html), 'chars ===')
print('Nb <form>:', len(re.findall(r'<form\b', html, re.I)))
print('Nb </form>:', len(re.findall(r'</form>', html, re.I)))
print('Nb <input:', len(re.findall(r'<input\b', html, re.I)))
print('Nb <textarea:', len(re.findall(r'<textarea\b', html, re.I)))
print('Nb <select:', len(re.findall(r'<select\b', html, re.I)))
print('Nb <button:', len(re.findall(r'<button\b', html, re.I)))
print()
print("=== Occurrences 'rejoins' / 'devenir franchis' / 'franchis' ===")
for kw in ['rejoins', 'devenir franchis', 'devenir-franchise', 'franchise-form', 'franchiseform']:
    matches = list(re.finditer(r'.{30}' + kw + r'.{80}', html, re.I))
    print(f"-- '{kw}': {len(matches)} match(es)")
    for m in matches[:5]:
        print('   ', repr(m.group()[:200]))
print()
print('=== Occurrences modal/popup/lightbox/overlay ===')
for kw in ['modal', 'popup', 'lightbox', 'overlay', 'fancybox', 'reveal']:
    matches = list(re.finditer(r'.{20}' + kw + r'.{60}', html, re.I))
    if matches:
        print(f"-- '{kw}': {len(matches)} match(es), premiers:")
        for m in matches[:3]:
            print('   ', repr(m.group()[:200]))
print()
print('=== Tous les <a> ou <button> dont le contenu contient franchise/rejoins ===')
for m in re.finditer(r'<(a|button)[^>]*>[^<]{0,200}(franchis|rejoins)[^<]{0,200}</\1>', html, re.I):
    print(repr(m.group()[:300]))
