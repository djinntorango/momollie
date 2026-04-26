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
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">© 2024 Momollie. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
