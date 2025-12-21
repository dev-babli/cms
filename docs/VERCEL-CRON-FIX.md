# Vercel Cron Job Fix

## Issue
Vercel Hobby plans only support **daily cron jobs** (once per day). The previous cron expression `0 * * * *` ran every hour, which exceeds the Hobby plan limit.

## Solution Applied

### Changed Cron Schedule
- **Before**: `0 * * * *` (every hour)
- **After**: `0 0 * * *` (once per day at midnight UTC)

### What This Means

✅ **Works on Hobby Plan**: The cron job now runs once per day, which is compatible with Vercel Hobby plans.

⚠️ **Scheduled Publishing**: Content scheduled for a specific time will be published when the daily cron runs (at midnight UTC). If you need more precise timing:

1. **Upgrade to Vercel Pro** - Allows hourly or more frequent cron jobs
2. **Use External Cron Service** - Services like:
   - [cron-job.org](https://cron-job.org) (free)
   - [EasyCron](https://www.easycron.com)
   - GitHub Actions (free for public repos)
   - [UptimeRobot](https://uptimerobot.com) (free tier available)

### Alternative: External Cron Service

If you need hourly checks, you can use an external cron service:

1. **Set up external cron** to call:
   ```
   https://your-cms.vercel.app/api/cron/publish-scheduled?secret=YOUR_CRON_SECRET
   ```

2. **Set CRON_SECRET** in Vercel environment variables

3. **Remove cron from vercel.json** (or keep it for daily backup)

### Current Configuration

The cron job in `vercel.json` is now set to:
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This runs **once per day at midnight UTC**.

### Testing

You can manually test the cron endpoint:
```bash
curl https://your-cms.vercel.app/api/cron/publish-scheduled?secret=YOUR_CRON_SECRET
```

Or in browser:
```
https://your-cms.vercel.app/api/cron/publish-scheduled?secret=YOUR_CRON_SECRET
```

### Upgrade to Pro Plan

If you need hourly or more frequent cron jobs:
1. Go to Vercel Dashboard → Settings → Billing
2. Upgrade to Pro plan ($20/month)
3. Update `vercel.json` to use hourly schedule: `"0 * * * *"`

---

## Summary

✅ **Fixed**: Changed cron schedule to daily (`0 0 * * *`)
✅ **Compatible**: Now works with Vercel Hobby plan
✅ **Functional**: Scheduled content will still be published, just checked once per day

The scheduled publishing feature will work, but content scheduled for specific times will be published when the daily cron runs (at midnight UTC).


