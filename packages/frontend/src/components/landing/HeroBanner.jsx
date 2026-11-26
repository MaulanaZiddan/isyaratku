import { Link } from 'react-router-dom'
import { Search, Play } from 'lucide-react'
import { useAuthModal } from '@/context/AuthContext'

const HeroBanner = () => {
  const { openRegister } = useAuthModal()

  return (
    <section className="bg-gradient-to-b from-violet-50/50 to-white pt-12 pb-16 lg:pt-20 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              Mulai Perjalanan Inklusif Anda
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-tight tracking-tight text-gray-900">
              Kuasai Bahasa Isyarat
              <br />
              Indonesia dengan
              <br />
              <span className="text-violet-600">Percaya Diri</span>
            </h1>

            <p className="mt-6 text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg">
              Jembatani komunikasi dan bangun inklusivitas. Akses ribuan video HD
              kosakata BISINDO yang dirancang untuk pembelajaran yang mudah dan interaktif.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={openRegister}
                className="btn-primary inline-flex items-center justify-center font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-all text-base px-8 py-3.5 shadow-md shadow-violet-600/20 active:scale-[0.98]"
              >
                Mulai Belajar Gratis
              </button>
              <Link
                to="/kamus"
                className="btn-secondary inline-flex items-center justify-center gap-2 font-semibold rounded-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-base px-8 py-3.5 shadow-sm"
              >
                <Search size={18} className="text-gray-500" />
                <span>Jelajahi Kamus</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual & Floating Badge */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-600/10 aspect-[4/3] bg-gradient-to-br from-violet-200 to-violet-400">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640&h=480&fit=crop&auto=format"
                alt="Sekelompok orang belajar bahasa isyarat"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 right-4 lg:right-8 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg shadow-gray-900/10 border border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Play size={20} className="text-violet-600 fill-violet-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">5,000+ Kosakata</p>
                <p className="text-xs text-gray-500">Video HD Berkualitas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
