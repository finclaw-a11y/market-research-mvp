import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import { uploads } from '../lib/api'

export default function FileUploader({ userId, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile) => {
    setError(null)
    setSuccess(null)

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File is too large. Maximum size is 50MB')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || !userId) return

    try {
      setLoading(true)
      setError(null)

      const response = await uploads.uploadCSV(userId, file)

      setSuccess(`File "${file.name}" uploaded successfully!`)
      setFile(null)

      if (onUploadSuccess) {
        onUploadSuccess(response.data)
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        {!file ? (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Drop your CSV file here</h3>
            <p className="text-gray-600 mb-4">or click to browse your computer</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Uploading...' : 'Select File'}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Accepted format: CSV (max 50MB)
            </p>
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded p-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="btn-primary mr-2"
            >
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
            <button
              onClick={handleRemoveFile}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
