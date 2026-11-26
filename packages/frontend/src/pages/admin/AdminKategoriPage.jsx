import { useState, useRef } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  FolderPlus,
  Search,
  CheckCircle2,
  Folder,
  Upload,
  Image as ImageIcon,
  Activity,
  Smile,
  Users,
  Briefcase,
  Home,
  MapPin,
  Car,
  Utensils,
  Clock,
  Calendar,
  Palette,
  Hand,
  Hash,
  CloudSun,
  BookOpen,
  Sparkles,
  Heart,
  Globe,
  MessageCircle,
  Award,
  Star,
  Zap,
  Music,
  CalendarDays,
  UserCheck,
  Maximize2,
} from 'lucide-react'
import { useDictionary } from '@/context/DictionaryContext'

const iconOptions = [
  { name: 'Folder', icon: Folder, label: 'Folder / Kategori' },
  { name: 'Activity', icon: Activity, label: 'Aktivitas' },
  { name: 'Smile', icon: Smile, label: 'Emosi' },
  { name: 'Users', icon: Users, label: 'Keluarga / Orang' },
  { name: 'Briefcase', icon: Briefcase, label: 'Profesi' },
  { name: 'Home', icon: Home, label: 'Ruang / Rumah' },
  { name: 'MapPin', icon: MapPin, label: 'Tempat' },
  { name: 'Car', icon: Car, label: 'Transportasi' },
  { name: 'Utensils', icon: Utensils, label: 'Rasa / Makanan' },
  { name: 'Clock', icon: Clock, label: 'Waktu' },
  { name: 'Calendar', icon: Calendar, label: 'Bulan / Kalender' },
  { name: 'CalendarDays', icon: CalendarDays, label: 'Hari' },
  { name: 'UserCheck', icon: UserCheck, label: 'Pronomina' },
  { name: 'Maximize2', icon: Maximize2, label: 'Ukuran' },
  { name: 'Palette', icon: Palette, label: 'Warna' },
  { name: 'Hand', icon: Hand, label: 'Gestur / Tubuh' },
  { name: 'Hash', icon: Hash, label: 'Angka' },
  { name: 'CloudSun', icon: CloudSun, label: 'Alam / Cuaca' },
  { name: 'BookOpen', icon: BookOpen, label: 'Belajar' },
  { name: 'Sparkles', icon: Sparkles, label: 'Bintang / Spesial' },
  { name: 'Heart', icon: Heart, label: 'Kesehatan / Cinta' },
  { name: 'Globe', icon: Globe, label: 'Dunia / Bahasa' },
  { name: 'MessageCircle', icon: MessageCircle, label: 'Percakapan' },
  { name: 'Award', icon: Award, label: 'Pencapaian' },
  { name: 'Star', icon: Star, label: 'Favorit' },
  { name: 'Zap', icon: Zap, label: 'Cepat / Kilat' },
  { name: 'Music', icon: Music, label: 'Musik / Suara' },
]

const colorPresets = [
  {
    label: 'Ungu',
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    label: 'Biru',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    label: 'Hijau',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    label: 'Oranye',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    label: 'Merah Muda',
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
    badgeColor: 'bg-pink-100 text-pink-700',
  },
]

