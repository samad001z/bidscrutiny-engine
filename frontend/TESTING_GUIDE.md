# BidScrutiny Engine - Testing Guide

## 🧪 Manual Testing Checklist

### Pre-Testing Setup
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Browser dev tools open
- [ ] Console clear of errors

---

## 👤 User Flow Testing

### 1. Login Flow ✓

**Steps:**
1. Open `http://localhost:5173`
2. Verify blue accent bar at top
3. Verify app title and description
4. Click "Government Evaluator" card
5. Verify card highlights (blue border, ring)
6. Click "Vendor" card
7. Verify card highlights
8. Click "Proceed" without selection
9. Verify button is disabled
10. Select a role and click "Proceed"
11. Verify redirect to `/dashboard`

**Expected Results:**
- ✅ Clean, professional login page
- ✅ Role selection visual feedback
- ✅ Disabled button when no role selected
- ✅ Successful navigation to dashboard

---

### 2. Government Dashboard ✓

**Steps:**
1. Login as Government Evaluator
2. Verify dashboard loads
3. Check KPI cards display correct values
4. Verify compliance summary progress bars
5. Check vendor comparison table
6. Click "View Details" on a vendor
7. Verify navigation to evaluation page
8. Return to dashboard
9. Navigate to "Comparison" in sidebar
10. Verify side-by-side view loads

**Expected Results:**
- ✅ All KPI cards visible with data
- ✅ Progress bars show percentages
- ✅ Table displays vendors correctly
- ✅ Navigation works smoothly
- ✅ No console errors

**Test Data Points:**
- Total Vendors count
- Eligible Vendors count
- Flagged Vendors count
- Average Compliance percentage
- Vendor names and scores in table

---

### 3. Vendor Dashboard ✓

**Steps:**
1. Logout (if logged in)
2. Login as Vendor
3. Verify vendor dashboard loads
4. Check quick stats cards
5. Verify available tenders list
6. Check submission tracking section
7. Click "Submit Bid" on a tender
8. Verify navigation to upload page

**Expected Results:**
- ✅ Different layout than government
- ✅ Stats cards show correct data
- ✅ Tenders list with deadlines
- ✅ Submission status visible
- ✅ CTA buttons functional

---

### 4. Evaluation Detail Page ✓

**Steps:**
1. Login as Government
2. Navigate to dashboard
3. Click "View Details" on any vendor
4. Verify vendor profile card
5. Check compliance breakdown bars
6. Read AI explanation section
7. Review requirements matching
8. Check fraud alerts (if any)
9. Verify document checklist
10. Click "Back" button
11. Verify return to dashboard

**Expected Results:**
- ✅ Complete vendor information
- ✅ Score bars animated
- ✅ AI explanation visible and readable
- ✅ Requirements show met/missing status
- ✅ Documents have checkmarks/alerts
- ✅ Page evidence links present
- ✅ Navigation works

---

### 5. Comparison Page ✓

**Steps:**
1. Navigate to "Comparison" in sidebar
2. Verify comparison grid loads
3. Check vendor columns
4. Verify score rows with bars
5. Check "HIGHEST" highlighting
6. Review fraud risk badges
7. Check missing documents count
8. Read key strengths/weaknesses
9. Click "View Details" on a vendor
10. Verify navigation to detail page

**Expected Results:**
- ✅ Grid layout with all vendors
- ✅ Scores displayed correctly
- ✅ Visual highlighting for best scores
- ✅ Color-coded risk levels
- ✅ Readable comparison data

---

### 6. Tender Upload (Government) ✓

**Steps:**
1. Login as Government
2. Navigate to "Upload Tender"
3. Verify empty form state
4. Type tender name
5. Enter description
6. Click "browse files" or drag PDF
7. Verify file appears in preview
8. Click "X" to remove file
9. Verify file removed
10. Re-upload file
11. Click "Upload Tender"
12. Verify loading state
13. Verify success message
14. Verify redirect to dashboard

**Expected Results:**
- ✅ Form fields functional
- ✅ Drag-and-drop works
- ✅ File preview shows name and size
- ✅ Remove file works
- ✅ Validation prevents empty submission
- ✅ Loading state visible
- ✅ Success feedback shown

---

### 7. Vendor Upload (Vendor) ✓

**Steps:**
1. Login as Vendor
2. Navigate to "Submit Bid"
3. Verify tender selection (if no tender passed)
4. Select a tender
5. Verify tender name displays
6. Enter vendor name
7. Upload bid PDF
8. Read important notes section
9. Click "Submit Bid"
10. Verify loading state
11. Verify success message
12. Verify redirect to dashboard

**Expected Results:**
- ✅ Tender selection works
- ✅ Vendor name input functional
- ✅ PDF upload works
- ✅ Important notes visible
- ✅ Validation works
- ✅ Submission successful
- ✅ Proper feedback

---

### 8. Navigation & Routing ✓

**Steps:**
1. Test all sidebar links
2. Verify active state highlighting
3. Test browser back button
4. Test browser forward button
5. Test direct URL access
6. Test protected routes without login
7. Verify redirect to login

**Expected Results:**
- ✅ All routes accessible
- ✅ Active states correct
- ✅ Browser navigation works
- ✅ Protected routes redirect
- ✅ URLs match pages

