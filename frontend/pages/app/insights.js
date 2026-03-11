import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Loader, AlertCircle } from 'lucide-react'
import InsightDisplay from '../../components/InsightDisplay'
import { supabase } from '../../lib/supabase'
import { insights, uploads } from '../../lib/api'

export default function InsightsPage() {
  const router = useRouter()
  const { upload } = router.query
  
  const [user, setUser] = useState(null)
  const [pageInsights, setPageInsights] = useState([])
  const [userUploads, setUserUploads] = useState([])
  const [selectedUpload, setSelectedUpload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    if (upload && userUploads.length > 0) {
      setSelectedUpload(upload)
      loadInsights(upload)
    }
  }, [upload, userUploads])

  async function checkAuthAndLoadData() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)
      
      // Load all uploads
      const response = await uploads.list(user.id, 0, 100)
      setUserUploads(response.data.uploads || [])
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadInsights(uploadId) {
    if (!user || !uploadId) return
    
    try {
      setError(null)
      const response = await insights.getByUpload(uploadId, user.id)
      setPageInsights(response.data.insights || [])
    } catch (error) {
      console.error('Load insights error:', error)
      setError('Failed to load insights')
    }
  }

  async function handleGenerateInsights() {
    if (!user || !selectedUpload) return

    try {
      setGenerating(true)
      setError(null)

      const response = await insights.generate(selectedUpload, user.id)
      
      // Reload insights
      await loadInsights(selectedUpload)
    } catch (error) {
      console.error('Generate insights error:', error)
      setError(error.response?.data?.detail || 'Failed to generate insights')
    } finally {
      setGenerating(false)
    }
  }

  function handleDeleteInsight(insightId) {
    setPageInsights(pageInsights.filter(i => i.id !== insightId))
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
        <title>Insights - Market Research</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Insights</h1>
            <p className="text-gray-600">
              View and export insights from your uploaded data
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Selector */}
          <div className="card mb-8">
            <div className="card-body">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Upload
              </label>
              <select
                value={selectedUpload || ''}
                onChange={(e) => {
                  setSelectedUpload(e.target.value)
                  if (e.target.value) {
                    loadInsights(e.target.value)
                  }
                }}
                className="input-field"
              >
                <option value="">Choose an upload...</option>
                {userUploads.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.filename} ({u.row_count} rows)
                  </option>
                ))}
              </select

              {selectedUpload && (
                <button
                  onClick={handleGenerateInsights}
                  disabled={generating}
                  className="btn-primary mt-4"
                >
                  {generating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Generating Insights...
                    </>
                  ) : (
                    'Generate/Regenerate Insights'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Insights Display */}
          {selectedUpload && pageInsights.length > 0 ? (
            <div className="grid gap-6">
              {pageInsights.map((insight) => (
                <InsightDisplay
                  key={insight.id}
                  insight={insight}
                  userId={user?.id}
                  onDelete={handleDeleteInsight}
                />
              ))}
            </div>
          ) : selectedUpload ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No insights generated for this upload yet.
                </p>
                <button
                  onClick={handleGenerateInsights}
                  disabled={generating}
                  className="btn-primary"
                >
                  {generating ? 'Generating...' : 'Generate Insights Now'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select an upload to view its insights
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
