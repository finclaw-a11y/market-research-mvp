import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Menu, X, LogOut, Settings } from 'lucide-react'
import { supabase, signOut } from '../lib/supabase'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkUser()
    
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user)
    })

    return () => {
      subscription.data.subscription?.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!error && user) {
        setUser(user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  async function handleLogout() {
    try {
      setLoading(true)
      await signOut()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const isActive = (path) => router.pathname === path

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container-custom flex justify-between items-center py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white rounded-lg p-2 font-bold">MR</div>
          <span className="font-bold text-xl hidden sm:inline">Market Research</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              <Link
                href="/app/upload"
                className={`font-medium transition ${
                  isActive('/app/upload')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Upload
              </Link>
              <Link
                href="/app/insights"
                className={`font-medium transition ${
                  isActive('/app/insights')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Insights
              </Link>
              <Link
                href="/app/settings"
                className={`font-medium transition ${
                  isActive('/app/settings')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Settings
              </Link>
              
              <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-gray-600 hover:text-blue-600"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container-custom py-4 space-y-4">
            {user ? (
              <>
                <Link
                  href="/app/upload"
                  className="block font-medium text-gray-600 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Upload
                </Link>
                <Link
                  href="/app/insights"
                  className="block font-medium text-gray-600 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Insights
                </Link>
                <Link
                  href="/app/settings"
                  className="block font-medium text-gray-600 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  disabled={loading}
                  className="w-full btn-secondary btn-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block font-medium text-gray-600 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
