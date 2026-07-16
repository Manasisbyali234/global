import re

def patch(filepath, replacements):
    c = open(filepath, 'rb').read().decode('utf-8')
    for old, new in replacements:
        if old in c:
            c = c.replace(old, new, 1)
            print(f'  OK: {old[:60]}...')
        else:
            print(f'  NOT FOUND: {old[:60]}...')
    open(filepath, 'wb').write(c.encode('utf-8'))

# ── candidateController.js ──────────────────────────────────────────
print('=== candidateController.js ===')
patch('backend/controllers/candidateController.js', [
    # changePassword
    (
        "    candidate.password = newPassword;\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password updated successfully' });\r\n  } catch (error) {\r\n    console.error('Login error:', error);\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.updatePasswordReset",
        "    candidate.password = newPassword;\r\n    candidate.passwordChangedAt = new Date();\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password updated successfully' });\r\n  } catch (error) {\r\n    console.error('Login error:', error);\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.updatePasswordReset"
    ),
    # updatePasswordReset
    (
        "    candidate.password = newPassword;\r\n    candidate.markModified('password');\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password updated successfully' });\r\n  } catch (error) {\r\n    console.error('Password reset error:', error);\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\n// OTP-based Password Reset",
        "    candidate.password = newPassword;\r\n    candidate.passwordChangedAt = new Date();\r\n    candidate.markModified('password');\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password updated successfully' });\r\n  } catch (error) {\r\n    console.error('Password reset error:', error);\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\n// OTP-based Password Reset"
    ),
    # verifyOTPAndResetPassword
    (
        "    candidate.password = newPassword;\r\n    candidate.resetPasswordOTP = undefined;\r\n    candidate.resetPasswordOTPExpires = undefined;\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password reset successful' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.verifyMobileOTP",
        "    candidate.password = newPassword;\r\n    candidate.passwordChangedAt = new Date();\r\n    candidate.resetPasswordOTP = undefined;\r\n    candidate.resetPasswordOTPExpires = undefined;\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password reset successful' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.verifyMobileOTP"
    ),
    # confirmResetPassword
    (
        "    candidate.password = newPassword;\r\n    candidate.resetPasswordToken = undefined;\r\n    candidate.resetPasswordExpires = undefined;\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password reset successful' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.changePassword",
        "    candidate.password = newPassword;\r\n    candidate.passwordChangedAt = new Date();\r\n    candidate.resetPasswordToken = undefined;\r\n    candidate.resetPasswordExpires = undefined;\r\n    await candidate.save();\r\n\r\n    res.json({ success: true, message: 'Password reset successful' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.changePassword"
    ),
])

# ── employerPasswordController.js ───────────────────────────────────
print('=== employerPasswordController.js ===')
patch('backend/controllers/employerPasswordController.js', [
    # confirmResetPassword
    (
        "    employer.password = newPassword;\r\n    employer.resetPasswordToken = undefined;\r\n    employer.resetPasswordExpires = undefined;\r\n    await employer.save();\r\n\r\n    res.json({ success: true, message: 'Password reset successful' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\n// OTP-based Password Reset",
        "    employer.password = newPassword;\r\n    employer.passwordChangedAt = new Date();\r\n    employer.resetPasswordToken = undefined;\r\n    employer.resetPasswordExpires = undefined;\r\n    await employer.save();\r\n\r\n    res.json({ success: true, message: 'Password reset successful' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\n// OTP-based Password Reset"
    ),
    # verifyOTPAndResetPassword
    (
        "    employer.password = newPassword;\r\n    employer.resetPasswordOTP = undefined;\r\n    employer.resetPasswordOTPExpires = undefined;\r\n    await employer.save();\r\n\r\n    res.json({ success: true, message: 'Password reset successful' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.checkEmail",
        "    employer.password = newPassword;\r\n    employer.passwordChangedAt = new Date();\r\n    employer.resetPasswordOTP = undefined;\r\n    employer.resetPasswordOTPExpires = undefined;\r\n    await employer.save();\r\n\r\n    res.json({ success: true, message: 'Password reset successful' });\r\n  } catch (error) {\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};\r\n\r\nexports.checkEmail"
    ),
    # updatePasswordReset
    (
        "    employer.password = newPassword;\r\n    employer.markModified('password');\r\n    await employer.save();\r\n\r\n    res.json({ success: true, message: 'Password updated successfully' });\r\n  } catch (error) {\r\n    console.error('Password reset error:', error);\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};",
        "    employer.password = newPassword;\r\n    employer.passwordChangedAt = new Date();\r\n    employer.markModified('password');\r\n    await employer.save();\r\n\r\n    res.json({ success: true, message: 'Password updated successfully' });\r\n  } catch (error) {\r\n    console.error('Password reset error:', error);\r\n    res.status(500).json({ success: false, message: error.message });\r\n  }\r\n};"
    ),
])

print('done')
