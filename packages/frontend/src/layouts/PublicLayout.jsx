import { Outlet } from 'react-router-dom'
import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import AuthModal from '@/components/common/AuthModal'

const PublicLayout = () => {
  return (
    <div className="user-theme-shell min-h-screen flex flex-col transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
    </div>
  )
}

export default PublicLayout
