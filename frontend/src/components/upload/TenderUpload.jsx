import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";

export default function TenderUpload({ onUpload, isLoading }) {
  const [tenderName, setTenderName] = useState("");
  const [description, setDescription] = useState("");
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
    if (tenderName && description && selectedFile && onUpload) {
      const formData = new FormData();
      formData.append("name", tenderName);
      formData.append("description", description);
      formData.append("file", selectedFile);
      onUpload(formData);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tender Name *
          </label>
          <input
            type="text"
            value={tenderName}
            onChange={(e) => setTenderName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Supply of Office Equipment 2025"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Brief description of tender requirements..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tender Document (PDF) *
          </label>
          
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

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={!tenderName || !description || !selectedFile || isLoading}
          >
            {isLoading ? "Uploading..." : "Upload Tender"}
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => {
              setTenderName("");
              setDescription("");
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
