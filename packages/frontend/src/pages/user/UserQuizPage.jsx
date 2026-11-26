import { useState, useRef } from 'react'
import { useQuiz } from '@/context/QuizContext'
import { resolveVideoUrl } from '@/lib/supabase'
import {
  Play,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowRight,
  Hand,
  Award,
  Lock,
  Star,
  Layers,
  Sparkle,
  AlertCircle,
  X,
} from 'lucide-react'

const initialLevels = [
  {
    id: 1,
    levelNumber: 1,
    title: 'Level 1',
    subtitle: 'Dasar & Alfabet',
    status: 'selesai', // 'selesai' | 'lanjut' | 'terkunci'
    statusLabel: 'Selesai',
    scoreLabel: 'Skor Tertinggi',
    score: '95/100',
    progress: 100,
    locked: false,
    questions: [
      {
        question: 'Perhatikan video peragaan BISINDO berikut. Kata ganti orang apakah yang sedang diisyaratkan?',
        mediaType: 'video',
        mediaUrl: resolveVideoUrl('/videos/pronomina/aku.mp4'),
        options: ['Aku / Saya', 'Kamu', 'Mereka', 'Dia'],
        correctAnswer: 0,
        explanation: 'Gerakan jari telunjuk mengarah ke dada sendiri menunjukkan kata ganti orang pertama tunggal "Aku / Saya" dalam BISINDO.',
      },
      {
        question: 'Amati gerakan tangan pada video berikut. Isyarat tersebut berarti:',
        mediaType: 'video',
        mediaUrl: resolveVideoUrl('/videos/pronomina/kamu.mp4'),
        options: ['Kamu', 'Aku', 'Kalian', 'Ibu'],
        correctAnswer: 0,
        explanation: 'Isyarat "Kamu" dilakukan dengan mengarahkan jari telunjuk lurus ke arah lawan bicara.',
      },
    ],
  },
  {
    id: 2,
    levelNumber: 2,
    title: 'Level 2',
    subtitle: 'Keluarga & Sapaan',
    status: 'lanjut',
    statusLabel: 'Lanjut',
    scoreLabel: 'Skor Rata-rata',
    score: '78/100',
    progress: 45,
    locked: false,
    questions: [
      {
        question: 'Perhatikan video isyarat anggota keluarga berikut. Kosakata apakah yang diperagakan?',
        mediaType: 'video',
        mediaUrl: resolveVideoUrl('/videos/Keluarga/kakek.mp4'),
        options: ['Adik Laki-laki', 'Kakek', 'Nenek', 'Anak'],
        correctAnswer: 1,
        explanation: 'Video tersebut memperagakan isyarat BISINDO untuk anggota keluarga "Kakek".',
      },
      {
        question: 'Isyarat untuk kata "Ibu" dalam BISINDO diperagakan pada video berikut. Di manakah posisi gerakan tangannya?',
        mediaType: 'video',
        mediaUrl: resolveVideoUrl('/videos/Keluarga/ibu.mp4'),
        options: ['Dahi', 'Dagu / Pipi bawah', 'Dada', 'Bahu'],
        correctAnswer: 1,
        explanation: 'Isyarat Ibu dilakukan di area dagu/pipi bagian bawah dengan gerakan lembut seperti pada video.',
      },
      {
        question: 'Amati video peragaan berikut. Isyarat apakah yang ditampilkan untuk anggota keluarga ini?',
        mediaType: 'video',
        mediaUrl: resolveVideoUrl('/videos/Keluarga/bapak.mp4'),
        options: ['Ayah / Bapak', 'Kakak Perempuan', 'Adik', 'Ibu'],
        correctAnswer: 0,
        explanation: 'Isyarat Ayah / Bapak dilakukan dengan gerakan di area dahi/wajah bagian atas seperti pada video.',
      },
    ],
  },
  {
    id: 3,
    levelNumber: 3,
    title: 'Level 3',
    subtitle: 'Waktu & Hari',
    status: 'terkunci',
    statusLabel: 'Terkunci',
    locked: true,
    unlockRequirement: 'Selesaikan Level 2 untuk membuka',
  },
  {
    id: 4,
    levelNumber: 4,
    title: 'Level 4',
    subtitle: 'Aktivitas Harian',
    status: 'terkunci',
    statusLabel: 'Terkunci',
    locked: true,
    unlockRequirement: 'Selesaikan Level 3 untuk membuka',
  },
  {
    id: 5,
    levelNumber: 5,
    title: 'Level 5',
    subtitle: 'Emosi & Perasaan',
    status: 'terkunci',
    statusLabel: 'Terkunci',
    locked: true,
    unlockRequirement: 'Selesaikan Level 4 untuk membuka',
  },
  {
    id: 6,
    levelNumber: 6,
    title: 'Level 6',
    subtitle: 'Kalimat Kompleks',
    status: 'terkunci',
    statusLabel: 'Terkunci',
    locked: true,
    unlockRequirement: 'Selesaikan Level 5 untuk membuka',
  },
]

