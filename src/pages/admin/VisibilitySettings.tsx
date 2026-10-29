import { useState } from 'react'
import { useLang } from '@/context/LangContext'

interface VisibilitySettingsProps {
  active: boolean
  onChange: (active: boolean) => void
  productId?: string  // undefined while creating a new listing
}

/** "Visible on site" toggle, plus the direct link admins can use to test a hidden listing. */
export default function VisibilitySettings({ active, onChange, productId }: VisibilitySettingsProps) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  const url = productId ? `${window.location.origin}/products/${productId}` : null

  const copy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked; the link is still selectable
    }
  }

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${active ? 'border-gray-200' : 'border-amber-300 bg-amber-50'}`}>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox" checked={active} onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 accent-[#E8B55F]"
        />
        <span className="text-sm font-medium text-gray-700">{t('form.visible')}</span>
      </label>
      {!active && (
        <div className="text-sm text-gray-600 space-y-2">
          <p>{t('form.hiddenHint')}</p>
          {url ? (
            <div className="flex flex-wrap items-center gap-2">
              <code className="px-2 py-1 bg-white border border-amber-200 rounded text-xs text-gray-800 break-all select-all">{url}</code>
              <button
                type="button" onClick={copy}
                className="px-3 py-1 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700"
              >
                {copied ? t('form.linkCopied') : t('form.copyLink')}
              </button>
              <a
                href={url} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1 bg-[#E8B55F] hover:bg-[#D4A04D] text-white rounded-lg text-xs font-medium"
              >
                {t('form.openLink')}
              </a>
            </div>
          ) : (
            <p className="text-xs text-gray-500">{t('form.hiddenLinkAfterSave')}</p>
          )}
        </div>
      )}
    </div>
  )
}
