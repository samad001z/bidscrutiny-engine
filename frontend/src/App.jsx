import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EvaluationPage from "./pages/EvaluationPage";
import ComparisonPage from "./pages/ComparisonPage";
import TenderUploadPage from "./pages/TenderUploadPage";
import VendorUploadPage from "./pages/VendorUploadPage";
import TenderBidsPage from "./pages/TenderBidsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/evaluation/:vendorId" element={<EvaluationPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/upload-tender" element={<TenderUploadPage />} />
          <Route path="/upload-vendor" element={<VendorUploadPage />} />
          <Route path="/tender-bids" element={<TenderBidsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
