import { Video, BookOpen, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Video,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    title: 'Video HD Kualitas Tinggi',
    description:
      'Gestur terekam jelas dari berbagai sudut untuk memastikan pemahaman gerakan tangan yang akurat dan detail.',
  },
  {
    icon: BookOpen,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Kuis Interaktif',
    description:
      'Uji pemahaman Anda melalui tantangan teks-ke-video dan video-ke-teks untuk memperkuat memori visual.',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    title: 'Pelacakan Progres',
    description:
      'Pantau perjalanan belajar dan tingkat penguasaan kosakata Anda dengan visualisasi data yang memotivasi.',
  },
]

const FeatureHighlights = () => {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Metode Pembelajaran Modern
          </h2>
          <p className="mt-4 text-gray-600 text-base lg:text-lg">
            Dirancang khusus untuk pengalaman belajar BISINDO yang efektif,
            menyenangkan, dan dapat diakses kapan saja.
          </p>
        </div>

        {/* 3-column Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <article
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg}`}
                >
                  <Icon size={24} className={feature.iconColor} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeatureHighlights
