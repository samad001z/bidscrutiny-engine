# BidScrutiny Engine - Visual Component Guide

## 🎨 Component Showcase

### Common Components

#### Card
```jsx
<Card className="p-6">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```
**Use Cases**: All content containers, forms, data displays

---

#### Button
```jsx
// Primary - Main actions
<Button variant="primary">Submit</Button>

// Secondary - Alternative actions
<Button variant="secondary">Cancel</Button>

// Outline - Tertiary actions
<Button variant="outline">View Details</Button>

// Danger - Destructive actions
<Button variant="danger">Delete</Button>
```

---

#### Badge
```jsx
// Status indicators
<Badge variant="success">ELIGIBLE</Badge>
<Badge variant="warning">UNDER REVIEW</Badge>
<Badge variant="danger">NOT ELIGIBLE</Badge>
<Badge variant="info">PENDING</Badge>
<Badge variant="default">SUBMITTED</Badge>
```

---

#### Loader
```jsx
// Default
<Loader />

// With text
<Loader text="Loading vendor data..." />

// Different sizes
<Loader size="sm" />
<Loader size="lg" />
```

---

### Dashboard Components

#### StatCard
```jsx
<StatCard
  title="Total Vendors"
  value="15"
  subtitle="Submitted bids"
  icon={Users}
  trend={{ value: "+3 from last week", positive: true }}
/>
```
**Displays**: KPIs, metrics, statistics

---

### Evaluation Components

#### ScoreBar
```jsx
<ScoreBar 
  label="Eligibility Criteria"
  score={95}
  color="blue"
/>
```
**Colors**: blue, green, amber, red

---

#### RequirementMatch
```jsx
<RequirementMatch
  requirement="Valid GST Registration"
  provided="GST No: 29XXXXX (Valid till 2026)"
  status="met"
  evidence="Page 1 of submitted document"
/>
```
**Status**: met, partial, missing

---

#### RiskFlag
```jsx
<RiskFlag
  type="Document Verification"
  severity="high"
  reason="Signature mismatch detected"
  pageNumber="12"
  recommendation="Manual verification required"
/>
```
**Severity**: low, medium, high

---

### Upload Components

#### TenderUpload
```jsx
<TenderUpload
  onUpload={(formData) => handleUpload(formData)}
  isLoading={false}
/>
```
**Features**: 
- Tender name input
- Description textarea
- Drag-and-drop PDF upload
- File size validation

---

#### VendorUpload
```jsx
<VendorUpload
  tenderId="T001"
  tenderName="Supply of Office Equipment"
  onUpload={(formData) => handleUpload(formData)}
  isLoading={false}
/>
```
**Features**:
- Vendor name input
- Tender context display
- PDF upload with requirements
- Important notes section

---

## 📱 Page Layouts

### Login Page
```
┌─────────────────────────────────────┐
│         [Blue Accent Bar]           │
├─────────────────────────────────────┤
│                                     │
│         [Shield Icon]               │
│      BidScrutiny Engine            │
│  AI-Powered Tender Evaluation      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   SELECT USER ROLE          │   │
│  ├─────────────────────────────┤   │
│  │ [Government] | [Vendor]     │   │
│  │  Evaluator   |  Bidder      │   │
│  └─────────────────────────────┘   │
│                                     │
│      [Proceed to Authentication]   │
│                                     │
│   🔒 OFFICIAL SECURE SYSTEM        │
│   System usage is monitored...     │
└─────────────────────────────────────┘
```

---

### Government Dashboard
```
┌────────┬────────────────────────────────────┐
│        │  [Navbar with Role & Logout]       │
│        ├────────────────────────────────────┤
│ Sidebar│  Government Evaluator Dashboard    │
│        │                                     │
│ • Dash │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ • Upload│  │15  │ │12  │ │3   │ │86% │      │
│ • Compare│ │Vendors│Eligible│Flagged│Avg│   │
│        │  └────┘ └────┘ └────┘ └────┘      │
│        │                                     │
│        │  Compliance Summary                │
│        │  [Progress Bars: Eligibility, Tech,│
│        │   Financial]                       │
│        │                                     │
│        │  Vendor Comparison Table           │
│        │  ┌─────────────────────────────┐   │
│        │  │Name│Score│Docs│Risk│Status│   │
│        │  ├─────────────────────────────┤   │
│        │  │...vendor rows...            │   │
│        │  └─────────────────────────────┘   │
└────────┴────────────────────────────────────┘
```

---

### Vendor Dashboard
```
┌────────┬────────────────────────────────────┐
│        │  [Navbar with Role & Logout]       │
│        ├────────────────────────────────────┤
│ Sidebar│  Vendor Dashboard                  │
│        │                                     │
│ • Dash │  ┌────┐ ┌────┐ ┌────┐             │
│ • Submit│ │8   │ │2   │ │1   │             │
│        │  │Open│Submitted│Under Review│    │
│        │  └────┘ └────┘ └────┘             │
│        │                                     │
│        │  Available Tenders                 │
│        │  ┌─────────────────────────────┐   │
│        │  │Tender Name                  │   │
│        │  │Description                  │   │
│        │  │Deadline | [Submit Bid]     │   │
│        │  ├─────────────────────────────┤   │
│        │  │...more tenders...           │   │
│        │  └─────────────────────────────┘   │
│        │                                     │
│        │  My Submissions                    │
│        │  [Submitted bids with status]      │
└────────┴────────────────────────────────────┘
```

