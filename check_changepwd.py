c = open('backend/controllers/candidateController.js','rb').read().decode('utf-8')
idx = c.find('exports.changePassword')
print(repr(c[idx:idx+600]))
