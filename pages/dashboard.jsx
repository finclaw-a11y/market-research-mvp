import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize Supabase and check auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        setSupabase(supabaseClient);

        // Check if user is logged in
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
        } else {
          // Redirect to login if not authenticated
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth error:', err);
        router.push('/login');
      }
    };

    initAuth();
  }, [router]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Read file
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        setError('CSV file must have at least a header row and one data row');
        setLoading(false);
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i]?.trim() || '';
        });
        return row;
      });

      // Send to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          data: data,
          headers: headers,
          filename: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.insights) {
        setInsights(result.insights);
        setSuccess('Insights generated successfully!');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csvFile');
        if (fileInput) fileInput.value = '';
      } else {
        setError('Failed to generate insights');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.message || 'Failed to process CSV. Please check the file format and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F1A1F' }}>
      {/* Header */}
      <header className="shadow-lg" style={{ backgroundColor: '#1A2A35', borderBottom: '2px solid #00D9FF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold" style={{ color: '#00D9FF' }}>Vervix Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white rounded-lg font-semibold transition"
              style={{ backgroundColor: '#8B5CF6', hover: { backgroundColor: '#7C3AED' } }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#7C3AED'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#8B5CF6'}
            >
              Logout
            </button>
          </div>
          <p className="mt-2" style={{ color: '#00D9FF' }}>Welcome, {user?.email}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#1A2A35' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: '#00D9FF' }}>Upload CSV Data</h2>

              {error && (
                <div className="mb-4 p-3 border-l-4 rounded" style={{ backgroundColor: '#2A1A1A', borderColor: '#FF6B6B', color: '#FF6B6B' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 border-l-4 rounded" style={{ backgroundColor: '#1A2A1A', borderColor: '#00D9FF', color: '#00D9FF' }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#00D9FF' }}>
                    Select CSV File
                  </label>
                  <div className="relative">
                    <input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      required
                      className="block w-full text-sm"
                      style={{ 
                        color: '#FFFFFF',
                        backgroundColor: 'transparent',
                        padding: '10px',
                        border: '2px dashed #00D9FF',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#8B8B8B' }}>
                    CSV files with headers and data rows
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full font-semibold py-3 px-4 rounded-lg transition"
                  style={{ 
                    backgroundColor: file && !loading ? '#00D9FF' : '#4A4A4A',
                    color: file && !loading ? '#0F1A1F' : '#8B8B8B',
                    cursor: file && !loading ? 'pointer' : 'not-allowed'
                  }}
                >
                  {loading ? 'Processing...' : 'Analyze Data'}
                </button>
              </form>

              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#0F1A1F', borderLeft: '4px solid #8B5CF6' }}>
                <h3 className="font-semibold mb-2" style={{ color: '#00D9FF' }}>Example CSV:</h3>
                <pre className="text-xs overflow-x-auto" style={{ color: '#00D9FF' }}>
{`Company,Market,Revenue
TechStartup,AI,500000
DataCorp,Analytics,1200000
CloudSoft,Infrastructure,800000`}
                </pre>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#1A2A35' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: '#00D9FF' }}>Market Insights</h2>

              {!insights ? (
                <div className="text-center py-12">
                  <p style={{ color: '#8B8B8B' }}>
                    Upload a CSV file to see AI-generated market insights
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="whitespace-pre-wrap p-4 rounded-lg text-sm leading-relaxed" style={{ backgroundColor: '#0F1A1F', color: '#FFFFFF', borderLeft: '4px solid #8B5CF6' }}>
                      {typeof insights === 'string' ? insights : JSON.stringify(insights, null, 2)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const element = document.createElement('a');
                      element.setAttribute(
                        'href',
                        'data:text/plain;charset=utf-8,' + encodeURIComponent(
                          typeof insights === 'string' ? insights : JSON.stringify(insights, null, 2)
                        )
                      );
                      element.setAttribute('download', 'insights.txt');
                      element.style.display = 'none';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="mt-4 px-4 py-2 text-white font-semibold rounded-lg transition"
                    style={{ backgroundColor: '#8B5CF6' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#7C3AED'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#8B5CF6'}
                  >
                    Download Insights
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
