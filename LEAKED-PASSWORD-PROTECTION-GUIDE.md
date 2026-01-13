# Leaked Password Protection Implementation Guide

## ⚠️ Important: Plan Requirement

**Leaked password protection is only available on Supabase Pro plan and above.**

If you're on the Free tier, this feature is not available. However, your application already has strong password policies in place (12+ characters, complexity requirements), which provides good security.

## Overview

This guide helps you enable and implement leaked password protection in Supabase Auth, which checks passwords against the HaveIBeenPwned database to prevent users from using compromised passwords.

**Note**: The code implementation is complete and ready. If you upgrade to Pro plan, you can enable this feature immediately.

## Step 1: Enable in Supabase Dashboard

### ⚠️ Plan Requirement
**This feature requires Supabase Pro plan ($25/month) or higher.**

If you're on the Free tier:
- This feature is not available
- Your existing password policy (12+ chars, complexity) still provides good security
- Consider upgrading if you need this additional protection

### Quick Steps (Pro Plan Only)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Settings** (or **Policies**)
4. Scroll to **Password Security** section
5. Toggle **"Leaked password protection"** or **"Check passwords against HaveIBeenPwned"** to **Enabled**
6. Click **Save**

### If Feature Not Visible
If you don't see the "Leaked password protection" option:
- You're likely on the Free tier
- This feature requires Pro plan
- The code is ready - it will work automatically when you upgrade

### Detailed Path
```
Dashboard → Your Project → Authentication → Settings → Password Security
```

### What This Does
- Checks all new sign-ups against HaveIBeenPwned database
- Checks password changes/resets against breach database
- Blocks passwords that appear in known data breaches
- Improves security posture with minimal user friction

## Step 2: Update Error Handling (Code Changes)

The code has been updated to handle leaked password errors gracefully. The following files have been modified:

### Files Updated
- `cms/app/api/auth/register/route.ts` - Registration error handling
- `cms/app/api/auth/reset-password/route.ts` - Password reset error handling
- `cms/app/auth/register/page.tsx` - Frontend error display

### Error Messages
When a leaked password is detected, users will see:
- **Registration**: "This password was found in previous data breaches. Please choose a different, stronger password."
- **Password Reset**: "This password was found in previous data breaches. Please choose a different, stronger password."

## Step 3: User Communication (UX)

### Error Message Display
The application now shows clear, helpful error messages when a leaked password is detected:

```
This password was found in previous data breaches — please choose a different password.

Tips for creating a strong password:
• Use at least 12 characters
• Include uppercase and lowercase letters
• Include numbers and special characters
• Consider using a passphrase or password manager
```

### Password Strength Indicator
The registration form includes a password strength indicator that helps users create secure passwords before submission.

## Step 4: Password Policy Enforcement

### Current Policy (Already Implemented)
Your application already enforces a strong password policy:

- ✅ Minimum 12 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ✅ At least one special character

### Location
- Backend validation: `cms/app/api/auth/register/route.ts` (RegisterSchema)
- Backend validation: `cms/app/api/auth/reset-password/route.ts` (ResetPasswordSchema)

## Step 5: Testing

### Test Scenarios

#### 1. Test with Known Breached Password
Try registering with a password known to be in breaches (e.g., "Password123!"):
- Should be rejected with clear error message
- Error should explain the issue and provide guidance

#### 2. Test with Strong Unique Password
Try registering with a strong, unique password:
- Should succeed normally
- No errors related to leaked passwords

#### 3. Test Password Reset
Try resetting password with a breached password:
- Should be rejected with clear error message
- User should be able to try again with a different password

### Test Commands
```bash
# Test registration with breached password (should fail)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User"
  }'

# Test registration with strong password (should succeed)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "MyStr0ng!Unique#Pass2024",
    "name": "Test User 2"
  }'
```

## Step 6: Monitoring

### What to Monitor

1. **Failed Registration Attempts**
   - Check Supabase Dashboard → Authentication → Logs
   - Look for "leaked password" or "breach" errors
   - Monitor for patterns or abuse

