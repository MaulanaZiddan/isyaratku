import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  BookOpen,
  CheckCircle2,
  Play,
  Upload,
  Film,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useDictionary } from '@/context/DictionaryContext'

const ITEMS_PER_PAGE = 15

const AdminKamusPage = () => {
  const {
    categories: dictCategories,
    vocabularies,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
  } = useDictionary()

  const categories = ['Semua', ...dictCategories.map((c) => c.title)]

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [previewVideo, setPreviewVideo] = useState(null)

  const fileInputRef = useRef(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [selectedFileSize, setSelectedFileSize] = useState('')

  const [formData, setFormData] = useState({
    word: '',
    category: dictCategories[0]?.title || 'Aktivitas',
    description: '',
    videoUrl: '',
    status: 'Aktif',
  })

  const filteredVocabs = vocabularies.filter((v) => {
    const matchSearch =
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = selectedCategory === 'Semua' || v.category === selectedCategory
    return matchSearch && matchCat
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  const totalPages = Math.max(1, Math.ceil(filteredVocabs.length / ITEMS_PER_PAGE))
  const paginatedVocabs = filteredVocabs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const openAddModal = () => {
    setEditingItem(null)
    setSelectedFileName('')
    setSelectedFileSize('')
    setFormData({
      word: '',
      category: dictCategories[0]?.title || 'Aktivitas',
      description: '',
      videoUrl: '',
      status: 'Aktif',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setSelectedFileName(item.filename || (item.videoUrl ? item.videoUrl.split('/').pop() : ''))
    setSelectedFileSize('')
    setFormData({
      word: item.word,
      category: item.category,
      description: item.description,
      videoUrl: item.videoUrl,
      status: item.status,
    })
    setIsModalOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
    setSelectedFileName(file.name)
    setSelectedFileSize(`${sizeInMB} MB`)
    setFormData((prev) => ({
      ...prev,
      videoUrl: objectUrl,
      filename: file.name,
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editingItem) {
      updateVocabulary(editingItem.id, formData)
    } else {
      addVocabulary(formData)
    }
    setIsModalOpen(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleDelete = (id) => {
    deleteVocabulary(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Manajemen Kamus
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola {vocabularies.length} kosakata BISINDO dari {dictCategories.length} kategori.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kosakata</span>
        </button>
      </div>

      {/* Success Toast */}
      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">
            Perubahan berhasil disimpan!
          </p>
        </div>
      )}

      {/* Search & Filter Row */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kosakata..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Vocabulary Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-600" />
            <h3 className="text-base font-bold text-gray-900">Daftar Kosakata</h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {filteredVocabs.length} entri
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Kosakata
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Deskripsi
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Video
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedVocabs.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <span className="font-bold text-gray-900">{item.word}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-medium px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    <p className="text-gray-500 text-xs line-clamp-2 max-w-xs">
                      {item.description}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.videoUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewVideo(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Putar
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVocabs.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-900">Tidak ada kosakata ditemukan</p>
            <p className="text-xs text-gray-400 mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredVocabs.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/40">
            <p className="text-xs text-gray-500">
              Menampilkan{' '}
              <span className="font-semibold text-gray-800">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>
              –
              <span className="font-semibold text-gray-800">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredVocabs.length)}
              </span>{' '}
              dari <span className="font-semibold text-gray-800">{filteredVocabs.length}</span> entri
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold text-gray-700">
                Hal {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewVideo(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="relative aspect-video bg-black">
              <video
                src={previewVideo.videoUrl}
                autoPlay
                loop
                controls
                playsInline
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setPreviewVideo(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{previewVideo.word}</h4>
                <p className="text-xs text-gray-500">{previewVideo.category}</p>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kosakata?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus entri ini? Tindakan ini tidak dapat dibatalkan.
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

      {/* Add / Edit Modal with Browse File Video */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit Kosakata' : 'Tambah Kosakata Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Kata / Frasa
                </label>
                <input
                  type="text"
                  required
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  placeholder="Contoh: Terima Kasih"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  >
                    {categories.filter((c) => c !== 'Semua').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Deskripsi Gerakan
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan gerakan tangan, posisi jari, dan ekspresi wajah..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white resize-none"
                />
              </div>

              {/* Browse Video File Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  File Video Peraga (.mp4 / .webm / .mov)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!formData.videoUrl ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-violet-500 hover:bg-violet-50/40 rounded-2xl p-6 text-center transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Klik untuk Browse &amp; Pilih File Video
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Mendukung format MP4, WebM, atau MOV
                    </p>
                  </button>
                ) : (
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                    <div className="relative aspect-video bg-black">
                      <video
                        src={formData.videoUrl}
                        controls
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between gap-3 bg-white border-t border-gray-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <Film className="w-4 h-4 text-violet-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-gray-800 truncate">
                          {selectedFileName || 'video-peraga.mp4'}
                        </span>
                        {selectedFileSize && (
                          <span className="text-[11px] text-gray-400 flex-shrink-0">
                            ({selectedFileSize})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-xs font-semibold text-violet-600 hover:bg-violet-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        Ganti File
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Kosakata'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminKamusPage
