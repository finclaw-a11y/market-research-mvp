import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Loader, AlertCircle, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { users, subscriptions } from '../../lib/api'

export default function SettingsPage() {
  const router = useRouter()
  
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)
      
      // Load profile
      const profileRes = await users.getProfile(user.id)
      setProfile(profileRes.data)
      setFullName(profileRes.data.full_name || '')

      // Load subscription
      const subRes = await subscriptions.getStatus(user.id)
      setSubscription(subRes.data)
    } catch (error) {
      console.error('Load error:', error)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    if (!user) return

    try {
      setSaving(true)
      setError(null)

      await users.updateProfile(user.id, fullName)
      
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleStartTrial() {
    if (!user) return

    try {
      setSaving(true)
      setError(null)

      const res = await subscriptions.startTrial(user.id)
      
      // Reload subscription
      const subRes = await subscriptions.getStatus(user.id)
      setSubscription(subRes.data)
      
      setSuccess('Free trial started! You have 7 days of unlimited access.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Trial start error:', error)
      setError('Failed to start trial')
    } finally {
      setSaving(false)
    }
  }

  async function handleManageSubscription() {
    if (!user) return

    try {
      setError(null)
      const res = await users.getBillingPortal(user.id)
      
      if (res.data.portal_url) {
        window.location.href = res.data.portal_url
      }
    } catch (error) {
      console.error('Portal error:', error)
      setError('Failed to open billing portal')
    }
  }

  async function handleCancelSubscription() {
    if (!user || !window.confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      await subscriptions.cancel(user.id)
      
      // Reload subscription
      const subRes = await subscriptions.getStatus(user.id)
      setSubscription(subRes.data)
      
      setSuccess('Subscription cancelled')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Cancel error:', error)
      setError('Failed to cancel subscription')
    } finally {
      setSaving(false)
    }
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
        <title>Settings - Market Research</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>

          {error && (
            <div className="alert alert-error mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6 flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Profile Section */}
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input-field bg-gray-100 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={user?.id || ''}
                  className="input-field bg-gray-100 cursor-not-allowed font-mono text-xs"
                  disabled
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Subscription</h2>
            </div>
            <div className="card-body space-y-6">
              {/* Status */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                    <p className="text-2xl font-bold capitalize">
                      {subscription?.subscription_status || 'Free'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription?.subscription_status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : subscription?.subscription_status === 'trial'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    {subscription?.subscription_status === 'free' ? 'Free Plan' : 'Active'}
                  </div>
                </div>
              </div>

              {/* Trial Info */}
              {subscription?.details?.trial_end && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Trial ends:</strong> {new Date(subscription.details.trial_end * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Plans</h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">Professional</h4>
                        <p className="text-sm text-gray-600">Unlimited uploads & insights</p>
                      </div>
                      <span className="text-lg font-bold text-gray-900">$99/mo</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>✓ Unlimited CSV uploads</li>
                      <li>✓ Instant AI insights</li>
                      <li>✓ Export in all formats</li>
                      <li>✓ Email support</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {subscription?.subscription_status === 'free' ? (
                  <button
                    onClick={handleStartTrial}
                    disabled={saving}
                    className="btn-primary flex-1"
                  >
                    {saving ? 'Processing...' : 'Start 7-Day Free Trial'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleManageSubscription}
                      disabled={saving}
                      className="btn-primary flex-1"
                    >
                      Manage Subscription
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={saving}
                      className="btn-danger flex-1"
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Account</h2>
            </div>
            <div className="card-body space-y-4">
              <button
                onClick={() => {
                  supabase.auth.signOut()
                  router.push('/login')
                }}
                className="btn-secondary w-full"
              >
                Logout
              </button>
              <p className="text-xs text-gray-500 text-center">
                Last login: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
