import { useEffect, useState } from 'react'
import { getActiveTestimonials, type Testimonial } from '@/lib/testimonialService'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-5 h-5 ${n <= rating ? 'text-[#E8B55F]' : 'text-[#DDD5C8]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-7 flex flex-col gap-4">
      <Stars rating={testimonial.rating} />
      <blockquote className="text-[#3E2C1F] text-[15px] leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <p className="text-sm font-semibold text-[#C87855]">— {testimonial.name}</p>
    </div>
  )
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getActiveTestimonials()
      .then(setTestimonials)
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || testimonials.length === 0) return null

  return (
    <section className="py-16 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-3 text-[#3E2C1F]">What Our Customers Say</h2>
        <p className="text-center text-[#6B5B4F] mb-12 text-lg">Real stories from real bakers</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
