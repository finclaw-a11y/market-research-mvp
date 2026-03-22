import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import '../styles/dashboard-colors.css';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

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
      setFileName(selectedFile.name);
      setError('');
      setSuccess('');
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError('');
      setSuccess('');
    } else {
      setError('Please drop a CSV file');
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
        setFileName('');
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
      <div style={{ 
        background: 'linear-gradient(135deg, #0F1A1F 0%, #1A2A35 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 24px' }}></div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#00D9FF', marginBottom: '12px' }}>
            Loading...
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="header-title">VERVIX DASHBOARD</h1>
              <p className="header-subtitle">Professional Market Insights & Data Analysis</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-outline-cyan"
              style={{ marginBottom: '12px' }}
            >
              Logout
            </button>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '12px' }}>
            Welcome, <strong>{user?.email}</strong>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '32px' }}>
          {/* Upload Section */}
          <div>
            <div className="dashboard-card" style={{ padding: '28px', borderRadius: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#00D9FF', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📊 Upload CSV Data
              </h2>

              {error && <div className="alert-error">{error}</div>}
              {success && <div className="alert-success">{success}</div>}

              <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Drag and Drop Zone */}
                <div
                  className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('csvFile').click()}
                >
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    {fileName ? `✓ ${fileName}` : 'Drag & drop CSV here'}
                  </div>
                  <div className="upload-hint">or click to browse</div>
                </div>

                <input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                  style={{ display: 'none' }}
                />

                <button
                  type="submit"
                  disabled={!file || loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px 24px' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                      Processing...
                    </span>
                  ) : (
                    '🚀 Analyze Data'
                  )}
                </button>
              </form>

              {/* Example Section */}
              <div style={{ marginTop: '28px', padding: '16px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '8px', borderLeft: '3px solid #00D9FF' }}>
                <h3 style={{ fontWeight: '600', color: '#00D9FF', marginBottom: '10px', fontSize: '13px', textTransform: 'uppercase' }}>
                  Example CSV Format:
                </h3>
                <pre style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', overflow: 'auto', margin: '0', lineHeight: '1.4' }}>
{`Company,Market,Revenue
TechStartup,AI,500000
DataCorp,Analytics,1200000
CloudSoft,Infrastructure,800000`}
                </pre>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div>
            <div className="dashboard-card" style={{ padding: '28px', borderRadius: '12px', minHeight: '300px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#8B5CF6', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                💡 Market Insights
              </h2>

              {!insights ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <p>Upload a CSV file to see AI-generated market insights</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="insight-card">
                    <div className="insight-content" style={{ whiteSpace: 'pre-wrap' }}>
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
                      element.setAttribute('download', 'vervix-insights.txt');
                      element.style.display = 'none';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '12px 24px' }}
                  >
                    ⬇️ Download Insights
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div className="insight-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#00D9FF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Status
                </div>
                <span className="badge-cyan" style={{ marginTop: '8px' }}>
                  Ready
                </span>
              </div>
              <div style={{ fontSize: '28px' }}>✓</div>
            </div>
          </div>

          <div className="insight-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Engine
                </div>
                <span className="badge-purple" style={{ marginTop: '8px' }}>
                  AI-Powered
                </span>
              </div>
              <div style={{ fontSize: '28px' }}>⚡</div>
            </div>
          </div>

          <div className="insight-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Version
                </div>
                <span className="badge-success" style={{ marginTop: '8px' }}>
                  Option C
                </span>
              </div>
              <div style={{ fontSize: '28px' }}>🎯</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
