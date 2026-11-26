import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'

const FOOTER_INFO = {
  about: {
    title: 'Tentang Kami',
    body: 'Isyaratku adalah platform pembelajaran Bahasa Isyarat Indonesia (BISINDO) interaktif yang dilengkapi kamus video multibahasa (Indonesia, Inggris, Arab), kuis bertahap, dan pelacakan progres belajar.',
  },
  privacy: {
    title: 'Kebijakan Privasi',
    body: 'Data akun (nama, email, dan progres belajar) hanya digunakan untuk kebutuhan autentikasi, penyimpanan progres kuis, dan personalisasi pembelajaran di Isyaratku.',
  },
  terms: {
    title: 'Syarat & Ketentuan',
    body: 'Seluruh materi video peragaan BISINDO pada platform ini ditujukan untuk pembelajaran dan edukasi. Pengguna diharapkan menjaga etika dan keamanan akun masing-masing.',
  },
  contact: {
    title: 'Hubungi Kami',
    body: 'Untuk pertanyaan, masukan, atau kerja sama pengembangan materi BISINDO, silakan hubungi tim pengembang melalui email: admin@isyaratku.id.',
  },
}

const Footer = () => {
  const [activeInfoKey, setActiveInfoKey] = useState(null)
  const activeInfo = activeInfoKey ? FOOTER_INFO[activeInfoKey] : null

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
            <button
              type="button"
              onClick={() => setActiveInfoKey('about')}
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              Tentang Kami
            </button>
            <button
              type="button"
              onClick={() => setActiveInfoKey('privacy')}
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              Kebijakan Privasi
            </button>
            <button
              type="button"
              onClick={() => setActiveInfoKey('terms')}
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              Syarat & Ketentuan
            </button>
            <button
              type="button"
              onClick={() => setActiveInfoKey('contact')}
              className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
            >
              Hubungi Kami
            </button>
          </nav>

          {/* Right: Copyright */}
          <p className="text-sm text-gray-400 text-center md:text-right">
            © 2026 Isyaratku. Belajar BISINDO dengan Mudah.
          </p>
        </div>
      </div>

      {activeInfo && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveInfoKey(null)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{activeInfo.title}</h3>
              <button
                type="button"
                onClick={() => setActiveInfoKey(null)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{activeInfo.body}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveInfoKey(null)}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}

export default Footer
