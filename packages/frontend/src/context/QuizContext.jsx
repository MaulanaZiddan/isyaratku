import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const initialQuizQuestions = [
  {
    id: 'quiz-1',
    levelId: 1,
    levelTitle: 'Level 1: Dasar & Alfabet',
    question: 'Perhatikan video peragaan BISINDO berikut. Kata ganti orang apakah yang sedang diisyaratkan?',
    mediaType: 'video',
    mediaUrl: '/videos/pronomina/aku.mp4',
    options: ['Aku / Saya', 'Kamu', 'Mereka', 'Dia'],
    correctAnswer: 0,
    explanation: 'Gerakan jari telunjuk mengarah ke dada sendiri menunjukkan kata ganti orang pertama tunggal "Aku / Saya" dalam BISINDO.',
    difficulty: 'Mudah',
    points: 10,
    createdAt: '25 Nov 2026',
  },
  {
    id: 'quiz-2',
    levelId: 1,
    levelTitle: 'Level 1: Dasar & Alfabet',
    question: 'Amati gerakan tangan pada video berikut. Isyarat tersebut berarti:',
    mediaType: 'video',
    mediaUrl: '/videos/pronomina/kamu.mp4',
    options: ['Kamu', 'Aku', 'Kalian', 'Ibu'],
    correctAnswer: 0,
    explanation: 'Isyarat "Kamu" dilakukan dengan mengarahkan jari telunjuk lurus ke arah lawan bicara.',
    difficulty: 'Mudah',
    points: 10,
    createdAt: '25 Nov 2026',
  },
  {
    id: 'quiz-3',
    levelId: 2,
    levelTitle: 'Level 2: Keluarga & Sapaan',
    question: 'Perhatikan video isyarat anggota keluarga berikut. Kosakata apakah yang diperagakan?',
    mediaType: 'video',
    mediaUrl: '/videos/Keluarga/kakek.mp4',
    options: ['Adik Laki-laki', 'Kakek', 'Nenek', 'Anak'],
    correctAnswer: 1,
    explanation: 'Video tersebut memperagakan isyarat BISINDO untuk anggota keluarga "Kakek".',
    difficulty: 'Sedang',
    points: 15,
    createdAt: '25 Nov 2026',
  },
  {
    id: 'quiz-4',
    levelId: 2,
    levelTitle: 'Level 2: Keluarga & Sapaan',
    question: 'Isyarat untuk kata "Ibu" dalam BISINDO diperagakan pada video berikut. Di manakah posisi gerakan tangannya?',
    mediaType: 'video',
    mediaUrl: '/videos/Keluarga/ibu.mp4',
    options: ['Dahi', 'Dagu / Pipi bawah', 'Dada', 'Bahu'],
    correctAnswer: 1,
    explanation: 'Isyarat Ibu dilakukan di area dagu/pipi bagian bawah dengan gerakan lembut seperti pada video.',
    difficulty: 'Mudah',
    points: 10,
    createdAt: '25 Nov 2026',
  },
  {
    id: 'quiz-5',
    levelId: 2,
    levelTitle: 'Level 2: Keluarga & Sapaan',
    question: 'Amati video peragaan berikut. Isyarat apakah yang ditampilkan untuk anggota keluarga ini?',
    mediaType: 'video',
    mediaUrl: '/videos/Keluarga/bapak.mp4',
    options: ['Ayah / Bapak', 'Kakak Perempuan', 'Adik', 'Ibu'],
    correctAnswer: 0,
    explanation: 'Isyarat Ayah / Bapak dilakukan dengan gerakan di area dahi/wajah bagian atas seperti pada video.',
    difficulty: 'Mudah',
    points: 10,
    createdAt: '25 Nov 2026',
  },
  {
    id: 'quiz-6',
    levelId: 3,
    levelTitle: 'Level 3: Waktu & Hari',
    question: 'Perhatikan video peragaan waktu berikut. Keterangan waktu apakah yang sedang diisyaratkan?',
    mediaType: 'video',
    mediaUrl: '/videos/Waktu/pagi.mp4',
    options: ['Pagi', 'Siang', 'Sore', 'Malam'],
    correctAnswer: 0,
    explanation: 'Isyarat "Pagi" disimbolkan dengan gerakan tangan yang naik ke atas merepresentasikan matahari terbit.',
    difficulty: 'Sedang',
    points: 15,
    createdAt: '25 Nov 2026',
  },
]

