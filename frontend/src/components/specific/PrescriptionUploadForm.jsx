// src/components/specific/PrescriptionUploadForm.jsx

import React, { useState } from 'react';
import Button from '../common/Button';

const PrescriptionUploadForm = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFile) {
      setIsUploading(true);
      // onUpload prop will handle the actual API call
      onUpload(selectedFile).finally(() => setIsUploading(false));
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
      <form onSubmit={handleSubmit}>
        <label htmlFor="prescription-upload" className="cursor-pointer">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Upload a prescription
          </span>
          <span className="block text-xs text-gray-500">PNG, JPG, PDF up to 5MB</span>
        </label>
        <input
          id="prescription-upload"
          name="prescription-upload"
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
        />

        {selectedFile && (
          <p className="mt-4 text-sm text-gray-600">
            Selected file: <strong>{selectedFile.name}</strong>
          </p>
        )}

        <div className="mt-6">
          <Button type="submit" disabled={!selectedFile || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload & Proceed'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionUploadForm;