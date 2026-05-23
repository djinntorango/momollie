import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

interface SendContactEmailRequest {
  name: string
  email: string
  subject: string
  message: string
}

export default function Contact() {
  const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof fields) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFields((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const fn = httpsCallable<SendContactEmailRequest, { success: boolean }>(
        functions(), 'sendContactEmail'
      )
      await fn({
        name: fields.name.trim(),
        email: fields.email.trim(),
        subject: fields.subject.trim(),
        message: fields.message.trim(),
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full px-4 py-3 border border-[#E8D5C0] rounded-xl text-sm text-[#3E2C1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8B55F] placeholder-[#C4B5A8] transition-shadow'

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#E8B55F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#3E2C1F] mb-2">Message sent!</h2>
          <p className="text-[#6B5B4F] mb-6">
            Thank you for reaching out. We'll get back to you as soon as we can.
          </p>
          <button
            onClick={() => { setSent(false); setFields({ name: '', email: '', subject: '', message: '' }) }}
            className="text-sm text-[#E8B55F] hover:text-[#D4A04D] font-medium transition-colors"
          >
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#3E2C1F] mb-3">Get in Touch</h1>
        <p className="text-[#6B5B4F] leading-relaxed">
          Have a question about an order, want a custom piece, or just want to say hello?
          We'd love to hear from you.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#F5E6D3] p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={fields.name}
                onChange={set('name')}
                placeholder="Jane Smith"
                required
                className={inp}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={fields.email}
                onChange={set('email')}
                placeholder="jane@example.com"
                required
                className={inp}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              value={fields.subject}
              onChange={set('subject')}
              required
              className={inp}
            >
              <option value="" disabled>Select a topic…</option>
              <option>Question about an order</option>
              <option>Custom or wholesale inquiry</option>
              <option>Product question</option>
              <option>Something else</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9B8B7E] uppercase tracking-wider mb-1.5">
              Message
            </label>
            <textarea
              value={fields.message}
              onChange={set('message')}
              placeholder="Tell us what's on your mind…"
              required
              rows={6}
              className={inp + ' resize-none'}
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3E2C1F] text-white rounded-xl font-medium hover:bg-[#2D1F15] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending…
              </>
            ) : 'Send Message'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-[#9B8B7E] mt-6">
        You can also email us directly at{' '}
        <a href="mailto:hello@dearmomollie.com" className="text-[#E8B55F] hover:underline">
          hello@dearmomollie.com
        </a>
      </p>
    </div>
  )
}
