import { Sparkles } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span className="font-bold text-lg text-gray-900">Isyaratku</span>
          </div>

          {/* Center: Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="#about"
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              Tentang Kami
            </a>
            <a
              href="#privacy"
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              Kebijakan Privasi
            </a>
            <a
              href="#terms"
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              Syarat & Ketentuan
            </a>
            <a
              href="#contact"
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              Hubungi Kami
            </a>
          </nav>

          {/* Right: Copyright */}
          <p className="text-sm text-gray-400 text-center md:text-right">
            © 2026 Isyaratku. Belajar BISINDO dengan Mudah.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
