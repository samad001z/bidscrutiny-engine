import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EvaluationPage from "./pages/EvaluationPage";
import ComparisonPage from "./pages/ComparisonPage";
import TenderUploadPage from "./pages/TenderUploadPage";
import VendorUploadPage from "./pages/VendorUploadPage";
import TenderBidsPage from "./pages/TenderBidsPage";
import AuditTrail from "./AuditTrail";

export default function App() {
  return (
    <BrowserRouter>
      {/* 🔔 Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "14px",
          },
        }}
      />

      <Routes>
        {/* 🔐 Public Route */}
        <Route path="/" element={<Login />} />

        {/* 🏛️ Protected App Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/evaluation/:vendorId" element={<EvaluationPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/upload-tender" element={<TenderUploadPage />} />
          <Route path="/upload-vendor" element={<VendorUploadPage />} />
          <Route path="/tender-bids" element={<TenderBidsPage />} />
          <Route path="/audit" element={<AuditTrail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
