import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import PromoPopup from './PromoPopup'

export default function Layout() {
  return (
    <>
      <Navbar />
      <PromoPopup />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <footer className="bg-[#3E2C1F] py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-bold text-white mb-1">Dear Momollie</p>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Handcrafted with love</p>
          <a
            href="mailto:hello@momollie.me"
            className="text-sm text-[#E8B55F] hover:text-[#D4A04D] transition-colors"
          >
            hello@momollie.me
          </a>
          <p className="mt-4 text-xs text-white/30">
            © {new Date().getFullYear()} Dear Momollie · All rights reserved
          </p>
        </div>
      </footer>
    </>
  )
}
