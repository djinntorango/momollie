import { Outlet, Link } from 'react-router-dom'
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
            href="mailto:hello@dearmomollie.com"
            className="text-sm text-[#E8B55F] hover:text-[#D4A04D] transition-colors"
          >
            hello@dearmomollie.com
          </a>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link to="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Terms of Service
            </Link>
            <span className="text-white/20">·</span>
            <Link to="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
          </div>
          <p className="mt-3 text-xs text-white/30">
            © {new Date().getFullYear()} Dear Momollie · All rights reserved
          </p>
        </div>
      </footer>
    </>
  )
}