2. **User Support Tickets**
   - Users may contact support if they don't understand the error
   - Ensure support team knows about the feature
   - Provide clear guidance in support documentation

3. **Success Rate**
   - Monitor registration success rate
   - Should remain high (most users choose unique passwords)
   - If success rate drops significantly, review error messages

### Supabase Dashboard Monitoring
```
Dashboard → Authentication → Logs
```

Filter for:
- Event type: "signup" or "password_reset"
- Error messages containing "breach" or "leaked"

## Step 7: Service Role Considerations

### Internal Operations
If you have automated processes that create users with the service role:

1. **Use Generated Strong Passwords**
   - Generate random, strong passwords for service accounts
   - Use password managers or secure random generators
   - Ensure passwords meet complexity requirements

2. **Audit and Logging**
   - Log all service role user creation
   - Document justification for any bypasses
   - Review regularly for compliance

3. **Best Practice**
   - Prefer updating internal flows to comply with protection
   - Avoid bypassing security features unless absolutely necessary

## Implementation Checklist

- [ ] Enable leaked password protection in Supabase Dashboard
- [ ] Test registration with breached password (should fail)
- [ ] Test registration with strong password (should succeed)
- [ ] Test password reset with breached password (should fail)
- [ ] Verify error messages are user-friendly
- [ ] Review any service role user creation processes
- [ ] Update support documentation
- [ ] Monitor authentication logs for issues
- [ ] Communicate feature to team/stakeholders

## Error Handling Details

### Supabase Error Codes
When leaked password protection is enabled, Supabase may return errors like:
- `"Password found in data breach"`
- `"Password has been leaked"`
- `"Password appears in HaveIBeenPwned database"`

### Code Implementation
The error handling code checks for these patterns:
```typescript
if (authError.message.toLowerCase().includes('breach') || 
    authError.message.toLowerCase().includes('leaked') ||
    authError.message.toLowerCase().includes('pwned')) {
  // Show user-friendly leaked password error
}
```

## Progressive Rollout (Optional)

If you're concerned about user friction, you can:

1. **Enable for New Sign-ups First**
   - Enable protection immediately
   - Monitor registration success rate
   - Adjust messaging if needed

2. **Gradually Enforce on Password Resets**
   - Enable for password resets after monitoring sign-ups
   - Ensure users understand the requirement

3. **Clear Communication**
   - Add notice on registration page
   - Update password reset emails
   - Include in user documentation

## Support and Troubleshooting

### Common Issues

#### Issue: Users can't register with "strong" passwords
**Solution**: Check if password actually meets all requirements (12+ chars, uppercase, lowercase, number, special char)

#### Issue: Error messages not showing
**Solution**: Verify error handling code is deployed and check browser console for errors

#### Issue: Too many false positives
**Solution**: This is unlikely - HaveIBeenPwned is very accurate. Verify the password is actually in breaches.

### Getting Help
- Supabase Docs: [Password Security](https://supabase.com/docs/guides/auth/password-security)
- HaveIBeenPwned: [API Documentation](https://haveibeenpwned.com/API/v3)
- Support: Check Supabase Dashboard → Support

## Related Files

- `cms/app/api/auth/register/route.ts` - Registration API with error handling
- `cms/app/api/auth/reset-password/route.ts` - Password reset API with error handling
- `cms/app/auth/register/page.tsx` - Registration form UI
- `cms/app/auth/reset-password/page.tsx` - Password reset form UI

## Security Benefits

✅ **Reduces Credential Stuffing Attacks**
- Users can't reuse compromised passwords
- Forces unique password creation

✅ **Improves Compliance**
- Meets security best practices
- Demonstrates proactive security measures

✅ **Minimal User Friction**
- Most users already choose unique passwords
- Clear error messages guide users
- Password strength indicator helps prevent issues

---

**Status**: ✅ Ready to implement
**Time Required**: ~10 minutes (Dashboard) + Code already updated
**Risk Level**: Low (adds security, minimal disruption)

