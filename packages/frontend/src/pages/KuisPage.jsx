import { Navigate } from 'react-router-dom'
import { Lock, Hand, Sparkles } from 'lucide-react'
import { useAuthModal } from '@/context/AuthContext'

const quizCategories = [
  {
    id: 'alfabet',
    badgeType: 'text',
    badgeText: 'A Z',
    badgeBg: 'bg-violet-100',
    badgeColor: 'text-violet-600',
    title: 'Alfabet BISINDO',
    description: 'Uji kecepatan Anda mengenali huruf-huruf abjad dalam BISINDO.',
  },
  {
    id: 'sapaan',
    badgeType: 'icon',
    icon: Hand,
    badgeBg: 'bg-indigo-100',
    badgeColor: 'text-indigo-600',
    title: 'Sapaan Sehari-hari',
    description: 'Tebak isyarat untuk sapaan dasar dan perkenalan diri.',
  },
  {
    id: 'angka',
    badgeType: 'text',
    badgeText: '123',
    badgeBg: 'bg-rose-100',
    badgeColor: 'text-rose-600',
    title: 'Angka & Hitungan',
    description: 'Latihan membaca angka dari 1 hingga 100 dalam isyarat.',
  },
]

const KuisPage = () => {
  const { openLogin, openRegister, isLoggedIn } = useAuthModal()

  if (isLoggedIn) {
    return <Navigate to="/app/kuis" replace />
  }

  return (
    <div className="bg-white py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Uji Kemampuan BISINDO Anda
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            Latih ingatan dan pemahaman Anda tentang Bahasa Isyarat Indonesia melalui
            berbagai kuis interaktif yang dirancang untuk semua tingkat kemampuan.
          </p>
        </div>

        {/* Lock Gate Container */}
        <div className="mt-12 mb-16 rounded-3xl border border-violet-100/80 bg-violet-50/20 p-8 sm:p-12 lg:p-16 flex items-center justify-center relative overflow-hidden">
          {/* Subtle decorative background blur */}
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl pointer-events-none"
          />

          {/* Centered Lock Gate Modal Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 p-8 sm:p-10 max-w-md w-full text-center relative z-10">
            {/* Lock Icon */}
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-violet-600">
              <Lock className="w-7 h-7" strokeWidth={2.2} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 leading-snug">
              Harus Masuk untuk
              <br />
              Mengerjakan Kuis
            </h2>

            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Simpan progres belajar Anda, akses semua tingkatan kuis, dan lacak
              pencapaian Anda dengan membuat akun gratis.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={openLogin}
                className="flex-1 py-2.5 px-5 rounded-lg bg-black hover:bg-gray-800 text-white text-sm font-semibold transition-colors text-center shadow-sm"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={openRegister}
                className="flex-1 py-2.5 px-5 rounded-lg bg-white border border-violet-600 text-violet-600 hover:bg-violet-50 text-sm font-semibold transition-colors text-center"
              >
                Daftar Gratis
              </button>
            </div>
          </div>
        </div>

        {/* Section: Kategori Kuis Tersedia */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Kategori Kuis Tersedia
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quizCategories.map((item) => {
              const IconComponent = item.icon
              return (
                <article
                  key={item.id}
                  onClick={openRegister}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Row: Category Icon/Badge + Lock Status */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${item.badgeBg} ${item.badgeColor}`}
                      >
                        {item.badgeType === 'text' ? (
                          <span>{item.badgeText}</span>
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}
                      </div>
                      <Lock className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-gray-900 text-base mt-4 group-hover:text-violet-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Progress placeholder bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-6" />
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default KuisPage
