import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, BarChart3, Zap, Lock, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()
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

  return (
    <>
      <Head>
        <title>Market Research - AI-Powered Insights</title>
        <meta name="description" content="Automated market research tool with AI insights" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container-custom flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white rounded-lg p-2 font-bold">MR</div>
              <span className="font-bold text-xl">Market Research</span>
            </div>
            <div className="flex gap-4">
              {user ? (
                <Link href="/app/upload" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary">
                    Login
                  </Link>
                  <Link href="/login" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container-custom py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Market Research, Powered by AI
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Upload your data and get instant AI-powered insights with zero manual work.
              </p>
              <div className="flex gap-4">
                <Link href="/login" className="btn-primary btn-lg">
                  Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                7 days free. No credit card required.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg h-96 flex items-center justify-center">
              <BarChart3 className="w-48 h-48 text-blue-300" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Market Research?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card">
                <div className="card-body">
                  <Zap className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Instant Analysis</h3>
                  <p className="text-gray-600">
                    Upload your CSV and get insights in seconds with our AI engine.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card">
                <div className="card-body">
                  <Lock className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                  <p className="text-gray-600">
                    Your data is encrypted and never shared with third parties.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card">
                <div className="card-body">
                  <Check className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Actionable Insights</h3>
                  <p className="text-gray-600">
                    Get key findings and recommendations ready to act on.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-16">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Research?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Start your free 7-day trial today. No credit card required.
            </p>
            <Link href="/login" className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
              Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8">
          <div className="container-custom text-center">
            <p>&copy; 2024 Market Research. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}
