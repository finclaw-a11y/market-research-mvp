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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Vervix Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600 mt-2">Welcome, {user?.email}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upload CSV Data</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    CSV files with headers and data rows
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Analyze Data'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Example CSV:</h3>
                <pre className="text-xs text-gray-700 overflow-x-auto">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Market Insights</h2>

              {!insights ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Upload a CSV file to see AI-generated market insights
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                      {typeof insights === 'string' ? insights : JSON.stringify(insights, null, 2)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Download insights as text
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
                    className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
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
