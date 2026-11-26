import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bookmark,
  Lock,
  Play,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Video,
  Award,
} from 'lucide-react'
import { useAuthModal } from '@/context/AuthContext'
import { useDictionary } from '@/context/DictionaryContext'

const LEVEL_STYLES = {
  Pemula: 'bg-violet-100 text-violet-700',
  Menengah: 'bg-purple-100 text-purple-700',
  Lanjutan: 'bg-indigo-100 text-indigo-700',
}

const TutorialPage = () => {
  const { isLoggedIn, user, openRegister } = useAuthModal()
  const { categories, vocabularies } = useDictionary()
  const navigate = useNavigate()

  const [activeModule, setActiveModule] = useState(null)
  const [activeLessonIdx, setActiveLessonIdx] = useState(0)

  const tutorialModules = useMemo(() => {
    const activeVocabs = vocabularies.filter((v) => v.status !== 'Nonaktif')

    return categories
      .map((cat, idx) => {
        const lessons = activeVocabs.filter(
          (v) => v.categoryId === cat.id || v.category === cat.title
        )
        const level = idx < 6 ? 'Pemula' : idx < 12 ? 'Menengah' : 'Lanjutan'
        return {
          id: cat.id || idx + 1,
          title: cat.title,
          topic: cat.topic || cat.title,
          level,
          levelColor: LEVEL_STYLES[level],
          description:
            cat.description ||
            `Pelajari video peragaan kosakata ${cat.title} dalam Bahasa Isyarat Indonesia (BISINDO).`,
          lessons,
          previewVideoUrl: lessons[0]?.videoUrl || '',
          locked: !isLoggedIn && idx >= 3,
        }
      })
      .filter((mod) => mod.lessons.length > 0)
  }, [categories, vocabularies, isLoggedIn])

  const handleCardClick = (module) => {
    if (module.locked) {
      openRegister()
      return
    }
    setActiveModule(module)
    setActiveLessonIdx(0)
  }

  const currentLesson = activeModule?.lessons?.[activeLessonIdx] || null

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
            melalui video tutorial terstruktur yang tersinkron dengan kamus isyarat.
          </p>
        </div>

        {/* Callout Banner (Menyesuaikan status login) */}
        {!isLoggedIn ? (
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
                  Daftar akun gratis sekarang untuk membuka seluruh {tutorialModules.length} modul
                  tutorial, mengikuti kuis, dan mencatat progres belajar Anda.
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
        ) : (
          <div className="mt-8 mb-12 rounded-2xl bg-gradient-to-r from-emerald-50 via-violet-50/70 to-purple-50 border border-emerald-200/70 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Seluruh Modul Terbuka untuk {user?.firstName || 'Anda'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                  Anda dapat memutar seluruh {tutorialModules.length} modul video BISINDO secara
                  penuh dan melanjutkan ke kuis interaktif.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => navigate('/app/progres')}
                className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
              >
                Lihat Progres
              </button>
              <button
                onClick={() => navigate('/app/kuis')}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-violet-600/20 flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Mulai Kuis</span>
              </button>
            </div>
          </div>
        )}

        {/* Tutorial Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorialModules.map((module) => (
            <article
              key={module.id}
              onClick={() => handleCardClick(module)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
            >
              <div>
                {/* Video Preview Container */}
                <div className="relative aspect-[16/9] bg-gray-900 overflow-hidden">
                  {module.previewVideoUrl ? (
                    <video
                      src={module.previewVideoUrl}
                      muted
                      preload="metadata"
                      playsInline
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        module.locked
                          ? 'opacity-30 blur-[2px]'
                          : 'group-hover:scale-105'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                      <Video className="w-10 h-10" />
                    </div>
                  )}

                  {/* Locked Overlay or Play Icon */}
                  {module.locked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/40">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg text-gray-800 group-hover:scale-110 transition-transform">
                        <Lock className="w-7 h-7 text-gray-700" strokeWidth={2.2} />
                      </div>
                      <span className="mt-2 text-xs font-semibold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                        Daftar untuk Membuka
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-violet-600 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-violet-600 translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Lesson Count Badge */}
                  <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                    {module.lessons.length} Video
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${module.levelColor}`}
                    >
                      {module.level}
                    </span>
                    {module.locked && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        Terkunci
                      </span>
                    )}
                  </div>

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

      {/* Video Modal Player (Sinkron dengan Database / DictionaryContext) */}
      {activeModule && currentLesson && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModule(null)
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-6">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                key={currentLesson.videoUrl}
                src={currentLesson.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setActiveModule(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors"
                aria-label="Tutup pemutar video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full">
                    {activeModule.level} • {activeModule.title} ({activeLessonIdx + 1}/
                    {activeModule.lessons.length})
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">
                    {currentLesson.word}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeLessonIdx === 0}
                    onClick={() => setActiveLessonIdx((i) => Math.max(0, i - 1))}
                    className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Video sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={activeLessonIdx >= activeModule.lessons.length - 1}
                    onClick={() =>
                      setActiveLessonIdx((i) =>
                        Math.min(activeModule.lessons.length - 1, i + 1)
                      )
                    }
                    className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Video berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {currentLesson.description || activeModule.description}
              </p>

              {/* Daftar Materi dalam Modul */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Daftar Kosakata ({activeModule.lessons.length})
                </p>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
                  {activeModule.lessons.map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveLessonIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        idx === activeLessonIdx
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lesson.word}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setActiveModule(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  Tutup
                </button>
                {!isLoggedIn ? (
                  <button
                    onClick={() => {
                      setActiveModule(null)
                      openRegister()
                    }}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    Daftar untuk Menyimpan Progres
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveModule(null)
                      navigate('/app/kuis')
                    }}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    Lanjut ke Kuis
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorialPage
