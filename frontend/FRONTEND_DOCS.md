# BidScrutiny Engine - Frontend

Production-grade government AI system for tender evaluation and vendor compliance.

## Tech Stack

- **React 19** with Hooks
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

## Project Structure

```
src/
├── assets/              # Static assets
├── components/
│   ├── common/          # Reusable UI components (Card, Button, Badge, Loader)
│   ├── dashboard/       # Dashboard-specific components (StatCard)
│   ├── evaluation/      # Evaluation components (ScoreBar, RequirementMatch, RiskFlag)
│   ├── upload/          # Upload components (TenderUpload, VendorUpload)
│   └── layout/          # Layout components (Navbar, Sidebar, Layout)
├── pages/
│   ├── dashboards/      # Role-specific dashboards
│   ├── Dashboard.jsx    # Dashboard router
│   ├── Login.jsx        # Login & role selection
│   ├── EvaluationPage.jsx   # Detailed vendor evaluation
│   ├── ComparisonPage.jsx   # Side-by-side comparison
│   ├── TenderUploadPage.jsx # Government tender upload
│   └── VendorUploadPage.jsx # Vendor bid submission
├── services/
│   └── api.js           # Axios API configuration
├── context/
│   └── AuthContext.jsx  # Authentication context
├── utils/
│   └── constants.js     # App constants
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## User Roles

### 1. Government Evaluator
- View all vendor submissions
- Access compliance dashboards
- See AI evaluation results
- View fraud detection alerts
- Compare vendors side-by-side
- Upload tender documents

### 2. Vendor (Bidder)
- View available tenders
- Submit bid documents
- Track submission status
- View compliance preview
- See missing document warnings

## Key Features

### Government Dashboard
- KPI cards (Total vendors, Compliant vendors, Flagged vendors, Avg compliance)
- Vendor comparison table with scores and status
- Compliance breakdown by category
- Direct access to detailed evaluations

### Vendor Dashboard
- Available tenders list
- Submission tracking
- Compliance preview
- Missing document alerts

### Evaluation Detail Page
- Comprehensive vendor profile
- AI explanation and reasoning
- Requirement matching with evidence
- Document checklist
- Fraud detection alerts
- Page-level evidence from PDFs

### Comparison Page
- Side-by-side vendor comparison
- Score visualization
- Highlighting best performers
- Key strengths and weaknesses

## Design Principles

- **Government-grade UI**: Professional, formal, restrained
- **Light theme**: White/slate/muted blue palette
- **High readability**: Clear typography and spacing
- **Desktop-first**: Optimized for government workstations
- **Accessibility**: Proper contrast ratios and semantic HTML
- **No flashy elements**: Minimal animations, professional aesthetic

## API Integration

All API calls go through `src/services/api.js`:

```javascript
// Base URL: http://localhost:8000
api.get("/compare-all")          // Get all vendors
api.get("/compare/:vendorId")    // Get vendor details
api.post("/upload-tender", data) // Upload tender
api.post("/upload-vendor", data) // Upload vendor bid
```

## Running the Application

### Development
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Key Components

### Common Components
- `Card`: Base card container
- `Button`: Styled button with variants (primary, secondary, outline, danger)
- `Badge`: Status badges (success, warning, danger, info)
- `Loader`: Loading spinner with text

### Evaluation Components
- `ScoreBar`: Progress bar with percentage
- `RequirementMatch`: Requirement vs provided comparison
- `RiskFlag`: Fraud and anomaly alert cards

### Upload Components
- `TenderUpload`: Drag-and-drop tender upload
- `VendorUpload`: Vendor bid submission form

## Color Palette

```
Primary Blue:    #1d4ed8 (blue-700)
Success Green:   #16a34a (green-600)
Warning Amber:   #f59e0b (amber-500)
Danger Red:      #dc2626 (red-600)
Slate:           #64748b (slate-600)
Background:      #f8fafc (slate-50)
Border:          #e2e8f0 (slate-200)
```

## Important Notes

- **No Backend Logic**: Frontend only consumes APIs
- **No Manual Overrides**: Displays AI decisions only
- **Role-Based Views**: Government and Vendor see different content
- **Vendor Privacy**: Vendors cannot see other vendors
- **Mock Data**: Fallback data for demo purposes
- **Production Ready**: Clean, maintainable, documented code

## Demo Flow

1. **Login**: Select role (Government/Vendor)
2. **Government**:
   - View dashboard with all vendors
   - Click vendor to see detailed evaluation
   - Go to Comparison page for side-by-side view
   - Upload new tenders
3. **Vendor**:
   - View available tenders
   - Submit bid for a tender
   - Track submission status
   - View compliance preview

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Proprietary - BidScrutiny Engine
