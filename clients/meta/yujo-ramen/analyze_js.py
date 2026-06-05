import re

with open('frontend.js', 'rb') as f:
    js = f.read().decode('utf-8', errors='replace')

print('=' * 70)
print('1) RECHERCHE handler lpOpenForm / LpFormOverlay / LpFormClose / LpFormPopup')
print('=' * 70)
for kw in ['lpOpenForm', 'LpFormOverlay', 'LpFormPopup', 'LpFormClose', 'lpFormPopup', 'lpFormOverlay']:
    for m in re.finditer(r'.{0,80}' + re.escape(kw) + r'.{0,200}', js):
        line_no = js[:m.start()].count('\n') + 1
        print(f'L{line_no} [{kw}]: {m.group().strip()[:300]}')
    print()

print('=' * 70)
print('2) HANDLERS submit / ContactForm')
print('=' * 70)
for kw in ['ContactForm', 'ContactFormSubmit', 'security', 'submit(', '.submit(', 'preventDefault', '#ContactForm']:
    matches = list(re.finditer(r'.{0,40}' + re.escape(kw) + r'.{0,160}', js))
    if matches:
        print(f'--- {kw}: {len(matches)} occurrence(s) ---')
        for m in matches[:8]:
            line_no = js[:m.start()].count('\n') + 1
            print(f'  L{line_no}: {m.group().strip()[:250]}')

print()
print('=' * 70)
print('3) AJAX / FETCH / XHR / formData')
print('=' * 70)
for kw in ['$.ajax', '$.post', 'XMLHttpRequest', 'fetch(', 'new FormData', 'FormData(']:
    matches = list(re.finditer(r'.{0,40}' + re.escape(kw) + r'.{0,200}', js))
    if matches:
        print(f'--- {kw}: {len(matches)} occurrence(s) ---')
        for m in matches[:5]:
            line_no = js[:m.start()].count('\n') + 1
            print(f'  L{line_no}: {m.group().strip()[:300]}')

print()
print('=' * 70)
print('4) Redirections / merci / success / thank')
print('=' * 70)
for kw in ['merci', 'success', 'thank', 'confirm', 'window.location', 'document.location', 'redirect']:
    matches = list(re.finditer(r'.{0,40}' + re.escape(kw) + r'.{0,160}', js, re.I))
    if matches:
        print(f'--- {kw}: {len(matches)} occurrence(s) ---')
        for m in matches[:5]:
            line_no = js[:m.start()].count('\n') + 1
            print(f'  L{line_no}: {m.group().strip()[:250]}')
