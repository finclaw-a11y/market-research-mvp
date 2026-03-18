import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">✅</div>
        <h1 className="text-3xl font-bold">Welcome to Vervix!</h1>
        <p className="text-slate-300">
          Your subscription is active. Log in to your dashboard to get started.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Session ID: {session_id}</p>
          
          <div className="space-y-2">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-green-600 hover:bg-green-700 py-2 px-4 rounded font-semibold transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-semibold transition"
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-700 rounded text-sm text-left">
          <p className="font-semibold mb-2">Next Steps:</p>
          <ul className="text-slate-300 space-y-1">
            <li>✓ Click "Go to Dashboard"</li>
            <li>✓ Sign in with your email</li>
            <li>✓ Upload CSV data to analyze</li>
            <li>✓ Get AI-powered market insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
