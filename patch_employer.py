content = open('backend/controllers/employerController.js', 'rb').read().decode('utf-8')

# 1. Add import after normalizeTimeFormat line
old_import = "const { normalizeTimeFormat, formatTimeToAMPM } = require('../utils/timeUtils');\r\n"
new_import = "const { normalizeTimeFormat, formatTimeToAMPM } = require('../utils/timeUtils');\r\nconst { recordFailedAttempt: recordEmpAttempt, checkLockout: checkEmpLockout, clearAttempts: clearEmpAttempts } = require('../utils/loginRateLimiter');\r\n"

if old_import in content:
    content = content.replace(old_import, new_import, 1)
    print('import OK')
else:
    print('import NOT FOUND')

# 2. Replace loginEmployer
old_login = (
    "exports.loginEmployer = async (req, res) => {\r\n"
    "  try {\r\n"
    "    const { email, password } = req.body;\r\n"
    "    \r\n"
    "    // Validate input\r\n"
    "    if (!email || !password) {\r\n"
    "      return res.status(400).json({ success: false, message: 'Email and password are required' });\r\n"
    "    }\r\n"
    "    \r\n"
    "    // Removed console debug line for security\r\n"
    "\r\n"
    "    const employer = await Employer.findByEmail(email.trim());\r\n"
    "    if (!employer) {\r\n"
    "      return res.status(401).json({ success: false, message: 'no account found with this email address' });\r\n"
    "    }\r\n"
    "\r\n"
    "    const isPasswordValid = await employer.comparePassword(password);\r\n"
    "    \r\n"
    "    if (!isPasswordValid) {\r\n"
    "      return res.status(401).json({ success: false, message: 'Invalid password' });\r\n"
    "    }\r\n"
    "\r\n"
    "    if (employer.status !== 'active') {\r\n"
    "      // Removed console debug line for security;\r\n"
    "      return res.status(401).json({ success: false, message: 'Account is inactive' });\r\n"
    "    }\r\n"
    "\r\n"
    "    const token = generateToken(employer._id, 'employer');\r\n"
    "    // Removed console debug line for security;"
)

new_login = (
    "exports.loginEmployer = async (req, res) => {\r\n"
    "  try {\r\n"
    "    const { email, password } = req.body;\r\n"
    "    \r\n"
    "    if (!email || !password) {\r\n"
    "      return res.status(400).json({ success: false, message: 'Email and password are required' });\r\n"
    "    }\r\n"
    "\r\n"
    "    const lockout = checkEmpLockout('employer', email);\r\n"
    "    if (lockout.locked) {\r\n"
    "      return res.status(429).json({ success: false, message: `Too many failed attempts. Please try again in ${lockout.secondsRemaining} seconds.`, secondsRemaining: lockout.secondsRemaining });\r\n"
    "    }\r\n"
    "\r\n"
    "    const employer = await Employer.findByEmail(email.trim());\r\n"
    "    if (!employer) {\r\n"
    "      const result = recordEmpAttempt('employer', email);\r\n"
    "      return res.status(401).json({ success: false, message: 'no account found with this email address', ...(result.locked ? { secondsRemaining: result.secondsRemaining } : {}) });\r\n"
    "    }\r\n"
    "\r\n"
    "    const isPasswordValid = await employer.comparePassword(password);\r\n"
    "    \r\n"
    "    if (!isPasswordValid) {\r\n"
    "      const result = recordEmpAttempt('employer', email);\r\n"
    "      return res.status(401).json({ success: false, message: 'Invalid password', ...(result.locked ? { secondsRemaining: result.secondsRemaining } : { attemptsLeft: result.attemptsLeft }) });\r\n"
    "    }\r\n"
    "\r\n"
    "    if (employer.status !== 'active') {\r\n"
    "      return res.status(401).json({ success: false, message: 'Account is inactive' });\r\n"
    "    }\r\n"
    "\r\n"
    "    clearEmpAttempts('employer', email);\r\n"
    "    const token = generateToken(employer._id, 'employer');"
)

if old_login in content:
    content = content.replace(old_login, new_login, 1)
    print('loginEmployer OK')
else:
    print('loginEmployer NOT FOUND')

open('backend/controllers/employerController.js', 'wb').write(content.encode('utf-8'))
print('saved')
