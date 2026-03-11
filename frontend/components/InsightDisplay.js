import { useState } from 'react'
import { Download, Trash2, Loader } from 'lucide-react'
import { insights } from '../lib/api'

export default function InsightDisplay({ insight, onDelete, userId }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExport = async (format) => {
    try {
      setLoading(true)
      setError(null)

      const response = await insights.export(insight.id, format)
      
      // Create download link
      const element = document.createElement('a')
      if (format === 'json') {
        const dataStr = JSON.stringify(response.data.data, null, 2)
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr))
        element.setAttribute('download', `insights-${insight.id}.json`)
      } else if (format === 'csv') {
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(response.data.data))
        element.setAttribute('download', `insights-${insight.id}.csv`)
      }

      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (err) {
      setError('Failed to export insights')
      console.error('Export error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this insight?')) {
      return
    }

    try {
      setLoading(true)
      await insights.delete(insight.id, userId)
      onDelete?.(insight.id)
    } catch (err) {
      setError('Failed to delete insight')
      console.error('Delete error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
          <p className="text-sm text-gray-500">
            Generated on {new Date(insight.generated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            disabled={loading}
            className="btn-secondary btn-sm"
            title="Download as JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn-danger btn-sm"
            title="Delete insight"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="card-body space-y-6">
        {/* Summary */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
          <p className="text-gray-700">{insight.summary}</p>
        </div>

        {/* Key Findings */}
        {insight.key_findings && insight.key_findings.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
            <ul className="space-y-2">
              {insight.key_findings.map((finding, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span className="text-gray-700">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {insight.recommendations && insight.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {insight.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">→</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cost & Usage */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">API Tokens Used</p>
              <p className="text-xl font-bold text-gray-900">
                {insight.api_tokens_used}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Cost</p>
              <p className="text-xl font-bold text-gray-900">
                ${insight.api_cost.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer bg-gray-50 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          ID: <code className="text-xs bg-gray-200 px-2 py-1 rounded">{insight.id}</code>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            disabled={loading}
            className="btn-primary btn-sm"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export
          </button>
        </div>
      </div>
    </div>
  )
}
