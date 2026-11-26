import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Play,
  BookOpen,
  Sparkles,
  X,
  Volume2,
  Globe,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { dictionaryCategories, allVocabularies } from '@/data/vocabularies'

const ITEMS_PER_PAGE = 18

const categories = ['Semua', ...dictionaryCategories.map((c) => c.title)]

const LANGUAGES = [
  {
    code: 'id',
    label: 'Indonesia',
    short: 'ID',
    flag: '🇮🇩',
    ttsLang: 'id-ID',
    placeholder: 'Cari kosakata Bahasa Indonesia (contoh: belajar, ibu, makan)...',
  },
  {
    code: 'en',
    label: 'English',
    short: 'EN',
    flag: '🇬🇧',
    ttsLang: 'en-US',
    placeholder: 'Search in English (e.g., I, learn, mother, eat)...',
  },
  {
    code: 'ar',
    label: 'العربية',
    short: 'AR',
    flag: '🇸🇦',
    ttsLang: 'ar-SA',
    placeholder: 'ابحث باللغة العربية (مثال: أنا، أكل، أم)...',
  },
]

const splitTokens = (str) =>
  String(str || '')
    .toLowerCase()
    .split(/[\s,/;+()\-]+/)
    .map((t) => t.trim())
    .filter(Boolean)

