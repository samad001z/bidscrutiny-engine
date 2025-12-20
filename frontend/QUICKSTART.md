# BidScrutiny Engine - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

## 👥 Testing User Flows

### Government Evaluator Flow

1. **Login**
   - Open `http://localhost:5173`
   - Select "Government Evaluator"
   - Click "Proceed to Authentication"

2. **Dashboard**
   - View KPI cards (Total vendors, Compliant, Flagged, Avg score)
   - See vendor comparison table
   - Click "View Details" on any vendor

3. **Evaluation Detail**
   - See comprehensive vendor profile
   - Review AI explanation
   - Check requirement matching
   - View fraud alerts
   - See document checklist

4. **Comparison**
   - Navigate to "Comparison" in sidebar
   - View side-by-side vendor comparison
   - Compare scores across categories

5. **Upload Tender**
   - Navigate to "Upload Tender"
   - Fill in tender details
   - Drag-and-drop PDF file
   - Submit

### Vendor Flow

1. **Login**
   - Open `http://localhost:5173`
   - Select "Vendor"
   - Click "Proceed to Authentication"

2. **Dashboard**
   - View available tenders
   - See submission status
   - Check compliance preview

3. **Submit Bid**
   - Click "Submit Bid" on a tender
   - OR navigate to "Submit Bid" in sidebar
   - Enter vendor name
   - Upload bid PDF
   - Submit

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI (Card, Button, Badge, Loader)
│   ├── dashboard/       # Dashboard widgets (StatCard)
│   ├── evaluation/      # Evaluation UI (ScoreBar, RequirementMatch, RiskFlag)
│   ├── upload/          # File upload (TenderUpload, VendorUpload)
│   └── layout/          # App layout (Navbar, Sidebar, Layout)
│
├── pages/
│   ├── dashboards/      # Role-specific dashboards
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── EvaluationPage.jsx
│   ├── ComparisonPage.jsx
│   ├── TenderUploadPage.jsx
│   └── VendorUploadPage.jsx
│
├── services/
│   └── api.js          # Axios config & API calls
│
├── context/
│   └── AuthContext.jsx # Auth state management
│
├── utils/
│   └── constants.js    # App constants
│
└── App.jsx             # Main app & routing
```

## 🎨 Design System

### Colors
```javascript
Primary:   bg-blue-700   text-blue-700   // Main actions
Success:   bg-green-600  text-green-600  // Positive states
Warning:   bg-amber-500  text-amber-500  // Cautions
Danger:    bg-red-600    text-red-600    // Errors/alerts
Neutral:   bg-slate-X    text-slate-X    // General UI
```

### Components

**Button**
```jsx
<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline">View</Button>
<Button variant="danger">Delete</Button>
```

**Badge**
```jsx
<Badge variant="success">ELIGIBLE</Badge>
<Badge variant="warning">PENDING</Badge>
<Badge variant="danger">REJECTED</Badge>
```

**Card**
```jsx
<Card className="p-6">
  {/* Content */}
</Card>
```

**Loader**
```jsx
<Loader text="Loading data..." />
<Loader size="lg" />
```

## 🔌 API Integration

### Configuration
Edit `src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: "http://localhost:8000",
});
```

### API Calls
```javascript
// Get all vendors
const response = await api.get("/compare-all");

// Get vendor details
const vendor = await api.get(`/compare/${vendorId}`);

// Upload tender
const formData = new FormData();
formData.append("file", file);
await api.post("/upload-tender", formData);

// Upload vendor bid
await api.post("/upload-vendor", formData);
```

## 🧪 Mock Data

The app includes fallback mock data for demo purposes. When backend is unavailable, components automatically use mock data.

**Location**: Directly in components (see `getMockData()` functions)

## 🛠️ Common Tasks

### Adding a New Page
1. Create file in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`:
```jsx
<Route path="/new-page" element={<NewPage />} />
```
3. Add navigation link in `src/components/layout/Sidebar.jsx`

### Adding a New Component
1. Create file in appropriate folder:
   - `components/common/` for reusable UI
   - `components/dashboard/` for dashboard widgets
   - `components/evaluation/` for evaluation UI
2. Import and use in pages

### Customizing Styles
1. Global styles: `src/index.css`
2. Component styles: Use Tailwind classes
3. Custom utilities: Add to `tailwind.config.js`

## 🐛 Troubleshooting

### API Errors
- Check backend is running on port 8000
- Verify CORS is enabled on backend
- Check browser console for errors

### Routing Issues
- Ensure React Router is configured
- Check path matches in App.jsx
- Verify navigation links

### Build Errors
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install

# Rebuild
npm run build
```

## 📦 Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Output folder
# dist/
```

## 🚢 Deployment

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/bidscrutiny/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

## 🆘 Support

For help:
1. Check `FRONTEND_DOCS.md` for detailed documentation
2. Review `DEPLOYMENT_CHECKLIST.md` for deployment steps
3. Check backend API documentation

---

**Happy Coding! 🎉**
