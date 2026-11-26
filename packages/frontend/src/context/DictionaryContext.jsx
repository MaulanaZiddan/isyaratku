import { createContext, useContext, useState, useEffect } from 'react'
import { Folder } from 'lucide-react'
import { dictionaryCategories, allVocabularies } from '@/data/vocabularies'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const defaultIconNames = {
  aktivitas: 'Activity',
  alam: 'CloudSun',
  angka: 'Hash',
  'bagian-tubuh': 'Hand',
  bulan: 'Calendar',
  emosi: 'Smile',
  hari: 'CalendarDays',
  keluarga: 'Users',
  profesi: 'Briefcase',
  pronomina: 'UserCheck',
  rasa: 'Utensils',
  'ruang-rumah': 'Home',
  tempat: 'MapPin',
  transportasi: 'Car',
  ukuran: 'Maximize2',
  waktu: 'Clock',
  warna: 'Palette',
}

const DictionaryContext = createContext(null)

export const DictionaryProvider = ({ children }) => {
  const [categories, setCategories] = useState(() =>
    dictionaryCategories.map((c) => ({
      id: c.id,
      title: c.title,
      topic: c.topic,
      description: c.description,
      icon: c.icon,
      iconName: defaultIconNames[c.id] || 'Folder',
      iconColor: c.iconColor,
      bgColor: c.bgColor,
      badgeColor: c.badgeColor,
    }))
  )

  const [vocabularies, setVocabularies] = useState(() =>
    allVocabularies.map((v, index) => ({
      ...v,
      createdAt: '25 Nov 2026',
      sortOrder: index,
    }))
  )

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    const loadDictionary = async () => {
      const { data: catRows } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (catRows && catRows.length > 0) {
        setCategories(
          catRows.map((c) => {
            const localMatch = dictionaryCategories.find((lc) => lc.id === c.id)
            return {
              id: c.id,
              title: c.title,
              topic: c.topic,
              description: c.description,
              icon: localMatch?.icon || Folder,
              iconName: c.icon_name || defaultIconNames[c.id] || 'Folder',
              customIconUrl: c.custom_icon_url || null,
              iconColor: c.icon_color || 'text-violet-600',
              bgColor: c.bg_color || 'bg-violet-50',
              badgeColor: c.badge_color || 'bg-violet-100 text-violet-700',
            }
          })
        )
      }

      const { data: vocabRows } = await supabase
        .from('vocabularies')
        .select('*, categories(title)')
        .order('sort_order', { ascending: true })

      if (vocabRows && vocabRows.length > 0) {
        setVocabularies(
          vocabRows.map((v, index) => ({
            id: v.id,
            categoryId: v.category_id,
            category: v.categories?.title || v.category_id,
            word: v.word,
            transEn: v.trans_en || '',
            transAr: v.trans_ar || '',
            description: v.description || '',
            descriptionEn: v.description_en || '',
            descriptionAr: v.description_ar || '',
            videoUrl: v.video_url,
            videoPath: v.video_path || null,
            status: v.status || 'Aktif',
            sortOrder: v.sort_order ?? index,
            createdAt: new Date(v.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
          }))
        )
      }
    }

    loadDictionary()
  }, [])

  const addCategory = async (catData) => {
    const slug = catData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    const newId = `${slug}-${Date.now()}`
    const newCategory = {
      id: newId,
      title: catData.title,
      topic: catData.topic || catData.title,
      description: catData.description || `Kosakata BISINDO untuk kategori ${catData.title}.`,
      icon: catData.icon || Folder,
      iconName: catData.iconName || 'Folder',
      customIconUrl: catData.customIconUrl || null,
      iconColor: catData.iconColor || 'text-violet-600',
      bgColor: catData.bgColor || 'bg-violet-50',
      badgeColor: catData.badgeColor || 'bg-violet-100 text-violet-700',
    }

    setCategories((prev) => [newCategory, ...prev])

    if (isSupabaseConfigured && supabase) {
      await supabase.from('categories').insert({
        id: newId,
        title: newCategory.title,
        topic: newCategory.topic,
        description: newCategory.description,
        icon_name: newCategory.iconName,
        custom_icon_url: newCategory.customIconUrl,
        icon_color: newCategory.iconColor,
        bg_color: newCategory.bgColor,
        badge_color: newCategory.badgeColor,
      })
    }

    return newCategory
  }

  const updateCategory = async (id, updates) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('categories')
        .update({
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.topic !== undefined && { topic: updates.topic }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.iconName !== undefined && { icon_name: updates.iconName }),
          ...(updates.customIconUrl !== undefined && { custom_icon_url: updates.customIconUrl }),
          ...(updates.iconColor !== undefined && { icon_color: updates.iconColor }),
          ...(updates.bgColor !== undefined && { bg_color: updates.bgColor }),
          ...(updates.badgeColor !== undefined && { badge_color: updates.badgeColor }),
        })
        .eq('id', id)
    }
  }

  const deleteCategory = async (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    if (isSupabaseConfigured && supabase) {
      await supabase.from('categories').delete().eq('id', id)
    }
  }

  const addVocabulary = async (vocabData) => {
    const tempId = `custom-${Date.now()}`
    const newItem = {
      id: tempId,
      ...vocabData,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }
    setVocabularies((prev) => [newItem, ...prev])

    if (isSupabaseConfigured && supabase) {
      const matchedCat = categories.find(
        (c) => c.title === vocabData.category || c.id === vocabData.categoryId
      )
      if (matchedCat) {
        const { data } = await supabase
          .from('vocabularies')
          .insert({
            category_id: matchedCat.id,
            word: vocabData.word,
            trans_en: vocabData.transEn || '',
            trans_ar: vocabData.transAr || '',
            description: vocabData.description || '',
            video_url: vocabData.videoUrl || '',
            status: vocabData.status || 'Aktif',
          })
          .select()
          .single()

        if (data?.id) {
          setVocabularies((prev) =>
            prev.map((v) => (v.id === tempId ? { ...v, id: data.id } : v))
          )
        }
      }
    }

    return newItem
  }

  const updateVocabulary = async (id, updates) => {
    setVocabularies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    )

    if (isSupabaseConfigured && supabase && !String(id).startsWith('custom-')) {
      const matchedCat = updates.category
        ? categories.find((c) => c.title === updates.category)
        : null
      await supabase
        .from('vocabularies')
        .update({
          ...(matchedCat && { category_id: matchedCat.id }),
          ...(updates.word !== undefined && { word: updates.word }),
          ...(updates.transEn !== undefined && { trans_en: updates.transEn }),
          ...(updates.transAr !== undefined && { trans_ar: updates.transAr }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.videoUrl !== undefined && { video_url: updates.videoUrl }),
          ...(updates.status !== undefined && { status: updates.status }),
        })
        .eq('id', id)
    }
  }

  const deleteVocabulary = async (id) => {
    setVocabularies((prev) => prev.filter((v) => v.id !== id))
    if (isSupabaseConfigured && supabase && !String(id).startsWith('custom-')) {
      await supabase.from('vocabularies').delete().eq('id', id)
    }
  }

  return (
    <DictionaryContext.Provider
      value={{
        categories,
        vocabularies,
        addCategory,
        updateCategory,
        deleteCategory,
        addVocabulary,
        updateVocabulary,
        deleteVocabulary,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  )
}

export const useDictionary = () => {
  const context = useContext(DictionaryContext)
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider')
  }
  return context
}
