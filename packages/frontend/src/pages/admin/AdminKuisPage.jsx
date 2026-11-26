import { useState, useRef } from 'react'
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Film,
  Award,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  Unlock,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import { useQuiz } from '@/context/QuizContext'

const DIFFICULTIES = ['Mudah', 'Sedang', 'Sulit']

const AdminKuisPage = () => {
  const {
    questions,
    levels,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addLevel,
    updateLevel,
    deleteLevel,
  } = useQuiz()

  // Tab: 'soal' | 'level'
  const [activeTab, setActiveTab] = useState('soal')

  // Search & Filters for Soal Kuis
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevelId, setSelectedLevelId] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  // Soal Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState('Berhasil disimpan!')
  const [expandedExplanation, setExpandedExplanation] = useState({})

  const fileInputRef = useRef(null)
  const [selectedFileName, setSelectedFileName] = useState('')

  const initialFormState = {
    question: '',
    levelId: levels[0]?.id || 1,
    difficulty: 'Mudah',
    points: 10,
    mediaType: 'video',
    mediaUrl: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  }

  const [formData, setFormData] = useState(initialFormState)

  // Level Management States
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState(null)
  const [deleteLevelConfirm, setDeleteLevelConfirm] = useState(null)

  const initialLevelForm = {
    title: `Level ${levels.length + 1}`,
    subtitle: '',
    locked: true,
    unlockRequirement: `Selesaikan Level ${levels.length} untuk membuka`,
  }

  const [levelFormData, setLevelFormData] = useState(initialLevelForm)

  // ==========================================
  // SOAL HANDLERS
  // ==========================================
  const openAddModal = () => {
    setEditingItem(null)
    setSelectedFileName('')
    setFormData({
      ...initialFormState,
      levelId: levels[0]?.id || 1,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setSelectedFileName(item.mediaUrl ? 'Video Peragaan Terpilih' : '')
    setFormData({
      question: item.question,
      levelId: item.levelId,
      difficulty: item.difficulty || 'Mudah',
      points: item.points || 10,
      mediaType: 'video',
      mediaUrl: item.mediaUrl || '',
      options: item.options ? [...item.options] : ['', '', '', ''],
      correctAnswer: item.correctAnswer ?? 0,
      explanation: item.explanation || '',
    })
    setIsModalOpen(true)
  }

  const handleMediaFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isVid =
      file.type.startsWith('video/') ||
      /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name)
    if (!isVid) {
      alert('Format file tidak valid! Harap pilih file berformat video (.mp4, .webm, .mov).')
      e.target.value = ''
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setSelectedFileName(file.name)
    setFormData((prev) => ({
      ...prev,
      mediaType: 'video',
      mediaUrl: objectUrl,
    }))
  }

  const handleOptionChange = (idx, value) => {
    setFormData((prev) => {
      const newOpts = [...prev.options]
      newOpts[idx] = value
      return { ...prev, options: newOpts }
    })
  }

  const handleSave = (e) => {
    e.preventDefault()

    if (!formData.mediaUrl) {
      alert('Media Peragaan Isyarat wajib diisi dengan file berformat video!')
      return
    }

    if (formData.options.some((opt) => !opt.trim())) {
      alert('Harap lengkapi semua 4 pilihan jawaban!')
      return
    }

    const payload = {
      question: formData.question,
      levelId: Number(formData.levelId),
      difficulty: formData.difficulty,
      points: Number(formData.points) || 10,
      mediaType: 'video',
      mediaUrl: formData.mediaUrl,
      options: formData.options,
      correctAnswer: Number(formData.correctAnswer),
      explanation: formData.explanation,
    }

    if (editingItem) {
      updateQuestion(editingItem.id, payload)
      setSaveMessage('Soal kuis berhasil diperbarui!')
    } else {
      addQuestion(payload)
      setSaveMessage('Soal kuis baru berhasil ditambahkan!')
    }

    setIsModalOpen(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleDelete = (id) => {
    deleteQuestion(id)
    setDeleteConfirm(null)
    setSaveMessage('Soal kuis berhasil dihapus.')
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const toggleExplanation = (id) => {
    setExpandedExplanation((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // ==========================================
  // LEVEL HANDLERS
  // ==========================================
  const openAddLevelModal = () => {
    setEditingLevel(null)
    const nextNumber = levels.length + 1
    setLevelFormData({
      title: `Level ${nextNumber}`,
      subtitle: '',
      locked: true,
      unlockRequirement: `Selesaikan Level ${nextNumber - 1} untuk membuka`,
    })
    setIsLevelModalOpen(true)
  }

  const openEditLevelModal = (lvl) => {
    setEditingLevel(lvl)
    setLevelFormData({
      title: lvl.title,
      subtitle: lvl.subtitle,
      locked: !!lvl.locked,
      unlockRequirement: lvl.unlockRequirement || '',
    })
    setIsLevelModalOpen(true)
  }

  const handleSaveLevel = (e) => {
    e.preventDefault()
    if (!levelFormData.title.trim() || !levelFormData.subtitle.trim()) {
      alert('Harap lengkapi Judul dan Sub-topik Level!')
      return
    }

    const payload = {
      title: levelFormData.title,
      subtitle: levelFormData.subtitle,
      locked: levelFormData.locked,
      status: levelFormData.locked ? 'terkunci' : 'lanjut',
      statusLabel: levelFormData.locked ? 'Terkunci' : 'Terbuka',
      unlockRequirement: levelFormData.unlockRequirement,
    }

    if (editingLevel) {
      updateLevel(editingLevel.id, payload)
      setSaveMessage(`Level "${payload.title}" berhasil diperbarui!`)
    } else {
      addLevel(payload)
      setSaveMessage(`Level baru "${payload.title}" berhasil ditambahkan!`)
    }

    setIsLevelModalOpen(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleDeleteLevel = (id) => {
    deleteLevel(id)
    setDeleteLevelConfirm(null)
    setSaveMessage('Level kuis berhasil dihapus.')
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      q.question.toLowerCase().includes(query) ||
      (q.explanation && q.explanation.toLowerCase().includes(query)) ||
      q.options.some((opt) => opt.toLowerCase().includes(query))

    const matchesLevel =
      selectedLevelId === 'all' || q.levelId === Number(selectedLevelId)

    const matchesDiff =
      selectedDifficulty === 'all' || q.difficulty === selectedDifficulty

    return matchesSearch && matchesLevel && matchesDiff
  })

  // Quick stats
  const totalQuestions = questions.length
  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 10), 0)
  const mediaCount = questions.filter((q) => q.mediaUrl).length
  const unlockedLevelsCount = levels.filter((l) => !l.locked).length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Manajemen Kuis
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola bank soal pertanyaan, kunci jawaban, dan tingkatan level pembelajaran BISINDO.
          </p>
        </div>

        {/* Action Button based on active subbab */}
        {activeTab === 'soal' ? (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal Kuis</span>
          </button>
        ) : (
          <button
            onClick={openAddLevelModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Level Baru</span>
          </button>
        )}
      </div>

      {/* Success Notification Toast */}
      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">{saveMessage}</p>
        </div>
      )}

      {/* Subbab Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('soal')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'soal'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-violet-600" />
          <span>Bank Soal ({totalQuestions})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('level')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'level'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4 text-violet-600" />
          <span>Tambah &amp; Kelola Level ({levels.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBBAB 1: BANK SOAL KUIS */}
      {/* ======================================================== */}
      {activeTab === 'soal' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Total Soal</span>
                <HelpCircle className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalQuestions}</p>
              <span className="text-[11px] text-gray-400">Tersedia di semua level</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Level Terbuka</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {unlockedLevelsCount} / {levels.length}
              </p>
              <span className="text-[11px] text-gray-400">Level kuis siap diakses</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Soal Bergambar</span>
                <ImageIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{mediaCount}</p>
              <span className="text-[11px] text-gray-400">Dengan peragaan visual</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Total Skor Poin</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalPoints} Poin</p>
              <span className="text-[11px] text-gray-400">Akumulasi seluruh soal</span>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pertanyaan, opsi jawaban, atau pembahasan..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  <option value="all">Semua Level</option>
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.title}: {lvl.subtitle}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  <option value="all">Semua Kesulitan</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">
                  Tidak Ada Soal Kuis Ditemukan
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Coba sesuaikan kata kunci pencarian atau buat soal baru dengan menekan tombol Tambah Soal Kuis.
                </p>
              </div>
            ) : (
              filteredQuestions.map((item, qIdx) => {
                const isExp = expandedExplanation[item.id]
                const matchedLevel = levels.find((l) => l.id === item.levelId)

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1">
                        <span className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                              {matchedLevel
                                ? `${matchedLevel.title} (${matchedLevel.subtitle})`
                                : item.levelTitle}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.difficulty === 'Mudah'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.difficulty === 'Sedang'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {item.difficulty || 'Mudah'}
                            </span>
                            <span className="text-[11px] font-medium text-gray-400">
                              +{item.points || 10} Poin
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-gray-900 leading-snug">
                            {item.question}
                          </h3>

                          {/* Media Preview if available */}
                          {item.mediaUrl && (
                            <div className="pt-1">
                              {item.mediaType === 'video' ? (
                                <div className="w-48 aspect-video rounded-xl overflow-hidden bg-black border border-gray-200">
                                  <video
                                    src={item.mediaUrl}
                                    controls
                                    preload="none"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <img
                                  src={item.mediaUrl}
                                  alt="Peragaan Soal"
                                  className="w-48 h-28 object-cover rounded-xl border border-gray-200 shadow-sm"
                                />
                              )}
                            </div>
                          )}

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {item.options.map((opt, optIdx) => {
                              const isCorrect = item.correctAnswer === optIdx
                              const letter = String.fromCharCode(65 + optIdx)
                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                                    isCorrect
                                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800 font-semibold'
                                      : 'bg-gray-50/60 border-gray-200 text-gray-700'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                      isCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                  <span className="truncate flex-1">{opt}</span>
                                  {isCorrect && (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-auto" />
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {/* Explanation toggle */}
                          {item.explanation && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => toggleExplanation(item.id)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
                              >
                                <span>Pembahasan Jawaban</span>
                                {isExp ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {isExp && (
                                <p className="mt-1.5 p-3 rounded-xl bg-violet-50/60 border border-violet-100 text-xs text-gray-700 leading-relaxed">
                                  {item.explanation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 self-end sm:self-start">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Edit Soal"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBBAB 2: MANAJEMEN & TAMBAH LEVEL KUIS */}
      {/* ======================================================== */}
      {activeTab === 'level' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Level Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-gray-400">Total Level</span>
              <p className="text-2xl font-bold text-gray-900 mt-2">{levels.length}</p>
              <span className="text-[11px] text-gray-400">Level kuis terdaftar</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-gray-400">Level Terbuka</span>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{unlockedLevelsCount}</p>
              <span className="text-[11px] text-gray-400">Dapat diakses langsung</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-gray-400">Level Terkunci</span>
              <p className="text-2xl font-bold text-gray-600 mt-2">
                {levels.length - unlockedLevelsCount}
              </p>
              <span className="text-[11px] text-gray-400">Membuka bertahap</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-gray-400">Rata-rata Soal</span>
              <p className="text-2xl font-bold text-violet-600 mt-2">
                {levels.length > 0 ? (totalQuestions / levels.length).toFixed(1) : 0}
              </p>
              <span className="text-[11px] text-gray-400">Soal per tingkatan level</span>
            </div>
          </div>

          {/* Level Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {levels.map((lvl) => {
              const questionCount = questions.filter((q) => q.levelId === lvl.id).length

              return (
                <div
                  key={lvl.id}
                  className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                          L{lvl.levelNumber || lvl.id}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-gray-900">{lvl.title}</h3>
                          <p className="text-xs font-semibold text-violet-600">
                            {lvl.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditLevelModal(lvl)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Edit Level"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteLevelConfirm(lvl.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Level"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Status & Info */}
                    <div className="space-y-2 py-3 border-y border-gray-50 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Status Akses:</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            lvl.locked
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {lvl.locked ? (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Terkunci</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Terbuka</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Jumlah Soal:</span>
                        <span className="font-bold text-gray-800">
                          {questionCount} Soal Terdaftar
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="text-gray-400 font-medium block mb-1">
                          Syarat Membuka:
                        </span>
                        <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl">
                          {lvl.unlockRequirement || (lvl.locked ? 'Selesaikan level sebelumnya' : 'Terbuka langsung untuk semua siswa')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer card: quick link to add question for this level */}
                  <div className="mt-4 pt-3 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedLevelId(String(lvl.id))
                        setActiveTab('soal')
                      }}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                    >
                      Lihat {questionCount} Soal &rarr;
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(null)
                        setSelectedFileName('')
                        setFormData({
                          ...initialFormState,
                          levelId: lvl.id,
                        })
                        setIsModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Soal</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT SOAL KUIS */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Soal Kuis' : 'Tambah Soal Kuis Baru'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Isi pertanyaan, pilihan jawaban, kunci jawaban yang benar, dan pembahasan.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pertanyaan Kuis *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Contoh: Gestur tangan di samping pelipis dengan senyuman terbuka digunakan untuk..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white resize-none"
                />
              </div>

              {/* Level Materi - full width */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Level Materi *
                </label>
                <select
                  value={formData.levelId}
                  onChange={(e) =>
                    setFormData({ ...formData, levelId: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white font-medium"
                >
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.title}: {lvl.subtitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tingkat Kesulitan + Poin Soal - 2 kolom di bawah Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white font-medium"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Poin Soal
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    step={5}
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Media Peragaan (Wajib Video) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Media Peragaan Isyarat (Video) *
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{formData.mediaUrl ? 'Ganti Video' : 'Upload Video'}</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleMediaFileChange}
                    className="hidden"
                  />

                  {formData.mediaUrl ? (
                    <div className="flex items-center gap-2 text-xs text-gray-600 truncate flex-1">
                      <span className="font-semibold text-emerald-600 shrink-0">✓ Terpilih:</span>
                      <span className="truncate">{selectedFileName || 'Video peragaan'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFileName('')
                          if (fileInputRef.current) fileInputRef.current.value = ''
                          setFormData((prev) => ({
                            ...prev,
                            mediaType: 'video',
                            mediaUrl: '',
                          }))
                        }}
                        className="text-rose-500 hover:text-rose-700 ml-auto shrink-0 font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Wajib mengunggah video peragaan (.mp4, .webm, .mov)
                    </span>
                  )}
                </div>

                {formData.mediaUrl && (
                  <div className="mt-2.5 w-44 aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-900 flex items-center justify-center">
                    <video
                      src={formData.mediaUrl}
                      className="w-full h-full object-contain"
                      controls
                    />
                  </div>
                )}
              </div>

              {/* 4 Pilihan Jawaban */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700">
                    Pilihan Jawaban (Pilih salah satu lingkaran sebagai kunci jawaban benar) *
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    Kunci Benar: Pilihan {String.fromCharCode(65 + formData.correctAnswer)}
                  </span>
                </div>

                {formData.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx)
                  const isChecked = formData.correctAnswer === idx
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-2 rounded-xl border transition-colors ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={isChecked}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              correctAnswer: idx,
                            }))
                          }
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {letter}
                        </span>
                      </label>

                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Jawaban Pilihan ${letter}...`}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                      />
                    </div>
                  )
                })}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pembahasan / Alasan Jawaban Benar
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  placeholder="Jelaskan secara ringkas mengapa jawaban tersebut benar untuk membantu pemahaman siswa..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingItem ? 'Simpan Perubahan' : 'Tambah Soal Kuis'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT LEVEL KUIS */}
      {/* ======================================================== */}
      {isLevelModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLevelModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingLevel ? 'Edit Level Kuis' : 'Tambah Level Baru'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tentukan judul, sub-topik materi, dan status buka kunci level.
                </p>
              </div>
              <button
                onClick={() => setIsLevelModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLevel} className="space-y-4">
              {/* Nama Level — read-only saat tambah, editable saat edit */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama / Judul Level
                </label>
                <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-semibold flex items-center gap-2">
                  <span className="text-violet-600">🏆</span>
                  {levelFormData.title}
                  {!editingLevel && (
                    <span className="ml-auto text-[10px] text-gray-400 font-normal">Urutan otomatis</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Sub-Topik / Materi Pokok *
                </label>
                <input
                  type="text"
                  required
                  value={levelFormData.subtitle}
                  onChange={(e) =>
                    setLevelFormData({
                      ...levelFormData,
                      subtitle: e.target.value,
                    })
                  }
                  placeholder="Contoh: Percakapan Formal & Tata Bahasa"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                />
              </div>

              {/* Syarat Kunci — read-only, otomatis dari level sebelumnya */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Syarat Membuka Kunci Level
                </label>
                <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span>{levelFormData.unlockRequirement || 'Terbuka untuk semua'}</span>
                  <span className="ml-auto text-[10px] text-gray-400 shrink-0">Otomatis</span>
                </div>
              </div>

              {/* Status Buka Kunci — read-only, tampilan informatif */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Status Buka Kunci
                </label>
                <div className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                  levelFormData.locked
                    ? 'bg-violet-50 border-violet-200 text-violet-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {levelFormData.locked
                    ? <><Lock className="w-3.5 h-3.5" /><span>Terkunci (Bertahap) — harus selesaikan level sebelumnya</span></>
                    : <><Unlock className="w-3.5 h-3.5" /><span>Terbuka Bebas — dapat diakses langsung</span></>
                  }
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingLevel ? 'Simpan Level' : 'Tambah Level'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI HAPUS SOAL */}
      {/* ======================================================== */}
      {deleteConfirm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Hapus Soal Kuis Ini?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tindakan ini tidak dapat dibatalkan. Soal akan dihapus dari bank soal latihan siswa.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI HAPUS LEVEL */}
      {/* ======================================================== */}
      {deleteLevelConfirm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteLevelConfirm(null)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Hapus Level Kuis Ini?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tindakan ini akan menghapus tingkatan level dari portal belajar siswa.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteLevelConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteLevel(deleteLevelConfirm)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminKuisPage
