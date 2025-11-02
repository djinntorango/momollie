# Etsy Integration Setup Guide

## Overview
Your website now automatically syncs products from your Etsy shop and displays them on the /products page with no manual updates required!

## Architecture

### momongo (Backend)
1. **Scheduled Function** (`syncEtsyListingsScheduled`)
   - Runs daily at midnight
   - Fetches all active listings from Etsy
   - Stores them in Firestore: `users/{userId}/etsyListings/{listingId}`

2. **Public API** (`getPublicCatalog`)
   - CORS-restricted to momollie.me only
   - Returns product catalog from Firestore
   - No authentication required
   - 5-minute cache headers

3. **Frontend** (`EtsyListings.jsx`)
   - Now reads from Firestore with real-time updates
   - Shows "Last Synced" timestamp
   - No more manual API calls

### mommollie (Website)
1. **API Route** (`/api/products`)
   - Calls momongo's public API
   - Transforms Etsy data → Product interface
   - ISR with 5-minute revalidation

2. **Products Page** (`/products`)
   - Server Component (fast!)
   - Fetches from API route
   - Auto-updates every 5 minutes
   - Same beautiful UI

## Deployment Steps

### 1. Deploy momongo Functions
```bash
cd C:\Users\sspro\momongo\functions
firebase deploy --only functions:syncEtsyListingsScheduled,functions:getPublicCatalog
```

### 2. Initial Data Sync (One-Time)
Since the scheduled function runs daily, you may want to trigger it manually once to populate the data:

Go to Firebase Console → Functions → syncEtsyListingsScheduled → Test function

Or wait 24 hours for automatic first sync.

### 3. Configure mommollie Environment Variable
Create `.env.local` in mommollie root:
```
NEXT_PUBLIC_BASE_URL=https://momollie.me
```

For production deployment, add this to your hosting platform's environment variables.

### 4. Deploy mommollie
```bash
cd C:\Users\sspro\mommollie
npm run build
# Then deploy to your hosting platform
```

### 5. Update CORS Domains (Production Only)
Once deployed, if your domain is different, update the allowed origins in:
`functions/etsyFunctions.js` → `getPublicCatalog` → `allowedOrigins` array

## Testing

### Test momongo Functions
1. **Check Firestore Data:**
   - Firebase Console → Firestore
   - Navigate to: `users/yKCMKhC7BSXdep9wucPGJf9Qr0j2/etsyListings`
   - Should see your Etsy listings

2. **Test Public API:**
   ```bash
   curl -H "Origin: http://localhost:3000" https://us-central1-momongo-a83ea.cloudfunctions.net/getPublicCatalog
   ```

### Test mommollie
1. **Local Development:**
   ```bash
   cd C:\Users\sspro\mommollie
   npm run dev
   ```
   Visit: http://localhost:3000/products

2. **Check API Route:**
   Visit: http://localhost:3000/api/products
   Should return JSON with your products

## How It Works

```
┌─────────────────┐
│  Etsy Shop      │
│  (Source)       │
└────────┬────────┘
         │
         │ Daily Sync (Scheduled Function)
         ↓
┌─────────────────┐
│  Firestore      │
│  (Database)     │
└────────┬────────┘
         │
         │ Read (Public API with CORS)
         ↓
┌─────────────────┐
│  mommollie.me   │
│  (Website)      │
└─────────────────┘
```

## CORS Protection

The public API **only** accepts requests from:
- `https://momollie.me`
- `https://www.momollie.me`
- `http://localhost:3000` (dev)
- `http://localhost:3001` (dev)

Any other origin will receive a 403 error.

## Data Transformation

Etsy listings are automatically transformed:
- `listing_id` → `id`
- `title` → `name`
- `price.amount/divisor` → `price`
- `quantity > 0` → `inStock`
- `images[0]` → `image`
- `materials` → `materials` array
- Auto-generated: `features`, `careInstructions`

## Maintenance

### Add Custom Product Data
To add custom features, care instructions, or descriptions that aren't in Etsy:

1. Edit `mommollie/src/app/api/products/route.ts`
2. Update the `transformEtsyToProduct()` function
3. Add listing ID-based mappings for specific products

Example:
```typescript
// Add after line 20 in route.ts
const customData: Record<number, Partial<Product>> = {
  1234567890: {  // Your Etsy listing ID
    features: ['Custom feature 1', 'Custom feature 2'],
    careInstructions: ['Special care instruction']
  }
};
```

### Force Manual Sync
If you need to sync immediately (not wait 24 hours):
- Firebase Console → Functions → syncEtsyListingsScheduled → Test

### Change Sync Frequency
Edit `functions/etsyFunctions.js` line 1498:
```javascript
schedule: 'every 12 hours',  // or 'every 6 hours', etc.
```

## Troubleshooting

### Products not showing on website
1. Check Firestore has data
2. Check API route: `your-domain.com/api/products`
3. Check browser console for errors

### CORS errors
1. Verify origin in `allowedOrigins` array
2. Check browser console for exact error
3. Test with curl (shown above)

### Stale data
1. Check "Last Synced" timestamp in momongo app
2. Wait 5 minutes (ISR revalidation period)
3. Force browser refresh (Ctrl+Shift+R)

## Benefits

✅ Update products in Etsy only (single source of truth)
✅ Website auto-updates within 5 minutes
✅ No manual deployments needed
✅ Fast page loads (ISR + caching)
✅ CORS-protected API
✅ Real-time updates in momongo app
✅ Scales automatically

## Next Steps (Optional Enhancements)

1. **Add product enrichment mapping** for custom features
2. **Add category filtering** based on Etsy tags
3. **Add sale price support** (originalPrice field)
4. **Add manual sync button** on momongo app
5. **Add webhook** for instant Etsy updates (advanced)
