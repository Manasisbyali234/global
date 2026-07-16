c = open('backend/controllers/candidateController.js','rb').read().decode('utf-8')
idx = c.find('exports.changePassword')
snippet = c[idx:idx+700]
print(repr(snippet))

# Find the save() call inside changePassword and add passwordChangedAt before it
old = "    candidate.password = newPassword;\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password updated successfully' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.updatePasswordReset"
new = "    candidate.password = newPassword;\r\n    candidate.passwordChangedAt = new Date();\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password updated successfully' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.updatePasswordReset"

if old in c:
    c = c.replace(old, new, 1)
    print('patched OK')
    open('backend/controllers/candidateController.js','wb').write(c.encode('utf-8'))
else:
    print('NOT FOUND - showing area around changePassword:')
    print(repr(c[idx:idx+800]))
