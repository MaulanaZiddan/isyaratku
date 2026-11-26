import { Link } from 'react-router-dom'
import { ArrowRight, Clock, LayoutGrid } from 'lucide-react'
import { dictionaryCategories, allVocabularies } from '@/data/vocabularies'

const CategoryGrid = () => {
  const keluargaCount = dictionaryCategories.find((c) => c.id === 'keluarga')?.words.length || 9
  const angkaCount = dictionaryCategories.find((c) => c.id === 'angka')?.words.length || 19

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Kategori Kosakata Populer
            </h2>
            <p className="mt-3 text-gray-600">
              Tersedia {allVocabularies.length} video peragaan BISINDO dalam {dictionaryCategories.length} kategori.
            </p>
          </div>
          <Link
            to="/kamus"
            className="inline-flex items-center gap-1.5 text-violet-600 font-semibold text-sm hover:text-violet-700 transition-colors group"
          >
            Lihat Semua Kategori
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 md:auto-rows-[200px]">
          {/* Card 1: Keluarga (Large, 1 col, 2 rows on md+) */}
          <Link
            to="/kamus?kategori=keluarga"
            className="relative block rounded-2xl overflow-hidden md:row-span-2 group min-h-[300px] md:min-h-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-amber-100 to-orange-300" />
            <img
              src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=600&fit=crop&auto=format"
              alt="Kategori Keluarga"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white mb-2">
                {keluargaCount} Video Kosakata
              </span>
              <h3 className="text-2xl font-bold text-white">Keluarga</h3>
            </div>
          </Link>

          {/* Card 2: Angka (2 cols on md+, 1 row) */}
          <Link
            to="/kamus?kategori=angka"
            className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6 md:col-span-2 hover:shadow-lg hover:border-gray-300 transition-all group"
          >
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-violet-600 font-bold text-lg">123</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Angka &amp; Hitungan</h3>
              <p className="mt-1 text-sm text-gray-500">{angkaCount} Video Kosakata</p>
            </div>
          </Link>

          {/* Card 3: Waktu (1 col, 1 row) */}
          <Link
            to="/kamus?kategori=waktu"
            className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-gray-300 transition-all group"
          >
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-3">
              <Clock size={22} className="text-violet-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Waktu</h3>
            <p className="text-sm text-gray-500 mt-1">Pagi, Siang, Sore, Malam</p>
          </Link>

          {/* Card 4: Jelajahi Semua (1 col, 1 row) */}
          <Link
            to="/kamus"
            className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-violet-200 hover:bg-violet-50/50 transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-violet-100 rounded-xl flex items-center justify-center mb-3 transition-colors">
              <LayoutGrid size={22} className="text-gray-400 group-hover:text-violet-600 transition-colors" />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-violet-600 transition-colors">
              Jelajahi Semua ({dictionaryCategories.length} Kategori)
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoryGrid
