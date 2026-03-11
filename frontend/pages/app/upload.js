import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Loader, AlertCircle } from 'lucide-react'
import FileUploader from '../../components/FileUploader'
import { supabase } from '../../lib/supabase'
import { uploads, insights } from '../../lib/api'

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userUploads, setUserUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)
      await loadUploads(user.id)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadUploads(userId) {
    try {
      const response = await uploads.list(userId)
      setUserUploads(response.data.uploads || [])
    } catch (error) {
      console.error('Load uploads error:', error)
    }
  }

  async function handleUploadSuccess(uploadData) {
    // Add new upload to list
    setUserUploads([uploadData, ...userUploads])
    
    // Auto-generate insights
    if (uploadData.id && user) {
      setProcessingId(uploadData.id)
      try {
        await insights.generate(uploadData.id, user.id)
        // Reload data
        await loadUploads(user.id)
      } catch (error) {
        console.error('Insight generation error:', error)
      } finally {
        setProcessingId(null)
      }
    }
  }

  async function handleDelete(uploadId) {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return
    }

    try {
      await uploads.delete(uploadId, user.id)
      setUserUploads(userUploads.filter(u => u.id !== uploadId))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Upload Data - Market Research</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Data</h1>
            <p className="text-gray-600">
              Upload a CSV file and get AI-powered insights within seconds
            </p>
          </div>

          {/* Upload Section */}
          <div className="card mb-12">
            <div className="card-body">
              <FileUploader 
                userId={user?.id}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
          </div>

          {/* Recent Uploads */}
          {userUploads.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Uploads</h2>
              
              <div className="grid gap-6">
                {userUploads.map((upload) => (
                  <div key={upload.id} className="card">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {upload.filename}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {upload.row_count} rows × {upload.columns?.length || 0} columns
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded on {new Date(upload.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {processingId === upload.id && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              <Loader className="w-4 h-4 animate-spin" />
                              Generating insights...
                            </span>
                          )}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            upload.status === 'completed'
                              ? 'bg-green-50 text-green-700'
                              : upload.status === 'processing'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}>
                            {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {upload.columns && upload.columns.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Columns:</p>
                          <div className="flex flex-wrap gap-2">
                            {upload.columns.slice(0, 5).map((col, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                                {col}
                              </span>
                            ))}
                            {upload.columns.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                                +{upload.columns.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/app/insights?upload=${upload.id}`)}
                          className="btn-primary btn-sm"
                        >
                          View Insights
                        </button>
                        <button
                          onClick={() => handleDelete(upload.id)}
                          className="btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userUploads.length === 0 && !processingId && (
            <div className="card">
              <div className="card-body text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No uploads yet. Start by uploading a CSV file above.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