export const initialQuizLevels = [
  {
    id: 1,
    levelNumber: 1,
    title: 'Level 1',
    subtitle: 'Dasar & Alfabet',
    status: 'selesai',
    statusLabel: 'Selesai',
    scoreLabel: 'Skor Tertinggi',
    score: '95/100',
    progress: 100,
    locked: false,
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

const STORAGE_KEY = 'isyaratku_quiz_progress'

const loadLocalProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const applyProgressToLevels = (baseLevels, progressMap) => {
  if (!progressMap || Object.keys(progressMap).length === 0) return baseLevels

  return baseLevels.map((lvl) => {
    const saved = progressMap[lvl.id] || progressMap[lvl.levelNumber]
    if (saved) {
      return {
        ...lvl,
        status: saved.status ?? lvl.status,
        statusLabel:
          saved.status === 'selesai'
            ? 'Selesai'
            : saved.status === 'lanjut'
            ? 'Lanjut'
            : saved.statusLabel || lvl.statusLabel,
        score: saved.score ?? lvl.score,
        scoreLabel: saved.scoreLabel ?? (saved.score ? 'Skor Tertinggi' : lvl.scoreLabel),
        progress: saved.progress !== undefined ? saved.progress : lvl.progress,
        locked: saved.locked !== undefined ? saved.locked : lvl.locked,
      }
    }
    return lvl
  })
}

const QuizContext = createContext(null)

export const QuizProvider = ({ children }) => {
  const [questions, setQuestions] = useState(initialQuizQuestions)
  const [levels, setLevels] = useState(() => {
    const localMap = loadLocalProgress()
    return applyProgressToLevels(initialQuizLevels, localMap)
  })

  useEffect(() => {
    const handleSync = () => {
      const currentMap = loadLocalProgress()
      setLevels((prev) => applyProgressToLevels(prev, currentMap))
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('isyaratku_quiz_updated', handleSync)

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        window.removeEventListener('storage', handleSync)
        window.removeEventListener('isyaratku_quiz_updated', handleSync)
      }
    }

    const loadQuizData = async () => {
      const localMap = loadLocalProgress()
      const { data: levelRows } = await supabase
        .from('quiz_levels')
        .select('*')
        .order('level_number', { ascending: true })

      let mappedLevels = applyProgressToLevels(initialQuizLevels, localMap)
      if (levelRows && levelRows.length > 0) {
        const dbLevels = levelRows.map((l) => ({
          id: l.id,
          levelNumber: l.level_number,
          title: l.title,
          subtitle: l.subtitle,
          status: l.is_default_unlocked ? 'lanjut' : 'terkunci',
          statusLabel: l.is_default_unlocked ? 'Terbuka' : 'Terkunci',
          locked: !l.is_default_unlocked,
          unlockRequirement: l.unlock_requirement,
        }))
        mappedLevels = applyProgressToLevels(dbLevels, localMap)
      }

      // Sync dengan tabel user_quiz_progress jika user login
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          const { data: userProgressRows } = await supabase
            .from('user_quiz_progress')
            .select('*')
            .eq('user_id', session.user.id)

          if (userProgressRows && userProgressRows.length > 0) {
            const mergedMap = { ...localMap }
            userProgressRows.forEach((row) => {
              mergedMap[row.level_id] = {
                status: row.status,
                score: row.best_score ? `${row.best_score}/100` : undefined,
                scoreLabel: 'Skor Tertinggi',
                progress: row.status === 'selesai' ? 100 : (row.best_score || 0),
                locked: row.status === 'terkunci',
              }
            })
            mappedLevels = applyProgressToLevels(mappedLevels, mergedMap)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedMap))
          }
        }
      } catch (err) {
        console.warn('Could not sync user_quiz_progress from Supabase:', err)
      }

      setLevels(mappedLevels)

      const { data: questionRows } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (questionRows && questionRows.length > 0) {
        setQuestions(
          questionRows.map((q) => {
            const matchedLevel = mappedLevels.find((l) => l.id === q.level_id)
            return {
              id: q.id,
              levelId: q.level_id,
              levelTitle: matchedLevel
                ? `${matchedLevel.title}: ${matchedLevel.subtitle}`
                : `Level ${q.level_id}`,
              question: q.question,
              mediaType: q.media_type || 'video',
              mediaUrl: q.media_url,
              options: q.options,
              correctAnswer: q.correct_answer,
              explanation: q.explanation,
              difficulty: q.difficulty,
              points: q.points,
              createdAt: new Date(q.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
            }
          })
        )
      }
    }

    loadQuizData()

    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('isyaratku_quiz_updated', handleSync)
    }
  }, [])

  const addQuestion = async (questionData) => {
    const matchedLevel = levels.find((l) => l.id === Number(questionData.levelId))
    const tempId = `quiz-${Date.now()}`
    const newQuestion = {
      id: tempId,
      ...questionData,
      levelTitle: matchedLevel
        ? `${matchedLevel.title}: ${matchedLevel.subtitle}`
        : `Level ${questionData.levelId}`,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }
    setQuestions((prev) => [newQuestion, ...prev])

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('quiz_questions')
        .insert({
          level_id: Number(questionData.levelId),
          question: questionData.question,
          media_type: 'video',
          media_url: questionData.mediaUrl,
          options: questionData.options,
          correct_answer: Number(questionData.correctAnswer),
          explanation: questionData.explanation || '',
          difficulty: questionData.difficulty || 'Mudah',
          points: Number(questionData.points) || 10,
        })
        .select()
        .single()

      if (data?.id) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === tempId ? { ...q, id: data.id } : q))
        )
      }
    }

    return newQuestion
  }

  const updateQuestion = async (id, updates) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const matchedLevel = updates.levelId
            ? levels.find((l) => l.id === Number(updates.levelId))
            : null
          return {
            ...q,
            ...updates,
            levelTitle: matchedLevel
              ? `${matchedLevel.title}: ${matchedLevel.subtitle}`
              : q.levelTitle,
          }
        }
        return q
      })
    )

    if (isSupabaseConfigured && supabase && !String(id).startsWith('quiz-')) {
      await supabase
        .from('quiz_questions')
        .update({
          ...(updates.levelId !== undefined && { level_id: Number(updates.levelId) }),
          ...(updates.question !== undefined && { question: updates.question }),
          ...(updates.mediaUrl !== undefined && { media_url: updates.mediaUrl }),
          ...(updates.options !== undefined && { options: updates.options }),
          ...(updates.correctAnswer !== undefined && {
            correct_answer: Number(updates.correctAnswer),
          }),
          ...(updates.explanation !== undefined && { explanation: updates.explanation }),
          ...(updates.difficulty !== undefined && { difficulty: updates.difficulty }),
          ...(updates.points !== undefined && { points: Number(updates.points) }),
        })
        .eq('id', id)
    }
  }

  const deleteQuestion = async (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    if (isSupabaseConfigured && supabase && !String(id).startsWith('quiz-')) {
      await supabase.from('quiz_questions').delete().eq('id', id)
    }
  }

  const addLevel = async (levelData) => {
    const nextNumber = levels.length + 1
    const fallbackLevel = {
      id: nextNumber,
      levelNumber: nextNumber,
      title: levelData.title || `Level ${nextNumber}`,
      subtitle: levelData.subtitle || 'Materi Baru',
      status: 'terkunci',
      statusLabel: 'Terkunci',
      locked: true,
      unlockRequirement: `Selesaikan Level ${nextNumber - 1} untuk membuka`,
      ...levelData,
    }
    setLevels((prev) => [...prev, fallbackLevel])

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('quiz_levels')
        .insert({ subtitle: levelData.subtitle || 'Materi Baru' })
        .select()
        .single()

      if (data?.id) {
        setLevels((prev) =>
          prev.map((l) =>
            l.id === fallbackLevel.id
              ? {
                ...l,
                id: data.id,
                levelNumber: data.level_number,
                title: data.title,
                unlockRequirement: data.unlock_requirement,
              }
              : l
          )
        )
      }
    }

    return fallbackLevel
  }

  const updateLevel = async (id, updates) => {
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)))
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('quiz_levels')
        .update({
          ...(updates.subtitle !== undefined && { subtitle: updates.subtitle }),
        })
        .eq('id', id)
    }
  }

  const deleteLevel = async (id) => {
    setLevels((prev) => prev.filter((l) => l.id !== id))
    if (isSupabaseConfigured && supabase) {
      await supabase.from('quiz_levels').delete().eq('id', id)
    }
  }

  // Simpan progres pengerjaan level kuis (sinkron localStorage & Supabase)
  const saveLevelProgress = async (
    levelId,
    calculatedScore,
    totalQuestions = 0,
    correctCount = 0,
    durationSeconds = 0
  ) => {
    const isPassed = calculatedScore >= 75
    const safeDuration = Math.max(10, Math.round(Number(durationSeconds) || totalQuestions * 30 || 60))

    // Catat log aktivitas lokal untuk grafik aktivitas mingguan
    try {
      const rawLogs = localStorage.getItem('isyaratku_quiz_activity')
      const logs = rawLogs ? JSON.parse(rawLogs) : []
      logs.unshift({
        levelId,
        score: calculatedScore,
        totalQuestions,
        durationSeconds: safeDuration,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem('isyaratku_quiz_activity', JSON.stringify(logs.slice(0, 100)))
    } catch {
      // Abaikan jika storage penuh
    }

    setLevels((prev) => {
      const currentIdx = prev.findIndex((l) => l.id === levelId || l.levelNumber === Number(levelId))
      if (currentIdx === -1) return prev

      const currentLvl = prev[currentIdx]
      let prevBest = 0
      if (currentLvl?.score) {
        const match = String(currentLvl.score).match(/^(\d+)/)
        if (match) prevBest = parseInt(match[1], 10)
      }
      const highestScore = Math.max(prevBest, calculatedScore)
      const hasPassedEver = currentLvl?.status === 'selesai' || isPassed
      const nextIdx = currentIdx + 1

      const updated = prev.map((lvl, idx) => {
        if (idx === currentIdx) {
          return {
            ...lvl,
            status: hasPassedEver ? 'selesai' : 'lanjut',
            statusLabel: hasPassedEver ? 'Selesai' : 'Lanjut',
            score: `${highestScore}/100`,
            scoreLabel: 'Skor Tertinggi',
            progress: hasPassedEver ? 100 : Math.max(lvl.progress || 0, Math.round(highestScore)),
            locked: false,
          }
        }
        // Jika lulus KKM (>= 75), buka level berikutnya
        if (isPassed && idx === nextIdx) {
          return {
            ...lvl,
            locked: false,
            status: lvl.status === 'selesai' ? 'selesai' : 'lanjut',
            statusLabel: lvl.status === 'selesai' ? 'Selesai' : 'Lanjut',
          }
        }
        return lvl
      })

      // Simpan ke localStorage
      try {
        const progressMap = loadLocalProgress()
        updated.forEach((lvl) => {
          progressMap[lvl.id] = {
            id: lvl.id,
            levelNumber: lvl.levelNumber,
            status: lvl.status,
            score: lvl.score,
            scoreLabel: lvl.scoreLabel,
            progress: lvl.progress,
            locked: lvl.locked,
            highestScore: parseInt(String(lvl.score).match(/\d+/)?.[0] || '0', 10),
          }
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap))
      } catch (e) {
        console.error('Failed to save quiz progress to localStorage:', e)
      }

      return updated
    })

    // Sync ke Supabase jika login
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          await supabase.rpc('submit_quiz_attempt', {
            p_level_id: Number(levelId),
            p_correct_count: Number(correctCount),
            p_total_questions: Number(totalQuestions),
            p_earned_points: Number(correctCount) * 10,
            p_duration_seconds: safeDuration,
          })
        }
      } catch (err) {
        console.warn('Supabase sync skipped/failed:', err)
      }
    }

    // Broadcast auto-refresh event
    window.dispatchEvent(
      new CustomEvent('isyaratku_quiz_updated', {
        detail: { levelId, calculatedScore, isPassed },
      })
    )

    return { isPassed }
  }

  return (
    <QuizContext.Provider
      value={{
        questions,
        levels,
        setLevels,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addLevel,
        updateLevel,
        deleteLevel,
        saveLevelProgress,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export const useQuiz = () => {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}
