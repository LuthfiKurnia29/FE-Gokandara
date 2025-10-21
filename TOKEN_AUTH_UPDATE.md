# 🔐 Token Authentication Update

## Summary

The PDF generation API has been updated to use the authenticated user's token from the frontend instead of a server-side environment variable.

---

## ✅ What Changed

### 1. **Backend API Route** (`src/app/api/transaksi/[id]/generate-pdf/route.ts`)

**Before:**

```typescript
// Used environment variable
const token = process.env.API_TOKEN || '';
const transaksi = await fetchTransaksiData(id);
```

**After:**

```typescript
// Extracts token from request header
const authHeader = req.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '') || '';

if (!token) {
  return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
}

const transaksi = await fetchTransaksiData(id, token);
```

**Changes:**

- ✅ Extracts token from `Authorization` header
- ✅ Returns 401 if no token provided
- ✅ Passes token to `fetchTransaksiData()` function
- ✅ Fixed TypeScript errors (Buffer types)

---

### 2. **Frontend Handler** (`src/blocks/transaksi/index.tsx`)

**Before:**

```typescript
const response = await fetch(`/api/transaksi/${penjualan.id}/generate-pdf`);
```

**After:**

```typescript
// Get token from localStorage
const token = localStorage.getItem('auth-token');

if (!token) {
  toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
  return;
}

const response = await fetch(`/api/transaksi/${penjualan.id}/generate-pdf`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (!response.ok) {
  if (response.status === 401) {
    toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
    return;
  }
  throw new Error('Failed to generate PDF');
}
```

**Changes:**

- ✅ Gets token from localStorage (same as axios)
- ✅ Sends token in Authorization header
- ✅ Handles unauthorized (401) responses
- ✅ Shows user-friendly error messages

---

### 3. **Documentation Updates**

Updated files:

- ✅ `PDF_GENERATION_SETUP.md`
- ✅ `QUICK_START.md`
- ✅ `IMPLEMENTATION_SUMMARY.md`
- ✅ `install-pdf-deps.sh`
- ✅ `install-pdf-deps.bat`

**Key changes:**

- Removed references to `API_TOKEN` environment variable
- Updated troubleshooting guides
- Clarified authentication mechanism
- Updated security considerations

---

## 🎯 Benefits

### 1. **Better Security**

- ✅ Uses per-user authentication (not shared token)
- ✅ Same authentication as rest of the app (axios)
- ✅ User permissions enforced by backend
- ✅ Token never stored in server environment

### 2. **Simpler Setup**

- ✅ No need for separate `API_TOKEN` env variable
- ✅ Works automatically if user is logged in
- ✅ Consistent with existing auth flow

### 3. **Better UX**

- ✅ Clear error messages when not logged in
- ✅ Handles token expiration gracefully
- ✅ Prompts user to login again if needed

---

## 🔄 Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      User Login                               │
│                    (Auth System)                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
           ┌───────────────┐
           │ localStorage  │
           │ 'auth-token'  │
           └───────┬───────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    ┌─────────┐      ┌──────────────┐
    │  axios  │      │  PDF API     │
    │ (auto)  │      │  (manual)    │
    └─────────┘      └──────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ Authorization  │
                   │ Bearer {token} │
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────────┐
                   │ Backend API        │
                   │ Validates token    │
                   │ Returns data       │
                   └────────────────────┘
```

---

## 📋 Environment Variables

### Before:

```env
NEXT_PUBLIC_API_URL=https://api-gokandara.crewcrew.net/api
API_TOKEN=your_actual_api_token_here  # ← No longer needed!
```

### After:

```env
NEXT_PUBLIC_API_URL=https://api-gokandara.crewcrew.net/api
# That's it! No API_TOKEN needed.
```

---

## 🧪 Testing

### Test Scenarios:

1. **✅ Logged In User:**

   - User is logged in
   - Token exists in localStorage
   - PDF generates successfully
   - ✅ **Expected:** PDF downloads

2. **❌ Not Logged In:**

   - User not logged in
   - No token in localStorage
   - ❌ **Expected:** Error toast "Sesi Anda telah berakhir"

3. **❌ Expired Token:**

   - User has expired token
   - Backend returns 401
   - ❌ **Expected:** Error toast "Sesi Anda telah berakhir"

4. **❌ Invalid Transaction:**
   - Valid token
   - Transaction doesn't exist
   - ❌ **Expected:** 404 error handled

---

## 🔧 Migration Steps

If you're updating from the old version:

### Step 1: Update Code

```bash
git pull  # or apply the changes
```

### Step 2: Remove Old Environment Variable (Optional)

```bash
# Edit .env.local
# Remove or comment out: API_TOKEN=...
```

### Step 3: Test

```bash
npm run dev
# 1. Login to the application
# 2. Navigate to Transaksi page
# 3. Find Approved/ITJ/Akad transaction
# 4. Click Download PDF
# 5. Verify PDF downloads successfully
```

---

## 🐛 Troubleshooting

### Error: "Sesi Anda telah berakhir"

**Cause:** No auth token or expired token

**Solution:**

1. Check if logged in
2. Check localStorage: `localStorage.getItem('auth-token')`
3. If null or expired, login again

---

### Error: "Unauthorized - No token provided"

**Cause:** Token not sent in request header

**Solution:**

1. Check browser console for errors
2. Verify token exists: `localStorage.getItem('auth-token')`
3. Clear cache and reload

---

### Error: "Failed to fetch transaksi data"

**Cause:** Backend API issue or invalid token

**Solution:**

1. Check backend API is running
2. Verify token is valid
3. Check API URL in environment variables
4. Look at server logs for details

---

## 📝 Code Reference

### How to Access User Token

**In Frontend (Client-side):**

```typescript
const token = localStorage.getItem('auth-token');
```

**In API Route (Server-side):**

```typescript
const authHeader = req.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '') || '';
```

**In Axios Requests (Automatic):**

```typescript
// axios.ts handles this automatically via interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

---

## ✨ Best Practices

1. **Always Check for Token:**

   ```typescript
   if (!token) {
     toast.error('Please login first');
     return;
   }
   ```

2. **Handle 401 Responses:**

   ```typescript
   if (response.status === 401) {
     toast.error('Session expired. Please login again.');
     // Optionally: redirect to login
     return;
   }
   ```

3. **Consistent Error Messages:**

   - Use Indonesian for user-facing messages
   - Use clear, actionable error messages
   - Guide user to solution

4. **Security:**
   - Never log tokens to console
   - Never expose tokens in client-side code
   - Always use HTTPS in production

---

## 📊 Comparison

| Feature            | Old (ENV Variable)    | New (Request Header)   |
| ------------------ | --------------------- | ---------------------- |
| **Setup**          | Need to add API_TOKEN | Works automatically    |
| **Security**       | Shared token for all  | Per-user token         |
| **Permissions**    | Fixed permissions     | User's permissions     |
| **Maintenance**    | Manual token updates  | Auto via login         |
| **Error Handling** | Generic errors        | User-friendly messages |
| **Consistency**    | Different from axios  | Same as axios          |

---

## 🎉 Summary

The PDF generation API now uses the same authentication mechanism as the rest of your application (axios). This provides:

- ✅ Better security (per-user authentication)
- ✅ Simpler setup (no extra env variable)
- ✅ Better error handling (user-friendly messages)
- ✅ Consistent authentication across the app
- ✅ Automatic token management via login system

**No breaking changes for end users** - PDF generation works exactly the same from their perspective!

---

**Updated:** October 21, 2025  
**Status:** ✅ Complete and Tested
