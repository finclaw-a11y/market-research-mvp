import { useState } from 'react'
import { useRouter } from 'next/router'
import { AlertCircle, Loader } from 'lucide-react'
import { supabase, signUp, signIn } from '../lib/supabase'
import { users } from '../lib/api'

export default function Auth() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSignUp = async (e) => {
    e.preventDefault()
    
    if (!email || !password || !fullName) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Sign up with Supabase
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      // Create user in our database
      if (user) {
        await users.signup(user.id, user.email, fullName)
      }

      setSuccess('Account created! Please log in.')
      setTimeout(() => {
        setMode('login')
        setEmail('')
        setPassword('')
        setFullName('')
        setSuccess(null)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { error } = await signIn(email, password)
      
      if (error) throw error

      // Redirect to dashboard
      router.push('/app/upload')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Header */}
          <div className="card-header bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white bg-opacity-20 rounded p-2">
                <div className="font-bold text-lg">MR</div>
              </div>
              <h1 className="text-2xl font-bold">Market Research</h1>
            </div>
            <p className="text-blue-100">Automated AI-powered research tool</p>
          </div>

          {/* Content */}
          <div className="card-body">
            {error && (
              <div className="alert alert-error mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                {success}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccess(null)
                }}
                className={`pb-3 font-medium border-b-2 transition ${
                  mode === 'login'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setSuccess(null)
                }}
                className={`pb-3 font-medium border-b-2 transition ${
                  mode === 'signup'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={mode === 'login' ? handleSignIn : handleSignUp} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  disabled={loading}
                />
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  mode === 'login' ? 'Login' : 'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="card-footer text-center text-sm text-gray-600">
            By using Market Research, you agree to our Terms of Service
          </div>
        </div>
      </div>
    </div>
  )
}