const getVocabularyRelevance = (item, qLower, rawQuery, activeLang = 'id') => {
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

const KamusPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCatParam = searchParams.get('kategori')
  const [activeLang, setActiveLang] = useState('id') // 'id' | 'en' | 'ar'

  const resolveCategoryFromParam = (param) => {
    if (!param) return 'Semua'
    const found = dictionaryCategories.find(
      (c) => c.id.toLowerCase() === param.toLowerCase() || c.title.toLowerCase() === param.toLowerCase()
    )
    return found ? found.title : 'Semua'
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState(() =>
    resolveCategoryFromParam(initialCatParam)
  )
  const [activeWord, setActiveWord] = useState(null)
  const [modalLang, setModalLang] = useState('id') // 'id' | 'en' | 'ar'
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    setSelectedCategory(resolveCategoryFromParam(initialCatParam))
    setCurrentPage(1)
  }, [initialCatParam])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveWord(null)
    }
    if (activeWord) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeWord])

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
    if (cat === 'Semua') {
      searchParams.delete('kategori')
      setSearchParams(searchParams, { replace: true })
    } else {
      const found = dictionaryCategories.find((c) => c.title === cat)
      if (found) {
        setSearchParams({ kategori: found.id }, { replace: true })
      }
    }
  }

  const handleOpenWord = (item) => {
    setModalLang('id')
    setActiveWord(item)
  }

  const getLocalizedContent = (item, lang) => {
    if (!item) return { word: '', category: '', description: '', isRtl: false }
    if (lang === 'en') {
      return {
        word: item.transEn || item.word,
        category: item.categoryEn || item.category,
        description: item.descriptionEn || item.description,
        isRtl: false,
      }
    }
    if (lang === 'ar') {
      return {
        word: item.transAr || item.word,
        category: item.categoryAr || item.category,
        description: item.descriptionAr || item.description,
        isRtl: true,
      }
    }
    return {
      word: item.word,
      category: item.category,
      description: item.description,
      isRtl: false,
    }
  }

  const speakWord = (text, langCode) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const langObj = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0]
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = langObj.ttsLang
      utterance.rate = 0.9
      setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 220)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const rawQuery = debouncedSearch.trim()
  const { filteredWords, isSentenceMode, missingTokens } = useMemo(() => {
    const qLower = rawQuery.toLowerCase()
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

    let words = []
    let sentenceMode = false

    if (isMultiToken && multiWordFound.length > 0) {
      words = multiWordFound
      sentenceMode = true
    } else {
      words = allVocabularies
        .map((item) => {
          const matchesCategory =
            selectedCategory === 'Semua' || item.category === selectedCategory
          if (!matchesCategory) return { item, score: 0 }

          const score = rawQuery
            ? getVocabularyRelevance(item, qLower, rawQuery, activeLang)
            : 1
          return { item, score }
        })
        .filter((e) => e.score > 0)
        .sort((a, b) => (rawQuery ? b.score - a.score : 0))
        .map((e) => e.item)

      if (rawQuery && words.length === 0) {
        missing = tokens.length > 0 ? tokens : [rawQuery]
      }
    }

    return {
      filteredWords: words,
      isSentenceMode: sentenceMode,
      missingTokens: missing,
    }
  }, [rawQuery, selectedCategory, activeLang])

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE) || 1
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const paginatedWords = filteredWords.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  )

  const localized = getLocalizedContent(activeWord, modalLang)

  return (
    <div className="bg-gray-50/50 min-h-screen py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Kamus Kosakata BISINDO ({allVocabularies.length} Video)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Eksplorasi Kosakata Bahasa Isyarat
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Temukan panduan gestur BISINDO lengkap dalam {dictionaryCategories.length} kategori dengan video peragaan asli serta terjemahan Indonesia, Inggris, dan Arab.
          </p>
        </div>

        {/* 3-Language Selector & Search Bar */}
        <div className="mt-10 max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex p-1 bg-white rounded-2xl border border-gray-200/80 shadow-xs w-fit">
              {LANGUAGES.map((lang) => {
                const isActive = activeLang === lang.code
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setActiveLang(lang.code)
                      setModalLang(lang.code)
                      setCurrentPage(1)
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-sm'
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
                Bahasa Pencarian:{' '}
                <strong className="text-violet-700 font-bold">
                  {LANGUAGES.find((l) => l.code === activeLang)?.label}
                </strong>
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={
                LANGUAGES.find((l) => l.code === activeLang)?.placeholder ||
                'Cari kosakata...'
              }
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-gray-900 text-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Vocabulary Grid */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Menampilkan <span className="font-semibold text-gray-800">{filteredWords.length}</span> kosakata
              {selectedCategory !== 'Semua' && (
                <span>
                  {' '}di kategori <span className="font-semibold text-violet-600">{selectedCategory}</span>
                </span>
              )}
            </p>
            <Link
              to="/kuis"
              className="text-xs sm:text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              Uji pemahaman di Kuis &rarr;
            </Link>
          </div>

          {/* Banner Rangkaian Isyarat Kalimat (misal: Aku + Makan) */}
          {isSentenceMode && filteredWords.length > 1 && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border border-violet-200/80 rounded-2xl shadow-sm mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span>Rangkaian Isyarat Kalimat Ditemukan:</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    {filteredWords.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white border border-violet-200 text-violet-800 font-extrabold text-sm sm:text-base rounded-xl shadow-xs">
                          {item.word}
                        </span>
                        {idx < filteredWords.length - 1 && (
                          <span className="text-violet-500 font-black text-lg">+</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-violet-600/90 font-medium">
                    Video di bawah telah diurutkan sesuai urutan kata dalam kalimat yang Anda cari.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notifikasi jika ada kata yang belum tersedia */}
          {missingTokens.length > 0 && filteredWords.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 mb-6 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Pemberitahuan Kata Belum Tersedia:
                </p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Kata <span className="font-extrabold underline">&quot;{missingTokens.join(', ')}&quot;</span> belum tersedia di database kamus BISINDO. Menampilkan hasil peragaan untuk kata yang ditemukan di bawah ini.
                </p>
              </div>
            </div>
          )}

          {filteredWords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Kosakata Tidak Ditemukan
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                  Kata &quot;<strong className="text-gray-900">{rawQuery}</strong>&quot; belum tersedia dalam kamus BISINDO saat ini. Pastikan ejaan kata sudah benar atau coba cari kata dasar lainnya.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('')
                  handleSelectCategory('Semua')
                }}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedWords.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => handleOpenWord(item)}
                    className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Video Preview */}
                      <div className="relative aspect-[16/10] bg-gray-900 overflow-hidden">
                        <video
                          src={item.videoUrl}
                          muted
                          loop
                          playsInline
                          preload="none"
                          onMouseEnter={(e) => {
                            if (!activeWord) e.currentTarget.play().catch(() => {})
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause()
                            e.currentTarget.currentTime = 0
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-violet-600 group-hover:scale-110 group-hover:opacity-0 transition-all">
                            <Play className="w-5 h-5 fill-violet-600 translate-x-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                          ID • EN • AR
                        </span>
                      </div>

                      {/* Word Details */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors"
                          >
                            {activeLang === 'en'
                              ? item.transEn || item.word
                              : activeLang === 'ar'
                              ? item.transAr || item.word
                              : item.word}
                          </h3>
                          <span className="text-xs font-medium px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full">
                            {activeLang === 'en'
                              ? item.categoryEn || item.category
                              : activeLang === 'ar'
                              ? item.categoryAr || item.category
                              : item.category}
                          </span>
                        </div>
                        <p
                          className="text-xs text-gray-400 font-medium mb-2"
                          dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                        >
                          {activeLang === 'en'
                            ? `${item.word} • ${item.transAr}`
                            : activeLang === 'ar'
                            ? `${item.word} • ${item.transEn}`
                            : `${item.transEn} • ${item.transAr}`}
                        </p>
                        <p
                          className="text-sm text-gray-600 line-clamp-2 leading-relaxed"
                          dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                        >
                          {activeLang === 'en'
                            ? item.descriptionEn || item.description
                            : activeLang === 'ar'
                            ? item.descriptionAr || item.description
                            : item.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-0">
                      <button className="w-full py-2 bg-gray-50 group-hover:bg-violet-600 group-hover:text-white text-gray-700 text-xs font-semibold rounded-xl transition-colors">
                        Lihat Detail &amp; Peragaan
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Menampilkan{' '}
                    <span className="font-semibold text-gray-800">
                      {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>{' '}
                    -{' '}
                    <span className="font-semibold text-gray-800">
                      {Math.min(
                        validCurrentPage * ITEMS_PER_PAGE,
                        filteredWords.length
                      )}
                    </span>{' '}
                    dari{' '}
                    <span className="font-semibold text-gray-800">
                      {filteredWords.length}
                    </span>{' '}
                    kosakata
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1))
                        window.scrollTo({ top: 320, behavior: 'smooth' })
                      }}
                      disabled={validCurrentPage === 1}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Sebelumnya</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (totalPages <= 7) return true
                          if (page === 1 || page === totalPages) return true
                          return Math.abs(page - validCurrentPage) <= 1
                        })
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1]
                          const showEllipsis = prevPage && page - prevPage > 1
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-1 text-gray-400 text-xs">...</span>
                              )}
                              <button
                                onClick={() => {
                                  setCurrentPage(page)
                                  window.scrollTo({ top: 320, behavior: 'smooth' })
                                }}
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-semibold transition-all ${
                                  validCurrentPage === page
                                    ? 'bg-violet-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          )
                        })}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                        window.scrollTo({ top: 320, behavior: 'smooth' })
                      }}
                      disabled={validCurrentPage === totalPages}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Vocabulary Detail Modal with Fullscreen Blur & Responsive Layout */}
      {activeWord &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveWord(null)
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:min-h-[380px] bg-black flex items-center justify-center">
                <video
                  src={activeWord.videoUrl}
                  autoPlay
                  loop
                  controls
                  playsInline
                  className="w-full h-full max-h-[45vh] lg:max-h-[80vh] object-contain bg-black"
                />
                <button
                  onClick={() => setActiveWord(null)}
                  className="lg:hidden absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors z-10"
                  aria-label="Tutup video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Globe className="w-4 h-4 text-violet-600" />
                      <span>Ganti Bahasa</span>
                    </div>
                    <button
                      onClick={() => setActiveWord(null)}
                      className="hidden lg:flex p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      aria-label="Tutup video"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

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

                  <div
                    className="flex flex-wrap items-center justify-between gap-2 mb-3"
                    dir={localized.isRtl ? 'rtl' : 'ltr'}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{localized.word}</h3>
                      <button
                        type="button"
                        onClick={() => speakWord(localized.word, modalLang)}
                        className={`p-2 rounded-full transition-colors ${
                          isSpeaking
                            ? 'bg-violet-100 text-violet-700 animate-pulse'
                            : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700'
                        }`}
                        title="Dengarkan pengucapan"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 bg-violet-100 text-violet-700 rounded-full whitespace-nowrap">
                      {localized.category}
                    </span>
                  </div>

                  <p
                    className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100"
                    dir={localized.isRtl ? 'rtl' : 'ltr'}
                  >
                    {localized.description}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-violet-50/50 border border-violet-100/80 space-y-1 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-400">ID</span>
                      <span className="font-medium text-gray-800">{activeWord.word}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-400">EN</span>
                      <span className="font-medium text-gray-800">{activeWord.transEn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-400">AR</span>
                      <span className="font-medium text-gray-800" dir="rtl">{activeWord.transAr}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => setActiveWord(null)}
                    className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    Tutup
                  </button>
                  <Link
                    to="/kuis"
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition-colors text-center"
                  >
                    Latihan Kuis
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default KamusPage