---

### Evaluation Detail Page
```
┌────────┬────────────────────────────────────┐
│        │  [← Back] Vendor Evaluation        │
│        │                      [Download PDF]│
│ Sidebar├────────────────────────────────────┤
│        │  Vendor Profile                    │
│        │  TechCorp Solutions | ELIGIBLE     │
│        │  Compliance Score: 92%             │
│        │                                     │
│        │  Compliance Breakdown              │
│        │  [Score bars: Eligibility, Tech,   │
│        │   Financial]                       │
│        │                                     │
│        │  🤖 AI Evaluation Summary          │
│        │  [Detailed AI explanation with     │
│        │   reasoning and evidence]          │
│        │                                     │
│        │  Requirements Matching             │
│        │  ✓ Met | ⚠ Partial | ✗ Missing    │
│        │                                     │
│        │  Fraud Detection                   │
│        │  [Alert cards with severity]       │
│        │                                     │
│        │  Document Checklist                │
│        │  [Grid of documents with status]   │
└────────┴────────────────────────────────────┘
```

---

### Comparison Page
```
┌────────┬────────────────────────────────────┐
│        │  Side-by-Side Vendor Comparison    │
│        │                     [Export Report]│
│ Sidebar├────────────────────────────────────┤
│        │                                     │
│        │  ┌────────┬────────┬────────┬──────┐
│        │  │Criteria│Vendor A│Vendor B│Vendor│
│        │  ├────────┼────────┼────────┼──────┤
│        │  │Overall │  92%   │  78%   │ 88% │
│        │  │        │ [Bar]  │ [Bar]  │[Bar]│
│        │  ├────────┼────────┼────────┼──────┤
│        │  │Eligib. │  95%   │  82%   │ 90% │
│        │  ├────────┼────────┼────────┼──────┤
│        │  │Risk    │ LOW    │ MED    │ LOW │
│        │  ├────────┼────────┼────────┼──────┤
│        │  │Missing │  0     │  2     │  1  │
│        │  ├────────┼────────┼────────┼──────┤
│        │  │Strengths│[List] │[List]  │[List]│
│        │  └────────┴────────┴────────┴──────┘
└────────┴────────────────────────────────────┘
```

---

### Upload Page
```
┌────────┬────────────────────────────────────┐
│        │  Upload New Tender                 │
│        │                                     │
│ Sidebar├────────────────────────────────────┤
│        │  ┌─────────────────────────────┐   │
│        │  │ Tender Name                 │   │
│        │  │ [Input field]               │   │
│        │  │                             │   │
│        │  │ Description                 │   │
│        │  │ [Textarea]                  │   │
│        │  │                             │   │
│        │  │ Tender Document (PDF)       │   │
│        │  │ ┌───────────────────────┐   │   │
│        │  │ │   📁 Drag & Drop      │   │   │
│        │  │ │   or browse files     │   │   │
│        │  │ │   PDF only, max 50MB  │   │   │
│        │  │ └───────────────────────┘   │   │
│        │  │                             │   │
│        │  │ [Upload] [Clear]            │   │
│        │  └─────────────────────────────┘   │
└────────┴────────────────────────────────────┘
```

---

## 🎨 Color Usage Guide

### Semantic Colors

**Primary (Blue)**
- Main actions (Submit, Proceed)
- Active navigation
- Primary brand color
- Links and highlights

**Success (Green)**
- Eligible status
- Completed states
- Positive metrics
- Checkmarks

**Warning (Amber)**
- Medium risk
- Pending states
- Caution alerts
- Partial completion

**Danger (Red)**
- Not eligible
- High risk
- Error states
- Missing items

**Info (Blue - Light)**
- Informational messages
- Help text
- Neutral status

**Neutral (Slate)**
- General UI elements
- Borders
- Text
- Backgrounds

---

## 📏 Spacing System

```
xs:  4px   (gap-1)
sm:  8px   (gap-2)
md:  16px  (gap-4)
lg:  24px  (gap-6)
xl:  32px  (gap-8)
2xl: 48px  (gap-12)
```

---

## 🔤 Typography Scale

```
xs:   12px  (text-xs)
sm:   14px  (text-sm)
base: 16px  (text-base)
lg:   18px  (text-lg)
xl:   20px  (text-xl)
2xl:  24px  (text-2xl)
3xl:  30px  (text-3xl)
```

---

## 🎯 Component Usage Matrix

| Component | Government | Vendor | Purpose |
|-----------|-----------|--------|---------|
| StatCard | ✅ | ✅ | KPIs |
| ScoreBar | ✅ | 🔒 | Compliance |
| RequirementMatch | ✅ | 🔒 | Requirements |
| RiskFlag | ✅ | 🔒 | Fraud alerts |
| TenderUpload | ✅ | ❌ | Upload tender |
| VendorUpload | ❌ | ✅ | Submit bid |

Legend:
- ✅ Full access
- 🔒 Read-only/Preview
- ❌ No access

---

This visual guide helps developers understand component usage patterns and maintain design consistency throughout the application.
