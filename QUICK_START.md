# 🚀 Quick Start Guide - PDF Generation

## ✅ What's Been Done

All PDF generation features have been implemented and are ready to use!

---

## ⚡ 3 Steps to Get Started

### Step 1: Install Dependencies

```bash
npm install pdfkit @types/pdfkit
```

**OR** (Windows users):

- Double-click `install-pdf-deps.bat`

---

### Step 2: Verify Environment Variable

Make sure `.env.local` file has the API URL:

```env
NEXT_PUBLIC_API_URL=https://api-gokandara.crewcrew.net/api
```

✅ **Note:** The API uses the authenticated user's token automatically (no extra token needed).

---

### Step 3: Start & Test

```bash
npm run dev
```

Then:

1. Go to **Transaksi** page
2. Find transaction with status **Approved**, **ITJ**, or **Akad**
3. Click **⋯** (actions dropdown)
4. Click **Download PDF** 📥
5. PDF downloads as `SPR-[number].pdf`

---

## 📋 Features Included

✅ Download PDF button (only for Approved/ITJ/Akad)  
✅ Professional RHUMA SPR document (2 pages)  
✅ Auto-populated buyer data  
✅ Auto-populated unit data  
✅ Dynamic payment schedule table  
✅ Auto-checked payment method  
✅ Complete terms & conditions  
✅ Signature section with sales names  
✅ Indonesian currency & date formatting

---

## 📁 Files Changed

### Modified

- `src/blocks/transaksi/index.tsx` - Added download button & handler

### Created

- `src/app/api/transaksi/[id]/generate-pdf/route.ts` - PDF generation API

---

## 🎯 Button Visibility

The **Download PDF** button appears ONLY when transaction status is:

- ✅ Approved
- ✅ ITJ (Ikatan Tanda Jadi)
- ✅ Akad

Hidden for: Pending, Negotiation, Rejected, Refund

---

## 🐛 Troubleshooting

**Button not showing?**
→ Check transaction status (must be Approved/ITJ/Akad)

**PDF not generating?**
→ Make sure you're logged in (check localStorage for auth-token)

**Missing data in PDF?**
→ Check backend API is running and returning all relations

---

## 📖 Full Documentation

For detailed documentation, see:

- **IMPLEMENTATION_SUMMARY.md** - Complete implementation details
- **PDF_GENERATION_SETUP.md** - Setup guide & troubleshooting

---

## ✨ That's It

You're ready to generate professional SPR documents! 🎉

**Need help?** Check the full documentation files or review the code comments.
