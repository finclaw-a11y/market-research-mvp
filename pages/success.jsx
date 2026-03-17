import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">✅</div>
        <h1 className="text-3xl font-bold">Welcome to vervix!</h1>
        <p className="text-slate-300">
          Your subscription is active. Check your email for next steps and account access.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Session ID: {session_id}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
