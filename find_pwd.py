import re, os

controllers = [
    'backend/controllers/candidateController.js',
    'backend/controllers/employerController.js',
    'backend/controllers/adminController.js',
    'backend/controllers/employerPasswordController.js',
]

for f in controllers:
    if not os.path.exists(f):
        print('MISSING:', f)
        continue
    c = open(f,'rb').read().decode('utf-8')
    for m in re.finditer(r'exports\.(\w+)\s*=', c):
        name = m.group(1).lower()
        if any(x in name for x in ['password','passwd','pwd','changepass','resetpass','updatepass','confirmreset']):
            print(f'{f} -> exports.{m.group(1)}')