---

### 9. Navbar & Sidebar ✓

**Steps:**
1. Verify app title in navbar
2. Check role badge displays correctly
3. Test logout button
4. Verify logout redirects to login
5. Check sidebar icons visible
6. Verify navigation links
7. Test responsive hover states

**Expected Results:**
- ✅ Navbar displays all elements
- ✅ Role shows correctly
- ✅ Logout works
- ✅ Sidebar navigation functional
- ✅ Icons render properly

---

### 10. Logout Flow ✓

**Steps:**
1. Login as any role
2. Navigate to a few pages
3. Click "Logout" in navbar
4. Verify redirect to login page
5. Try to access `/dashboard` directly
6. Verify redirect to login
7. Login again
8. Verify fresh session

**Expected Results:**
- ✅ Logout clears auth state
- ✅ Redirects to login
- ✅ Protected routes blocked
- ✅ Can login again

---

## 🎨 Visual Testing

### Design Consistency
- [ ] Colors match government palette
- [ ] Typography is consistent
- [ ] Spacing is uniform
- [ ] Borders and shadows consistent
- [ ] Icons properly sized
- [ ] Buttons styled correctly
- [ ] Cards have proper padding
- [ ] Forms are aligned

### Responsive Design
- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)

### Accessibility
- [ ] Sufficient color contrast
- [ ] Readable font sizes
- [ ] Clickable areas large enough
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Alt text for icons (if needed)

---

## 🔍 Component Testing

### Card Component
```jsx
// Test renders
<Card>Content</Card>
<Card className="p-6">Padded</Card>

// Verify:
- ✅ White background
- ✅ Border visible
- ✅ Rounded corners
- ✅ Shadow present
```

### Button Component
```jsx
// Test all variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button disabled>Disabled</Button>

// Verify:
- ✅ Correct colors
- ✅ Hover states
- ✅ Disabled state
- ✅ Click handlers
```

### Badge Component
```jsx
// Test all variants
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>

// Verify:
- ✅ Correct colors
- ✅ Proper sizing
- ✅ Text readable
```

### Loader Component
```jsx
// Test variants
<Loader />
<Loader text="Loading..." />
<Loader size="lg" />

// Verify:
- ✅ Spinner animates
- ✅ Text displays
- ✅ Size changes
```

---

## 🐛 Error Testing

### API Errors
1. Stop backend server
2. Try loading dashboard
3. Verify mock data loads
4. Verify no crashes
5. Check console for error handling

### File Upload Errors
1. Try uploading non-PDF file
2. Try uploading file > 50MB
3. Try submitting without file
4. Verify validation messages

### Navigation Errors
1. Type invalid URL
2. Verify 404 handling or redirect
3. Try accessing government pages as vendor
4. Verify role-based access

---

## ⚡ Performance Testing

### Load Times
- [ ] Initial page load < 2s
- [ ] Dashboard load < 1s
- [ ] Detail page load < 1s
- [ ] File upload < 5s

### Interactions
- [ ] Button clicks respond instantly
- [ ] Navigation transitions smooth
- [ ] Form inputs have no lag
- [ ] Scroll performance smooth

---

## 📱 Cross-Browser Testing

### Chrome
- [ ] Latest version
- [ ] All features work
- [ ] No console errors

### Firefox
- [ ] Latest version
- [ ] All features work
- [ ] No console errors

### Safari
- [ ] Latest version
- [ ] All features work
- [ ] No console errors

### Edge
- [ ] Latest version
- [ ] All features work
- [ ] No console errors

---

## ✅ Acceptance Criteria

### Must Have
- ✅ Both roles functional
- ✅ All pages accessible
- ✅ File upload works
- ✅ Navigation works
- ✅ No critical bugs
- ✅ Professional appearance

### Should Have
- ✅ Fast load times
- ✅ Smooth animations
- ✅ Good error handling
- ✅ Responsive design
- ✅ Consistent styling

### Nice to Have
- 🎯 Advanced filtering
- 🎯 Data export
- 🎯 Print layouts
- 🎯 Keyboard shortcuts

---

## 🚀 Pre-Launch Checklist

- [ ] All user flows tested
- [ ] All components tested
- [ ] No console errors
- [ ] No visual bugs
- [ ] API integration verified
- [ ] Performance acceptable
- [ ] Cross-browser tested
- [ ] Mobile responsive
- [ ] Documentation complete
- [ ] Demo data prepared
- [ ] Backend integration verified

---

## 🐞 Bug Report Template

When you find a bug, use this template:

```
**Bug Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[If applicable]

**Environment**:
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Role: [Government / Vendor]

**Console Errors**:
[Copy any console errors]
```

---

## ✨ Testing Best Practices

1. **Always start fresh**: Clear cache, logout before testing
2. **Use real data**: Test with realistic file sizes and content
3. **Test edge cases**: Empty states, maximum values, etc.
4. **Document findings**: Keep notes of issues found
5. **Verify fixes**: Re-test after bug fixes
6. **Think like a user**: Don't just test happy paths

---

**Status**: Ready for systematic testing ✅

**Next Steps**:
1. Run through all test scenarios
2. Document any bugs found
3. Verify fixes
4. Get stakeholder approval
5. Prepare for launch

---

Good luck with testing! 🚀
