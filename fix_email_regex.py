import os

files = [
    'frontend/src/app/pannels/public-user/components/pages/auth/SignupCandidate.jsx',
    'frontend/src/app/pannels/public-user/components/pages/auth/SignupEmployer.jsx',
    'frontend/src/app/pannels/public-user/components/pages/auth/SignupPlacement.jsx',
]

# The file literally contains: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test
# where \s is a backslash followed by s (two chars)
# In Python bytes, backslash = 0x5c, so \\s in bytes = b'\x5cs'
BACKSLASH = b'\x5c'
old_b = b'/^[^' + BACKSLASH + b's@]+@[^' + BACKSLASH + b's@]+' + BACKSLASH + b'.[^' + BACKSLASH + b's@]+$/.test'
new_b = b'/^[a-zA-Z0-9._%+' + BACKSLASH + b'-]+@[a-zA-Z0-9.' + BACKSLASH + b'-]+' + BACKSLASH + b'.[a-zA-Z]{2,}$/.test'

print('old_b:', old_b)
print('new_b:', new_b)
print()

for f in files:
    data = open(f, 'rb').read()
    count = data.count(old_b)
    name = os.path.basename(f)
    print(name + ': found ' + str(count) + ' occurrence(s)')
    if count > 0:
        updated = data.replace(old_b, new_b)
        open(f, 'wb').write(updated)
        verify = open(f, 'rb').read()
        print('  old removed: ' + str(old_b not in verify))
        print('  new present: ' + str(new_b in verify))
    print()

print('Done.')
