import { useState } from 'react'
import { Bookmark, Lock, Play, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuthModal } from '@/context/AuthContext'

const tutorialModules = [
  {
    id: 1,
    title: 'Abjad A-Z',
    level: 'Pemula',
    levelColor: 'bg-violet-100 text-violet-700',
    duration: '05:20',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=380&fit=crop&auto=format',
    description: 'Pelajari bentuk tangan dasar untuk setiap huruf abjad dalam BISINDO. Fondasi utama sebelum merangkai kata.',
    locked: false,
  },
  {
    id: 2,
    title: 'Berhitung 1-100',
    level: 'Pemula',
    levelColor: 'bg-violet-100 text-violet-700',
    duration: '08:15',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=380&fit=crop&auto=format',
    description: 'Panduan lengkap cara menunjukkan angka puluhan, belasan, hingga ratusan secara jelas dan benar.',
    locked: false,
  },
  {
    id: 3,
    title: 'Sapaan Sehari-hari',
    level: 'Pemula',
    levelColor: 'bg-violet-100 text-violet-700',
    duration: '12:30',
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=380&fit=crop&auto=format',
    description: 'Pelajari cara menyapa, menanyakan kabar, dan frasa sopan santun dasar dalam pergaulan sehari-hari.',
    locked: false,
  },
  {
    id: 4,
    title: 'Perkenalan Diri Lengkap',
    level: 'Menengah',
    levelColor: 'bg-purple-100 text-purple-700',
    duration: '10:45',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=380&fit=crop&auto=format',
    description: 'Modul lanjutan untuk memperkenalkan diri secara detail, menceritakan latar belakang, dan hobi.',
    locked: true,
  },
]

const TutorialPage = () => {
  const { openRegister, openLogin } = useAuthModal()
  const [activeVideo, setActiveVideo] = useState(null)

  const handleCardClick = (module) => {
    if (module.locked) {
      openRegister()
    } else {
      setActiveVideo(module)
    }
  }

  return (
    <div className="bg-white min-h-screen py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Modul Belajar BISINDO
          </h1>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            Pelajari Bahasa Isyarat Indonesia (BISINDO) langkah demi langkah
            melalui video tutorial terstruktur. Mulai dari dasar hingga percakapan sehari-hari.
          </p>
        </div>

        {/* Guest Callout / Progress Banner */}
        <div className="mt-8 mb-12 rounded-2xl bg-gradient-to-r from-violet-100/90 via-purple-100/80 to-violet-50/70 border border-violet-200/60 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm relative overflow-hidden">
          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-violet-600 shadow-sm">
              <Bookmark className="w-6 h-6 fill-violet-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Simpan Progres Belajar Anda
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                Daftar akun gratis sekarang untuk melacak video yang sudah diselesaikan,
                mengikuti kuis, dan membuka modul lanjutan.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <button
              onClick={openRegister}
              className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-violet-600/20 active:scale-[0.98]"
            >
              Daftar Gratis
            </button>
          </div>
        </div>

        {/* Tutorial Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorialModules.map((module) => (
            <article
              key={module.id}
              onClick={() => handleCardClick(module)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="relative aspect-[16/9] bg-gray-900 overflow-hidden">
                  <img
                    src={module.thumbnail}
                    alt={module.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      module.locked
                        ? 'opacity-30 blur-[2px]'
                        : 'group-hover:scale-105'
                    }`}
                  />

                  {/* Locked Overlay or Play Icon */}
                  {module.locked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/40">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg text-gray-800 group-hover:scale-110 transition-transform">
                        <Lock className="w-7 h-7 text-gray-700" strokeWidth={2.2} />
                      </div>
                      <span className="mt-2 text-xs font-semibold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                        Modul Terkunci
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-violet-600 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-violet-600 translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Duration Badge */}
                  <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    {module.duration}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Tags Row */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${module.levelColor}`}
                    >
                      {module.level}
                    </span>
                    {module.locked && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        lock
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                    {module.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Video Modal Player (For Unlocked Videos) */}
      {activeVideo && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideo(null)
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
              <img
                src={activeVideo.thumbnail}
                alt={activeVideo.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full">
                    {activeVideo.level} • {activeVideo.duration}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">
                    {activeVideo.title}
                  </h3>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {activeVideo.description}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setActiveVideo(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setActiveVideo(null)
                    openRegister()
                  }}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                >
                  Daftar untuk Menyimpan Progres
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorialPage
