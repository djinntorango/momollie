import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Sidebar from '@/components/admin/Sidebar'

const ADMIN_UIDS = ['gYhf2cyummQW10nXo6SV8ails833', 'cUuSeqAN77VkADtHpjX286J0Xm33']

export default function AdminShell() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/admin/login', { replace: true })
    } else if (!ADMIN_UIDS.includes(user.uid)) {
      signOut(auth())
      navigate('/admin/login', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading || !user || !ADMIN_UIDS.includes(user.uid)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