const AdminKategoriPage = () => {
  const { categories, vocabularies, addCategory, updateCategory, deleteCategory } =
    useDictionary()

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSaved, setIsSaved] = useState(false)

  const fileInputRef = useRef(null)
  const [customFileName, setCustomFileName] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: '',
    colorIndex: 0,
    selectedIconName: 'Folder',
    customIconUrl: null,
    iconType: 'preset', // 'preset' | 'custom'
  })

  const filteredCategories = categories.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getWordCount = (categoryTitle) =>
    vocabularies.filter((v) => v.category === categoryTitle).length

  const openAddModal = () => {
    setEditingItem(null)
    setCustomFileName('')
    setFormData({
      title: '',
      topic: '',
      description: '',
      colorIndex: 0,
      selectedIconName: 'Folder',
      customIconUrl: null,
      iconType: 'preset',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (cat) => {
    setEditingItem(cat)
    const foundIdx = colorPresets.findIndex((p) => p.bgColor === cat.bgColor)
    const matchedIcon = iconOptions.find(
      (i) => i.icon === cat.icon || i.name === cat.iconName
    )
    setCustomFileName(cat.customIconUrl ? 'Icon dari Perangkat' : '')
    setFormData({
      title: cat.title,
      topic: cat.topic,
      description: cat.description,
      colorIndex: foundIdx >= 0 ? foundIdx : 0,
      selectedIconName: matchedIcon ? matchedIcon.name : 'Folder',
      customIconUrl: cat.customIconUrl || null,
      iconType: cat.customIconUrl ? 'custom' : 'preset',
    })
    setIsModalOpen(true)
  }

  const handleCustomIconChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setCustomFileName(file.name)
    setFormData((prev) => ({
      ...prev,
      customIconUrl: objectUrl,
      iconType: 'custom',
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    const preset = colorPresets[formData.colorIndex] || colorPresets[0]
    const iconObj =
      iconOptions.find((i) => i.name === formData.selectedIconName) ||
      iconOptions[0]
    const categoryPayload = {
      title: formData.title,
      topic: formData.topic,
      description: formData.description,
      icon: iconObj.icon,
      iconName: iconObj.name,
      customIconUrl: formData.iconType === 'custom' ? formData.customIconUrl : null,
      ...preset,
    }
    if (editingItem) {
      updateCategory(editingItem.id, categoryPayload)
    } else {
      addCategory(categoryPayload)
    }
    setIsModalOpen(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleDelete = (id) => {
    deleteCategory(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Manajemen Kategori
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tambah, ubah, atau kelola {categories.length} kategori kosakata BISINDO.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Success Toast */}
      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">
            Kategori berhasil disimpan!
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kategori..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => {
          const Icon =
            cat.icon ||
            iconOptions.find((i) => i.name === cat.iconName)?.icon ||
            Folder
          const count = getWordCount(cat.title)
          return (
            <div
              key={cat.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden ${cat.bgColor}`}
                  >
                    {cat.customIconUrl ? (
                      <img
                        src={cat.customIconUrl}
                        alt={cat.title}
                        className="w-7 h-7 object-contain"
                      />
                    ) : (
                      <Icon className={`w-6 h-6 ${cat.iconColor}`} />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                      title="Edit Kategori"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{cat.title}</h3>
                <p className="text-xs font-medium text-violet-600 mt-0.5">
                  {cat.topic}
                </p>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.badgeColor}`}
                >
                  {count} Video Kosakata
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FolderPlus className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-900">
            Kategori tidak ditemukan
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Coba kata kunci lain atau tambah kategori baru.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Hapus Kategori?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus kategori ini?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
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
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Contoh: Salam & Sapaan"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Sub-Topik
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  placeholder="Contoh: Percakapan Sehari-hari"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Jelaskan materi kosakata di kategori ini..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white resize-none"
                />
              </div>

              {/* Pilihan Icon */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Icon Kategori
                  </label>
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, iconType: 'preset' }))
                      }
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        formData.iconType === 'preset'
                          ? 'bg-white text-gray-900 shadow-sm font-semibold'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Preset Icon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, iconType: 'custom' }))
                        if (!formData.customIconUrl && fileInputRef.current) {
                          fileInputRef.current.click()
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        formData.iconType === 'custom'
                          ? 'bg-white text-violet-700 shadow-sm font-semibold'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      Browse File
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCustomIconChange}
                  className="hidden"
                />

                {formData.iconType === 'preset' ? (
                  <div>
                    <div className="text-[11px] text-gray-500 mb-1.5 flex justify-end">
                      Terpilih: <strong className="text-violet-600 ml-1">{formData.selectedIconName}</strong>
                    </div>
                    <div className="grid grid-cols-6 gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl max-h-36 overflow-y-auto">
                      {iconOptions.map((item) => {
                        const IconComponent = item.icon
                        const isSelected = formData.selectedIconName === item.name
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                selectedIconName: item.name,
                              })
                            }
                            title={item.label}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all aspect-square ${
                              isSelected
                                ? 'bg-white border-2 border-violet-600 text-violet-700 shadow-sm scale-105'
                                : 'border border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/80'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50">
                    {formData.customIconUrl ? (
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 p-1.5 flex items-center justify-center shadow-sm shrink-0">
                          <img
                            src={formData.customIconUrl}
                            alt="Custom Icon Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {customFileName || 'Icon kustom terpilih'}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Siap digunakan sebagai icon kategori
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                          >
                            <Upload className="w-3 h-3" />
                            Ganti file lain
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 px-3 border-2 border-dashed border-gray-300 hover:border-violet-500 rounded-xl flex flex-col items-center justify-center text-center transition-colors bg-white/70 hover:bg-violet-50/30"
                      >
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-2">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-800">
                          Klik untuk browse icon dari perangkat
                        </span>
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          Format PNG, JPG, SVG, atau WebP (disarankan latar transparan)
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Warna Tema
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, colorIndex: idx })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        formData.colorIndex === idx
                          ? `${preset.badgeColor} border-gray-900`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingItem ? 'Simpan Perubahan' : 'Tambah Kategori'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminKategoriPage
