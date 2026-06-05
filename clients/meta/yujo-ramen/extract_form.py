import re

with open('page.html', 'rb') as f:
    raw = f.read()
try:
    html = raw.decode('utf-8')
except UnicodeDecodeError:
    html = raw.decode('latin-1')

# Extract the full form block
form_match = re.search(r'<form\b[^>]*>.*?</form>', html, re.I | re.S)
if form_match:
    form_html = form_match.group()
    start = form_match.start()
    # Look at surrounding context to find the modal wrapper
    pre = html[max(0, start - 500):start]
    post = html[form_match.end():form_match.end() + 200]
    print('=== CONTEXTE AVANT LE FORM (500 chars) ===')
    print(pre)
    print()
    print('=== FORM HTML (taille:', len(form_html), 'chars) ===')
    print(form_html)
    print()
    print('=== CONTEXTE APRES LE FORM (200 chars) ===')
    print(post)
else:
    print('AUCUN form trouve')
