import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LangContext'
import { signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const SPINNER = (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const ADMIN_UIDS = [
  'gYhf2cyummQW10nXo6SV8ails833', // your account
  'cUuSeqAN77VkADtHpjX286J0Xm33', // wife's account
]

export default function AdminLogin() {
  const { user, loading } = useAuth()
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      if (ADMIN_UIDS.filter(Boolean).includes(user.uid)) {
        navigate('/admin/products', { replace: true })
      } else {
        signOut(auth())
        setError('This Google account is not authorized to access the admin panel.')
      }
    }
  }, [user, loading, navigate])

  const handleGoogleSignIn = async () => {
    setError('')
    setSubmitting(true)
    try {
      await signInWithPopup(auth(), new GoogleAuthProvider())
      // navigation handled by the useEffect above once user is set
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // user closed the popup — do nothing
      } else if (code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups for this site and try again.')
      } else if (code) {
        setError(`Sign-in failed (${code}). Please try again.`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'en' ? 'bg-[#E8B55F] text-white' : 'text-gray-500 hover:text-gray-700'}`}>EN</button>
            <button onClick={() => setLang('zh')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${lang === 'zh' ? 'bg-[#E8B55F] text-white' : 'text-gray-500 hover:text-gray-700'}`}>中文</button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3E2C1F]">{t('login.title')}</h1>
          <p className="text-[#6B5B4F] mt-2">{t('login.subtitle')}</p>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}

        {user && !ADMIN_UIDS.filter(Boolean).includes(user.uid) === false && (
          <p className="text-xs text-center text-[#9B8B7E] mb-3">
            Signed in as {user.email} —{' '}
            <button onClick={() => signOut(auth())} className="text-[#E8B55F] hover:underline">sign out</button>
          </p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 font-medium text-gray-700"
        >
          {submitting ? SPINNER : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
      </div>
    </div>
  )
}
