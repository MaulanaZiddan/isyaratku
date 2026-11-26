import { useState, useRef, useEffect, useMemo, memo } from 'react'
import { createPortal } from 'react-dom'
import {
  Search,
  ChevronRight,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  X,
  BookOpen,
  Globe,
  Folder,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { dictionaryCategories, allVocabularies } from '@/data/vocabularies'

const LANGUAGES = [
  {
    code: 'id',
    label: 'Indonesia',
    short: 'ID',
    flag: '🇮🇩',
    ttsLang: 'id-ID',
    placeholder: 'Cari kosakata Bahasa Indonesia (contoh: aku, makan, ibu)...',
  },
  {
    code: 'en',
    label: 'English',
    short: 'EN',
    flag: '🇬🇧',
    ttsLang: 'en-US',
    placeholder: 'Search vocabulary in English (e.g., I, eat, mother, learn)...',
  },
  {
    code: 'ar',
    label: 'العربية',
    short: 'AR',
    flag: '🇸🇦',
    ttsLang: 'ar-SA',
    placeholder: 'ابحث عن المفردات باللغة العربية (مثال: أنا، أكل، أم)...',
  },
]

const splitTokens = (str) =>
  String(str || '')
    .toLowerCase()
    .split(/[\s,/;+()\-]+/)
    .map((t) => t.trim())
    .filter(Boolean)

// Algoritma skor relevansi pencarian berdasarkan bahasa yang dipilih
const getVocabularyRelevance = (item, qLower, rawQuery, activeLang) => {
  if (!qLower) return 0

  const idTokens = splitTokens(item.word)
  const enTokens = splitTokens(item.transEn)
  const arTokens = splitTokens(item.transAr)

  let score = 0

  if (activeLang === 'en') {
    const textEn = (item.transEn || '').toLowerCase()
    const catEn = (item.categoryEn || '').toLowerCase()

    // 1. Exact match pada token kata bahasa Inggris (contoh 'I' cocok token 'I' pada 'I / Me')
    if (enTokens.includes(qLower)) {
      score += 10000
      if (enTokens[0] === qLower) score += 2000
    } else if (textEn === qLower) {
      score += 9000
    } else if (enTokens.some((t) => t.startsWith(qLower))) {
      // 2. Prefix match pada token kata bahasa Inggris
      score += 6000
      if (enTokens[0].startsWith(qLower)) score += 1000
    } else if (textEn.startsWith(qLower)) {
      score += 5000
    } else if (textEn.includes(qLower)) {
      // 3. Mengandung ejaan/huruf tersebut pada bahasa Inggris
      score += 2000
    }

    // Match kategori Inggris
    if (catEn.includes(qLower)) {
      score += 500
    }

    // Fokus murni pada bahasa yang dipilih (tanpa cross-language fallback)
    return score
  } else if (activeLang === 'ar') {
    const textAr = item.transAr || ''
    const catAr = item.categoryAr || ''

    // 1. Exact match pada bahasa Arab
    if (arTokens.includes(rawQuery) || textAr === rawQuery) {
      score += 10000
      if (arTokens[0] === rawQuery) score += 2000
    } else if (arTokens.some((t) => t.startsWith(rawQuery))) {
      score += 6000
      if (arTokens[0].startsWith(rawQuery)) score += 1000
    } else if (textAr.startsWith(rawQuery)) {
      score += 5000
    } else if (textAr.includes(rawQuery)) {
      score += 2000
    }

    if (catAr.includes(rawQuery)) {
      score += 500
    }

    // Fokus murni pada bahasa Arab
    return score
  } else {
    // 1. activeLang === 'id' (Bahasa Indonesia)
    const textId = (item.word || '').toLowerCase()
    const catId = (item.category || '').toLowerCase()

    if (idTokens.includes(qLower)) {
      score += 10000
      if (idTokens[0] === qLower) score += 2000
    } else if (textId === qLower) {
      score += 9000
    } else if (idTokens.some((t) => t.startsWith(qLower))) {
      score += 6000
      if (idTokens[0].startsWith(qLower)) score += 1000
    } else if (textId.startsWith(qLower)) {
      score += 5000
    } else if (textId.includes(qLower)) {
      // Mengandung ejaan/huruf tersebut pada bahasa Indonesia
      score += 2000
    }

    // Match kategori Indonesia
    if (catId.includes(qLower)) {
      score += 500
    }

    // Fokus murni pada bahasa Indonesia
    return score
  }
}

// Single Video Card Component with Autoplay, Play/Pause, Speed & Pronunciation
const VocabularyCard = memo(({ item, isGlobalAutoplay, onOpenModal, activeLang = 'id' }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(isGlobalAutoplay)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Kata utama sesuai bahasa aktif
  const primaryTitle =
    activeLang === 'en'
      ? item.transEn || item.word
      : activeLang === 'ar'
      ? item.transAr || item.word
      : item.word

  const subTranslations =
    activeLang === 'en'
      ? `${item.word} • ${item.transAr}`
      : activeLang === 'ar'
      ? `${item.word} • ${item.transEn}`
      : `${item.transEn} • ${item.transAr}`

  const currentDesc =
    activeLang === 'en'
      ? item.descriptionEn || item.description
      : activeLang === 'ar'
      ? item.descriptionAr || item.description
      : item.description

  const currentCategoryName =
    activeLang === 'en'
      ? item.categoryEn || item.category
      : activeLang === 'ar'
      ? item.categoryAr || item.category
      : item.category

  const ttsLang =
    activeLang === 'en' ? 'en-US' : activeLang === 'ar' ? 'ar-SA' : 'id-ID'

  useEffect(() => {
    if (videoRef.current) {
      if (isGlobalAutoplay) {
        videoRef.current.play().catch(() => {})
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [isGlobalAutoplay])

  const togglePlay = (e) => {
    e.stopPropagation()
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const changeSpeed = (e, speed) => {
    e.stopPropagation()
    setPlaybackRate(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const speakWord = (e) => {
    e.stopPropagation()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(primaryTitle)
      utterance.lang = ttsLang
      utterance.rate = 0.9
      setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <article
      onClick={() => onOpenModal(item)}
      onMouseEnter={() => {
        if (!isGlobalAutoplay && videoRef.current) {
          videoRef.current.play().catch(() => {})
          setIsPlaying(true)
        }
      }}
      onMouseLeave={() => {
        if (!isGlobalAutoplay && videoRef.current) {
          videoRef.current.pause()
          setIsPlaying(false)
        }
      }}
      className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-0.5"
    >
      <div>
        {/* Video / Autoplay Media Container */}
        <div className="relative aspect-[16/11] bg-gray-900 overflow-hidden">
          <video
            ref={videoRef}
            src={item.videoUrl}
            autoPlay={isGlobalAutoplay}
            loop
            muted
            playsInline
            preload={isGlobalAutoplay ? 'auto' : 'none'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Overlays: Status Badge & Speed Controls */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 transition-colors ${
                isPlaying
                  ? 'bg-emerald-500/80 text-white'
                  : 'bg-black/60 text-gray-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPlaying ? 'bg-white animate-pulse' : 'bg-gray-400'
                }`}
              />
              {isPlaying ? 'Auto-Play' : 'Jeda'}
            </span>

            {/* Speed Pill Buttons */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-0.5 rounded-lg text-[10px] text-white">
              {[0.5, 0.75, 1].map((spd) => (
                <button
                  key={spd}
                  onClick={(e) => changeSpeed(e, spd)}
                  className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    playbackRate === spd
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  title={`Kecepatan ${spd}x`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Center Play / Pause Floating Toggle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={togglePlay}
              className="pointer-events-auto w-12 h-12 bg-white/90 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110 active:scale-95"
              aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Word Info & Description */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3
                  dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                  className="text-xl font-black text-gray-900 tracking-tight group-hover:text-violet-600 transition-colors"
                >
                  {primaryTitle}
                </h3>
                <button
                  type="button"
                  onClick={speakWord}
                  className={`p-1.5 rounded-full transition-colors ${
                    isSpeaking
                      ? 'bg-violet-100 text-violet-700 animate-pulse'
                      : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'
                  }`}
                  title="Dengarkan pengucapan kata"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p
                className="text-xs text-gray-400 font-medium mt-0.5"
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              >
                {subTranslations}
              </p>
            </div>

            <span className="text-[11px] font-semibold px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full whitespace-nowrap">
              {currentCategoryName}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
              {activeLang === 'en'
                ? 'Gesture Description:'
                : activeLang === 'ar'
                ? 'وصف الحركة:'
                : 'Deskripsi Gerakan:'}
            </p>
            <p
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2"
            >
              {currentDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-5 pt-0 flex items-center justify-between text-[11px] text-gray-400">
        <span>Komunitas Akar Tuli Malang</span>
        <span className="font-semibold text-violet-600 group-hover:underline flex items-center gap-0.5">
          Perbesar &rarr;
        </span>
      </div>
    </article>
  )
})

const UserDictionaryPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [activeLang, setActiveLang] = useState('id') // 'id' | 'en' | 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [visibleLimit, setVisibleLimit] = useState(12)
  const [isAutoplay, setIsAutoplay] = useState(false)
  const [activeVideoModal, setActiveVideoModal] = useState(null)
  const [modalLang, setModalLang] = useState('id') // 'id' | 'en' | 'ar'
  const [isModalSpeaking, setIsModalSpeaking] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setVisibleLimit(12)
    }, 220)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveVideoModal(null)
    }
    if (activeVideoModal) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeVideoModal])

  const currentCategory = dictionaryCategories.find(
    (c) => c.id === selectedCategoryId
  )

  // ========================================================
  // GLOBAL SEARCH RESULTS WITH RELEVANCE RANKING & MULTI-WORD PARSER
  // ========================================================
  const rawQuery = debouncedQuery.trim()
  const { displayMatches, isSentenceMode, missingTokens } = useMemo(() => {
    const qLower = rawQuery.toLowerCase()

    // 1. Direct relevance-based match (dengan ranking skor bahasa aktif)
    const directMatches = rawQuery
      ? allVocabularies
          .map((w) => ({
            item: w,
            score: getVocabularyRelevance(w, qLower, rawQuery, activeLang),
          }))
          .filter((e) => e.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((e) => e.item)
      : []

    // 2. Tokenize untuk pencarian multi-kata / kalimat (misal "I eat", "aku makan")
    const tokens = rawQuery
      ? rawQuery
          .split(/[\s+,]+/)
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : []
    const isMultiToken = tokens.length > 1

    const multiWordFound = []
    let missing = []

    if (isMultiToken) {
      const foundSet = new Set()
      tokens.forEach((t) => {
        // Cari kosakata paling relevan untuk masing-masing token
        const tokenMatches = allVocabularies
          .map((w) => ({
            item: w,
            score: getVocabularyRelevance(w, t, t, activeLang),
          }))
          .filter((e) => e.score > 0)
          .sort((a, b) => b.score - a.score)

        if (tokenMatches.length > 0) {
          const match = tokenMatches[0].item
          if (!foundSet.has(match.id)) {
            foundSet.add(match.id)
            multiWordFound.push(match)
          }
        } else {
          missing.push(t)
        }
      })
    }

    let finalMatches = []
    let sentenceMode = false

    if (isMultiToken) {
      if (multiWordFound.length > 0) {
        finalMatches = multiWordFound
        sentenceMode = true
      } else if (directMatches.length > 0) {
        finalMatches = directMatches
      } else {
        finalMatches = []
        missing = tokens
      }
    } else {
      finalMatches = directMatches
      if (rawQuery && directMatches.length === 0) {
        missing = [rawQuery]
      }
    }

    return {
      displayMatches: finalMatches,
      isSentenceMode: sentenceMode,
      missingTokens: missing,
    }
  }, [rawQuery, activeLang])

  const visibleMatches = useMemo(
    () => displayMatches.slice(0, visibleLimit),
    [displayMatches, visibleLimit]
  )

  const handleOpenModal = (word) => {
    setModalLang(activeLang)
    setActiveVideoModal(word)
  }

  const getLocalizedContent = (item, lang) => {
    if (!item) return { word: '', category: '', description: '', descTitle: 'Deskripsi Gerakan:', isRtl: false }
    if (lang === 'en') {
      return {
        word: item.transEn || item.word,
        category: item.categoryEn || item.category,
        description: item.descriptionEn || item.description,
        descTitle: 'Gesture Description:',
        isRtl: false,
      }
    }
    if (lang === 'ar') {
      return {
        word: item.transAr || item.word,
        category: item.categoryAr || item.category,
        description: item.descriptionAr || item.description,
        descTitle: 'وصف الحركة:',
        isRtl: true,
      }
    }
    return {
      word: item.word,
      category: item.category,
      description: item.description,
      descTitle: 'Deskripsi Gerakan:',
      isRtl: false,
    }
  }

  const speakModalWord = (text, langCode) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const langObj = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0]
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = langObj.ttsLang
      utterance.rate = 0.9
      setIsModalSpeaking(true)
      utterance.onend = () => setIsModalSpeaking(false)
      utterance.onerror = () => setIsModalSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const renderVideoModal = () => {
    if (!activeVideoModal) return null
    const localized = getLocalizedContent(activeVideoModal, modalLang)

    return createPortal(
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) setActiveVideoModal(null)
        }}
        className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl grid grid-cols-1 lg:grid-cols-12">
          {/* Video Container */}
          <div className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:min-h-[380px] bg-black flex items-center justify-center">
            <video
              src={activeVideoModal.videoUrl}
              autoPlay
              loop
              controls
              playsInline
              className="w-full h-full max-h-[45vh] lg:max-h-[80vh] object-contain bg-black"
            />
            <button
              onClick={() => setActiveVideoModal(null)}
              className="lg:hidden absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors z-10"
              aria-label="Tutup video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info & Language Switcher */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Top Bar: Language Label + Desktop Close */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Globe className="w-4 h-4 text-violet-600" />
                  <span>Ganti Bahasa</span>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="hidden lg:flex p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Tutup video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Switcher Pills */}
              <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-xl mb-5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setModalLang(lang.code)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      modalLang === lang.code
                        ? 'bg-white text-violet-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100/70 text-violet-700">
                      {lang.short}
                    </span>
                    <span className="truncate">{lang.label}</span>
                  </button>
                ))}
              </div>

              {/* Word + Audio + Category */}
              <div
                className="flex flex-wrap items-center justify-between gap-2 mb-3"
                dir={localized.isRtl ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                    {localized.word}
                  </h3>
                  <button
                    type="button"
                    onClick={() => speakModalWord(localized.word, modalLang)}
                    className={`p-2 rounded-full transition-colors ${
                      isModalSpeaking
                        ? 'bg-violet-100 text-violet-700 animate-pulse'
                        : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700'
                    }`}
                    title="Dengarkan pengucapan"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-violet-100 text-violet-700 rounded-full whitespace-nowrap">
                  {localized.category}
                </span>
              </div>

              {/* Gesture Description */}
              <div
                className="my-4 p-4 rounded-2xl bg-gray-50 border border-gray-100"
                dir={localized.isRtl ? 'rtl' : 'ltr'}
              >
                <p className="text-xs font-bold text-gray-700 mb-1">
                  {localized.descTitle}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {localized.description}
                </p>
              </div>

              {/* Reference translations */}
              <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-100/80 space-y-1 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-400">ID</span>
                  <span className="font-medium text-gray-800">{activeVideoModal.word}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-400">EN</span>
                  <span className="font-medium text-gray-800">{activeVideoModal.transEn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-400">AR</span>
                  <span className="font-medium text-gray-800" dir="rtl">{activeVideoModal.transAr}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Akar Tuli Malang
              </span>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // ========================================================
  // DETAIL KATEGORI VIEW
  // ========================================================
  if (currentCategory) {
    const q = debouncedQuery.toLowerCase()
    const filteredWords = currentCategory.words
      .map((w) => ({
        item: w,
        score: debouncedQuery ? getVocabularyRelevance(w, q, debouncedQuery, activeLang) : 1,
      }))
      .filter((e) => e.score > 0)
      .sort((a, b) => (debouncedQuery ? b.score - a.score : 0))
      .map((e) => e.item)

    const catTitle =
      activeLang === 'en'
        ? currentCategory.titleEn || currentCategory.title
        : activeLang === 'ar'
        ? currentCategory.titleAr || currentCategory.title
        : currentCategory.title

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => {
              setSelectedCategoryId(null)
              setSearchQuery('')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Semua Kategori</span>
          </button>

          <button
            onClick={() => setIsAutoplay((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm w-fit ${
              isAutoplay
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAutoplay ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'
              }`}
            />
            <span>Autoplay: {isAutoplay ? 'Aktif' : 'Nonaktif'}</span>
          </button>
        </div>

        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
            Topik: {currentCategory.topic} • {currentCategory.words.length} Video
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {catTitle}
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {currentCategory.description}
          </p>
        </div>

        {/* 3-Language Selector in Category View */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200/80 shadow-xs">
            {LANGUAGES.map((lang) => {
              const isActive = activeLang === lang.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setActiveLang(lang.code)
                    setModalLang(lang.code)
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari dalam ${catTitle} (${LANGUAGES.find((l) => l.code === activeLang)?.short})...`}
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWords.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              activeLang={activeLang}
              isGlobalAutoplay={isAutoplay && !activeVideoModal}
              onOpenModal={handleOpenModal}
            />
          ))}
        </div>

        {renderVideoModal()}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Kamus Digital
        </h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Eksplorasi {allVocabularies.length} kosakata Bahasa Isyarat Indonesia (BISINDO) dalam{' '}
          {dictionaryCategories.length} kategori dengan dukungan terjemahan Indonesia, Inggris, dan Arab.
        </p>
      </div>

      {/* 3-Language Selector Menu (Indonesia, Inggris, Arab) */}
      <div className="max-w-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200/80 shadow-xs w-fit">
          {LANGUAGES.map((lang) => {
            const isActive = activeLang === lang.code
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setActiveLang(lang.code)
                  setModalLang(lang.code)
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Globe className="w-4 h-4 text-violet-600" />
          <span>
            Pencarian Bahasa:{' '}
            <strong className="text-violet-700 font-bold">
              {LANGUAGES.find((l) => l.code === activeLang)?.label}
            </strong>
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              LANGUAGES.find((l) => l.code === activeLang)?.placeholder ||
              'Cari kata atau kalimat...'
            }
            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {rawQuery ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Ditemukan <span className="font-semibold text-gray-900">{displayMatches.length}</span> kosakata untuk &quot;{rawQuery}&quot;
            </p>
          </div>

          {/* Banner Rangkaian Isyarat Kalimat (misal: Aku + Makan) */}
          {isSentenceMode && displayMatches.length > 1 && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border border-violet-200/80 rounded-3xl shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span>Rangkaian Isyarat Kalimat Ditemukan:</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    {displayMatches.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 bg-white border border-violet-200 text-violet-800 font-extrabold text-sm sm:text-base rounded-2xl shadow-xs">
                          {item.word}
                        </span>
                        {idx < displayMatches.length - 1 && (
                          <span className="text-violet-500 font-black text-lg">+</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-violet-600/90 font-medium">
                    Video peragaan di bawah telah diurutkan sesuai struktur kalimat yang Anda cari.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notifikasi jika ada kata yang belum tersedia / tidak ada di kamus */}
          {missingTokens.length > 0 && displayMatches.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Pemberitahuan Kata Belum Tersedia:
                </p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Kata <span className="font-extrabold underline">&quot;{missingTokens.join(', ')}&quot;</span> belum tersedia di database kamus BISINDO saat ini. Menampilkan peragaan untuk kosakata yang ditemukan di bawah ini.
                </p>
              </div>
            </div>
          )}

          {/* Notifikasi jika seluruh kata TIDAK ADA */}
          {displayMatches.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Kosakata Tidak Ditemukan
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                  Kata &quot;<strong className="text-gray-900">{rawQuery}</strong>&quot; belum tersedia dalam kamus BISINDO saat ini. Pastikan ejaan kata sudah benar atau gunakan kosakata dasar lainnya.
                </p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Hapus Pencarian
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleMatches.map((item) => (
                  <VocabularyCard
                    key={item.id}
                    item={item}
                    activeLang={activeLang}
                    isGlobalAutoplay={isAutoplay && !activeVideoModal}
                    onOpenModal={handleOpenModal}
                  />
                ))}
              </div>
              {displayMatches.length > visibleLimit && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleLimit((prev) => prev + 12)}
                    className="px-6 py-2.5 bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
                  >
                    Tampilkan Lebih Banyak ({displayMatches.length - visibleLimit} tersisa)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Semua Kategori ({dictionaryCategories.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dictionaryCategories.map((cat) => {
              const Icon = cat.icon || Folder
              return (
                <article
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 flex flex-col"
                >
                  <div className={`aspect-[16/10] ${cat.bgColor} flex flex-col items-center justify-center relative p-6`}>
                    <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                      {cat.customIconUrl ? (
                        <img
                          src={cat.customIconUrl}
                          alt={cat.title}
                          className="w-9 h-9 object-contain"
                        />
                      ) : (
                        <Icon className={`w-8 h-8 ${cat.iconColor}`} />
                      )}
                    </div>
                    <span className={`mt-3 text-[11px] font-semibold px-3 py-1 rounded-full ${cat.badgeColor}`}>
                      {cat.words.length} Video Kosakata
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-base text-gray-900 group-hover:text-violet-600 transition-colors">
                        {cat.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {cat.topic}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}

      {renderVideoModal()}
    </div>
  )
}

export default UserDictionaryPage