const quizCategoriesData = [
  {
    id: 'alfabet',
    title: 'Alfabet (A-Z)',
    questionsCount: '20 Soal',
    description: 'Latihan dasar mengenali dan mempraktikkan huruf abjad BISINDO.',
    progress: 100,
    badgeType: 'text',
    badgeText: 'AZ',
    badgeBg: 'bg-violet-100 text-violet-700',
  },
  {
    id: 'sapaan',
    title: 'Sapaan Sehari-hari',
    questionsCount: '15 Soal',
    description: 'Kuasai cara menyapa, menanyakan kabar, dan frasa sopan santun dasar.',
    progress: 40,
    badgeType: 'icon',
    badgeBg: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'angka-waktu',
    title: 'Angka & Waktu',
    questionsCount: '25 Soal',
    description: 'Pelajari cara menyatakan jumlah, jam, hari, dan bulan dalam isyarat.',
    progress: 0,
    badgeType: 'clock',
    badgeBg: 'bg-purple-100 text-purple-600',
  },
]

const UserQuizPage = () => {
  const { questions: contextQuestions, levels, saveLevelProgress } = useQuiz()
  const [activeTab, setActiveTab] = useState('level') // 'level' | 'interaktif'

  // Interactive Quiz Player State
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [activeQuizTitle, setActiveQuizTitle] = useState('Level 2: Keluarga & Sapaan')
  const [activeQuestions, setActiveQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [activeLevelId, setActiveLevelId] = useState(null)
  const [quizResultModal, setQuizResultModal] = useState(null)
  const quizStartTimeRef = useRef(Date.now())
  // { type: 'below_kkm' | 'level_unlocked', levelId, levelTitle, nextLevelTitle, currentScore, highestScore, correctCount, totalQ }

  const startLevelQuiz = (level) => {
    if (level.locked) return
    quizStartTimeRef.current = Date.now()
    setActiveLevelId(level.id)
    setActiveQuizTitle(`${level.title}: ${level.subtitle}`)
    const levelQuestions = contextQuestions.filter((q) => q.levelId === level.id)
    const questionsToUse =
      levelQuestions.length > 0
        ? levelQuestions
        : level.questions || initialLevels[1].questions
    setActiveQuestions(questionsToUse)
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setQuizFinished(false)
    setIsQuizActive(true)
  }

  const startFeaturedQuiz = (title = 'Ekspresi Wajah Dasar') => {
    quizStartTimeRef.current = Date.now()
    setActiveLevelId(null)
    setActiveQuizTitle(title)
    setActiveQuestions(initialLevels[1].questions)
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setQuizFinished(false)
    setIsQuizActive(true)
  }

  const handleSelectOption = (index) => {
    if (isAnswerSubmitted) return
    setSelectedOption(index)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null) return
    setIsAnswerSubmitted(true)
    if (selectedOption === activeQuestions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerSubmitted(false)
    } else {
      const totalQ = activeQuestions.length
      const calculatedScore = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0
      const isPassed = calculatedScore >= 75

      // Jika mengerjakan level resmi
      if (activeLevelId) {
        // Cari index level sekarang
        const currentIdx = levels.findIndex((l) => l.id === activeLevelId)
        const currentLvl = levels[currentIdx]
        const nextLvl = currentIdx !== -1 && currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null

        // Parse previous best score if exists (e.g., '95/100' -> 95)
        let prevBest = 0
        if (currentLvl?.score) {
          const matched = String(currentLvl.score).match(/^(\d+)/)
          if (matched) prevBest = parseInt(matched[1], 10)
        }

        // Ambil nilai tertinggi antara pengerjaan sebelumnya dan pengerjaan sekarang
        const highestScore = Math.max(prevBest, calculatedScore)
        const hasPassedEver = currentLvl?.status === 'selesai' || isPassed
        const wasNextLockedBefore = nextLvl?.locked

        // Simpan progres ke QuizContext (otomatis persist ke localStorage & Supabase)
        const durationSeconds = Math.max(10, Math.round((Date.now() - quizStartTimeRef.current) / 1000))
        await saveLevelProgress(activeLevelId, calculatedScore, totalQ, score, durationSeconds)

        // Tutup interactive player kuis
        setIsQuizActive(false)
        setQuizFinished(false)

        if (!isPassed) {
          // KONDISI 1: NILAI DI BAWAH KKM -> Tampilkan POP-UP Nilai di Bawah KKM (ambil nilai tertinggi)
          setQuizResultModal({
            type: 'below_kkm',
            levelId: activeLevelId,
            levelTitle: currentLvl?.title ? `${currentLvl.title}: ${currentLvl.subtitle}` : activeQuizTitle,
            currentScore: calculatedScore,
            highestScore,
            totalQ,
            correctCount: score,
          })
        } else {
          // KONDISI 2: NILAI LULUS KKM (>= 75) -> Tampilkan POP-UP Berhasil Membuka Level Berikutnya
          setQuizResultModal({
            type: 'level_unlocked',
            levelId: activeLevelId,
            levelTitle: currentLvl?.title ? `${currentLvl.title}: ${currentLvl.subtitle}` : activeQuizTitle,
            nextLevelTitle: nextLvl ? `${nextLvl.title}: ${nextLvl.subtitle}` : null,
            nextLevel: nextLvl,
            currentScore: calculatedScore,
            highestScore,
            totalQ,
            correctCount: score,
            isNewUnlock: wasNextLockedBefore,
          })
        }
        return
      }

      // Jika kuis non-level (misal featured quiz)
      setQuizFinished(true)
    }
  }

  const handleExitQuiz = () => {
    setIsQuizActive(false)
  }

  return (
    <div className="space-y-8">
      {/* ======================================================== */}
      {/* MODAL POP-UP HASIL KUIS (DI BAWAH KKM / BERHASIL BUKA LEVEL) */}
      {/* ======================================================== */}
      {quizResultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center relative animate-in zoom-in-95 duration-200">
            {/* Tombol Tutup X */}
            <button
              onClick={() => setQuizResultModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {quizResultModal.type === 'below_kkm' ? (
              /* KASUS 1: NILAI DI BAWAH KKM */
              <div>
                <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 mb-2">
                  Nilai di Bawah KKM (75)
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Belum Memenuhi Batas KKM
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  {quizResultModal.levelTitle}
                </p>

                {/* Score Summary Box */}
                <div className="my-5 p-5 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <p className="text-4xl font-black text-rose-600">
                    {quizResultModal.currentScore}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    {quizResultModal.correctCount} dari {quizResultModal.totalQ} Soal Terjawab Benar
                  </p>
                  <div className="mt-3 pt-3 border-t border-rose-200/60 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Skor Tertinggi Tersimpan:</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2.5 py-0.5 rounded-lg border border-rose-200 shadow-xs">
                      {quizResultModal.highestScore}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 leading-relaxed mb-6 text-left">
                  <strong>Pemberitahuan:</strong> Nilai pengerjaan saat ini belum mencapai standar KKM <strong>75%</strong>, sehingga level berikutnya belum dapat dibuka. Sistem tetap menyimpan <strong>skor tertinggi ({quizResultModal.highestScore}%)</strong> Anda. Silakan kerjakan ulang!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      const targetLevel = levels.find((l) => l.id === quizResultModal.levelId)
                      setQuizResultModal(null)
                      if (targetLevel) startLevelQuiz(targetLevel)
                    }}
                    className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Ulangi Kuis</span>
                  </button>
                  <button
                    onClick={() => setQuizResultModal(null)}
                    className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              /* KASUS 2: NILAI LULUS KKM (BERHASIL BUKA LEVEL BERIKUTNYA) */
              <div>
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mb-2">
                  Status: LULUS (KKM $\ge$ 75)
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Selamat! Anda Lulus Kuis
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  {quizResultModal.levelTitle}
                </p>

                {/* Score Summary Box */}
                <div className="my-5 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-4xl font-black text-emerald-600">
                    {quizResultModal.currentScore}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    {quizResultModal.correctCount} dari {quizResultModal.totalQ} Soal Terjawab Benar
                  </p>
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Skor Tertinggi Tersimpan:</span>
                    <span className="font-extrabold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-xs">
                      {quizResultModal.highestScore}%
                    </span>
                  </div>
                </div>

                {quizResultModal.nextLevelTitle ? (
                  <div className="p-3.5 bg-violet-50 border border-violet-200 rounded-2xl mb-6 text-left flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-violet-900">
                        🎉 Selamat! Anda Berhasil Membuka Level Berikutnya:
                      </p>
                      <p className="text-xs text-violet-700 mt-0.5 font-semibold">
                        {quizResultModal.nextLevelTitle}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 leading-relaxed mb-6">
                    🎉 Luar biasa! Anda telah menyelesaikan seluruh tingkatan materi kuis BISINDO dengan predikat sangat memuaskan!
                  </p>
                )}

                <div className={`grid gap-2.5 ${quizResultModal.nextLevel ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {quizResultModal.nextLevel && (
                    <button
                      onClick={() => {
                        const targetNext = quizResultModal.nextLevel
                        setQuizResultModal(null)
                        startLevelQuiz(targetNext)
                      }}
                      className="w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2"
                    >
                      <span>Level Berikutnya</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                  <button
                    onClick={() => setQuizResultModal(null)}
                    className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Modal / Interactive Player Overlay */}
      {isQuizActive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            {!quizFinished ? (
              <div>
                {/* Quiz Header Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                      {activeQuizTitle}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Pertanyaan {currentQuestionIndex + 1} dari {activeQuestions.length}
                    </p>
                  </div>
                  <button
                    onClick={handleExitQuiz}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Keluar Kuis
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-violet-600 transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Media Video / Image */}
                {(() => {
                  const currentQ = activeQuestions[currentQuestionIndex]
                  const mediaSrc = currentQ.mediaUrl || currentQ.image
                  if (!mediaSrc || currentQ.mediaType === 'none') return null
                  const isVideo =
                    currentQ.mediaType === 'video' ||
                    mediaSrc.toLowerCase().endsWith('.mp4') ||
                    mediaSrc.startsWith('blob:') ||
                    mediaSrc.startsWith('data:video')

                  return (
                    <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-gray-900 mb-6 relative">
                      {isVideo ? (
                        <video
                          key={mediaSrc}
                          src={mediaSrc}
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={mediaSrc}
                          alt="Soal Kuis BISINDO"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )
                })()}

                {/* Question */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  {activeQuestions[currentQuestionIndex].question}
                </h3>

                {/* Options List */}
                <div className="space-y-3 mb-6">
                  {activeQuestions[currentQuestionIndex].options.map((option, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrect = idx === activeQuestions[currentQuestionIndex].correctAnswer
                    let btnStyle = 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-semibold'
                      }
                    } else if (isSelected) {
                      btnStyle = 'border-violet-600 bg-violet-50 text-violet-900 font-semibold shadow-sm'
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between text-sm ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation */}
                {isAnswerSubmitted && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                    <span className="font-bold text-gray-900">Penjelasan: </span>
                    {activeQuestions[currentQuestionIndex].explanation}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedOption === null}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-violet-600/20"
                    >
                      Periksa Jawaban
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-violet-600/20 flex items-center gap-2"
                    >
                      <span>
                        {currentQuestionIndex < activeQuestions.length - 1
                          ? 'Soal Berikutnya'
                          : 'Selesai & Simpan Progres'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Finished Result Screen with KKM = 75 Rule */
              (() => {
                const totalQ = activeQuestions.length
                const calculatedScore = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0
                const isPassed = calculatedScore >= 75
                const currentIdx = activeLevelId ? levels.findIndex((l) => l.id === activeLevelId) : -1
                const nextLevel = currentIdx !== -1 && currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null

                return (
                  <div className="text-center py-6 animate-in zoom-in-95 duration-200">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {isPassed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900">
                      {isPassed ? 'Selamat, Anda Lulus Kuis!' : 'Belum Memenuhi Nilai KKM'}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                      {isPassed
                        ? `Luar biasa! Skor Anda di atas KKM (75). ${
                            nextLevel ? `${nextLevel.title} kini telah terbuka!` : 'Semua tingkatan telah diselesaikan!'
                          }`
                        : 'Nilai Anda belum mencapai standar KKM (75). Silakan pelajari kembali peragaan isyarat dan kerjakan ulang kuis ini.'}
                    </p>

                    {/* Notifikasi Alert jika di bawah KKM */}
                    {!isPassed && (
                      <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl max-w-md mx-auto flex items-center gap-2.5 text-left text-xs text-amber-800">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>
                          <strong>Perhatian:</strong> Level berikutnya tetap terkunci. Anda wajib mengulang kuis sampai mendapatkan nilai minimal <strong>75</strong>.
                        </span>
                      </div>
                    )}

                    {/* Score Circular Box */}
                    <div
                      className={`my-6 inline-block p-6 rounded-3xl border ${
                        isPassed
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : 'bg-rose-50/50 border-rose-100'
                      }`}
                    >
                      <p
                        className={`text-5xl font-black ${
                          isPassed ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {calculatedScore}%
                      </p>
                      <p className="text-xs font-semibold text-gray-600 mt-1">
                        {score} dari {totalQ} Soal Terjawab Benar
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="text-[11px] font-semibold text-gray-400">Standar KKM: 75%</span>
                        <span
                          className={`px-3 py-0.5 rounded-full font-bold text-xs ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isPassed ? 'Status: LULUS' : 'Status: TIDAK LULUS'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setCurrentQuestionIndex(0)
                          setSelectedOption(null)
                          setIsAnswerSubmitted(false)
                          setScore(0)
                          setQuizFinished(false)
                        }}
                        className={`w-full sm:w-auto px-6 py-2.5 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                          !isPassed
                            ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{isPassed ? 'Mainkan Ulang' : 'Kerjakan Ulang Sekarang'}</span>
                      </button>

                      <button
                        onClick={handleExitQuiz}
                        className={`w-full sm:w-auto px-6 py-2.5 font-semibold text-sm rounded-xl transition-colors ${
                          isPassed
                            ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        Kembali ke Level Kuis
                      </button>
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      )}

      {/* View Switcher: Level Kuis vs Kuis Interaktif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('level')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'level'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Level Kuis (Tingkatan)
          </button>
          <button
            onClick={() => setActiveTab('interaktif')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'interaktif'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Kuis Unggulan & Kategori
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: LEVEL KUIS (Matches media_1792859362867.png) */}
      {/* ======================================================== */}
      {activeTab === 'level' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Level Kuis
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-2xl leading-relaxed">
              Uji pemahaman BISINDO Anda. Selesaikan level sebelumnya untuk membuka tantangan baru.
            </p>
          </div>

          {/* 6 Level Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((lvl) => {
              const isFinished = lvl.status === 'selesai'
              const isInProgress = lvl.status === 'lanjut'
              const isLocked = lvl.status === 'terkunci'

              return (
                <div
                  key={lvl.id}
                  className={`relative rounded-3xl border transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between ${
                    isLocked
                      ? 'bg-gray-50/70 border-gray-100 opacity-90'
                      : 'bg-white border-gray-100 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Top Status Pill */}
                    <div className="flex items-center justify-between mb-4">
                      {isFinished && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Selesai
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                          <Play className="w-3 h-3 fill-current" />
                          Lanjut
                        </span>
                      )}
                      {isLocked && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200/70 text-gray-500">
                          <Lock className="w-3.5 h-3.5" />
                          Terkunci
                        </span>
                      )}

                      {/* Decorative star for Level 1 */}
                      {isFinished && (
                        <Star className="w-12 h-12 text-purple-100 -mr-1 -mt-1 stroke-[1.5]" />
                      )}
                    </div>

                    {/* Level Title & Subtitle */}
                    <h3 className="text-2xl font-bold text-gray-900">
                      {lvl.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                      {lvl.subtitle}
                    </p>

                    {/* Active/Completed Stats */}
                    {!isLocked ? (
                      <div className="mt-8 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-medium">{lvl.scoreLabel}</span>
                          <span className="font-bold text-gray-900">{lvl.score}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-medium">Progres</span>
                          <span className="font-bold text-violet-700">{lvl.progress}%</span>
                        </div>
                        {/* Progress track */}
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1 relative">
                          <div
                            className="h-full bg-violet-600 rounded-full transition-all duration-500"
                            style={{ width: `${lvl.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Locked State Visual */
                      <div className="py-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                          <Lock className="w-7 h-7 stroke-[1.8]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions / Unlock Requirement */}
                  <div className="mt-8 pt-2">
                    {isFinished && (
                      <button
                        onClick={() => startLevelQuiz(lvl)}
                        className="w-full py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-colors"
                      >
                        Mainkan Ulang
                      </button>
                    )}
                    {isInProgress && (
                      <button
                        onClick={() => startLevelQuiz(lvl)}
                        className="w-full py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-semibold transition-colors shadow-sm"
                      >
                        Lanjutkan
                      </button>
                    )}
                    {isLocked && (
                      <p className="text-xs text-gray-400 text-center font-medium">
                        {lvl.unlockRequirement}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: KUIS UNGGULAN & KATEGORI (Previous view) */}
      {/* ======================================================== */}
      {activeTab === 'interaktif' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Kuis Interaktif
            </h2>
          </div>

          {/* Top Row: Featured Quiz Card & Last Score Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Quiz Card (Span 2) */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
              <div className="flex-1">
                <span className="inline-block bg-violet-100 text-violet-700 font-semibold text-xs px-3 py-1 rounded-full mb-3">
                  Kuis Unggulan
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  Ekspresi Wajah
                  <br />
                  Dasar
                </h3>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-md">
                  Uji pemahamanmu tentang nuansa emosi melalui ekspresi wajah dalam komunikasi
                  BISINDO. Kuis ini terdiri dari 15 pertanyaan video interaktif.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => startFeaturedQuiz('Ekspresi Wajah Dasar')}
                    className="inline-flex items-center gap-2 rounded-full bg-black hover:bg-gray-800 text-white px-7 py-3 text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Mulai Kuis</span>
                  </button>
                </div>
              </div>

              <div className="w-full sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-violet-200 flex-shrink-0 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=650&fit=crop&auto=format"
                  alt="Mahasiswa belajar bahasa isyarat"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Last Score Card (Span 1) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Skor Kuis
                <br />
                Terakhir
              </h3>

              <div className="relative w-36 h-36 rounded-full border-8 border-violet-100 flex flex-col items-center justify-center my-2 shadow-inner">
                <span className="text-3xl sm:text-4xl font-extrabold text-violet-600">
                  85%
                </span>
                <span className="text-xs font-semibold text-gray-500 mt-0.5">
                  Sangat Baik
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-6 font-medium">
                Kuis: Alfabet (A-Z)
              </p>
            </div>
          </div>

          {/* Bottom Section: Kategori Kuis */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Kategori Kuis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quizCategoriesData.map((category) => (
                <article
                  key={category.id}
                  onClick={() => startFeaturedQuiz(category.title)}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${category.badgeBg}`}
                      >
                        {category.badgeType === 'text' && <span>{category.badgeText}</span>}
                        {category.badgeType === 'icon' && <Hand className="w-5 h-5" />}
                        {category.badgeType === 'clock' && <Clock className="w-5 h-5" />}
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                        {category.questionsCount}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 mt-4 group-hover:text-violet-600 transition-colors">
                      {category.title}
                    </h4>
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 font-medium">
                      <span>Progres</span>
                      <span className="font-bold text-gray-900">
                        {category.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full transition-all duration-500"
                        style={{ width: `${category.progress}%` }}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserQuizPage
