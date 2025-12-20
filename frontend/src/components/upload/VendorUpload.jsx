import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";

export default function VendorUpload({ tenderId, tenderName, onUpload, isLoading }) {
  const [vendorName, setVendorName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (vendorName && selectedFile && onUpload) {
      const formData = new FormData();
      formData.append("vendor_name", vendorName);
      formData.append("tender_id", tenderId);
      formData.append("file", selectedFile);
      onUpload(formData);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="p-6">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
          Submitting for
        </p>
        <p className="text-lg font-semibold text-slate-900">
          {tenderName || "Select a tender first"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Vendor/Company Name *
          </label>
          <input
            type="text"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., ABC Technologies Pvt Ltd"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Bid Document (PDF) *
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Upload a single PDF containing all required documents: GST Certificate, PAN Card, 
            Financial Statements, Technical & Commercial Proposals, etc.
          </p>
          
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                dragActive 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-slate-300 bg-slate-50"
              }`}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-2">
                Drag and drop your PDF file here, or
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-700 font-medium hover:underline">
                  browse files
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-500 mt-2">
                PDF only, max 50MB
              </p>
            </div>
          ) : (
            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-700" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-900 mb-2">
            Important Notes:
          </p>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Ensure all pages are clearly scanned</li>
            <li>Documents must be valid and not expired</li>
            <li>AI will extract and verify all requirements</li>
            <li>Submission is final and cannot be edited</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={!vendorName || !selectedFile || !tenderId || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Bid"}
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => {
              setVendorName("");
              setSelectedFile(null);
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
}
