import { useAuthModal } from '@/context/AuthContext'

const CTABanner = () => {
  const { openRegister } = useAuthModal()

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#1a1625] px-8 py-16 sm:px-16 sm:py-20">
          {/* Abstract decorative background */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-800/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Siap untuk mulai
              <br />
              berkomunikasi?
            </h2>
            <p className="mt-6 text-gray-300 text-base lg:text-lg max-w-xl mx-auto">
              Bergabunglah dengan ribuan pelajar lainnya dan mulai kuasai Bahasa Isyarat Indonesia hari ini.
            </p>
            <div className="mt-10">
              <button
                type="button"
                onClick={openRegister}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-500/40 active:scale-[0.98]"
              >
                Daftar Sekarang Secara Gratis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTABanner
