# Wishlist Undefined Error Fix

## Problem

```
TypeError: Cannot read properties of undefined (reading 'map')
at GET (src\app\api\wishlist\route.js:30:41)
```

This error occurred because existing users in the database don't have the `wishlist` field, since it was recently added to the User schema.

## Root Cause

- User documents created before the wishlist field was added to the schema don't have this field
- When accessing `user_doc.wishlist.map()`, `user_doc.wishlist` is `undefined`
- This causes a TypeError when trying to call `.map()` on undefined

## Solution Implemented

### 1. API Safety Checks

Added safety checks in all wishlist API endpoints:

```javascript
// Initialize wishlist if it doesn't exist (for existing users)
if (!user_doc.wishlist) {
  user_doc.wishlist = [];
  await user_doc.save(); // Save to persist the change
}
```

### 2. User Model Post-Init Hook

Added a post-init hook to the User schema:

```javascript
// Ensure wishlist field exists for existing users
userSchema.post("init", function () {
  if (!this.wishlist) {
    this.wishlist = [];
  }
});
```

### 3. Early Return for Empty Wishlist

Added optimization for empty wishlists:

```javascript
// If wishlist is empty, return empty array
if (productIds.length === 0) {
  return NextResponse.json({
    success: true,
    wishlist: [],
  });
}
```

### 4. Migration Script

Created optional migration script (`src/scripts/migrateWishlist.js`) to bulk update existing users.

## Files Modified

- `src/app/api/wishlist/route.js` - Added safety checks in GET, POST, DELETE methods
- `src/app/api/wishlist/clear/route.js` - Added safety check
- `src/models/UserModel.js` - Added post-init hook
- `src/scripts/migrateWishlist.js` - Created migration script

## Benefits

- ✅ No more TypeError crashes
- ✅ Graceful handling of existing users
- ✅ Automatic wishlist initialization
- ✅ Backward compatibility maintained
- ✅ Performance optimization for empty wishlists

## Testing Verification

To test the fix:

1. Access `/api/wishlist` while logged in as an existing user
2. Should return `{"success": true, "wishlist": []}` instead of crashing
3. User document should now have an empty wishlist array in the database

## Migration Note

The migration script can be run once to update all existing users:

```bash
node src/scripts/migrateWishlist.js
```

But it's not required since the API endpoints now handle missing wishlist fields automatically.
