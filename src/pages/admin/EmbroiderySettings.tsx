import { useRef, useState } from 'react'
import type { EmbroideryMockup, PrintArea, ProductImage } from '@/data/products'
import { uploadProductImage } from '@/lib/productService'
import { useLang } from '@/context/LangContext'

export interface EmbroideryFormFields {
  embroideryEnabled: boolean
  embroideryPrice: string
  embroideryNote: string
  embroideryMockup: EmbroideryMockup | null
}

export function toEmbroideryFormFields(p?: {
  embroideryEnabled?: boolean
  embroideryPrice?: number
  embroideryNote?: string
  embroideryMockup?: EmbroideryMockup | null
}): EmbroideryFormFields {
  return {
    embroideryEnabled: p?.embroideryEnabled ?? false,
    embroideryPrice: p?.embroideryPrice?.toString() ?? '',
    embroideryNote: p?.embroideryNote ?? '',
    embroideryMockup: p?.embroideryMockup ?? null,
  }
}

/** Firestore fields to save. Written explicitly (not `|| undefined`) so turning things off persists on update. */
export function embroideryFieldsToProduct(f: EmbroideryFormFields) {
  return {
    embroideryEnabled: f.embroideryEnabled,
    embroideryPrice: f.embroideryPrice !== '' ? parseFloat(f.embroideryPrice) : undefined,
    embroideryNote: f.embroideryNote.trim(),
    embroideryMockup: f.embroideryMockup,
  }
}

const DEFAULT_AREA: PrintArea = { x: 0.3, y: 0.3, width: 0.4, height: 0.4 }
const MIN_SIZE = 0.05

type Drag = { kind: 'move' | 'resize'; startX: number; startY: number; start: PrintArea }

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function PrintAreaEditor({ mockup, onChange }: { mockup: EmbroideryMockup; onChange: (m: EmbroideryMockup) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<Drag | null>(null)
  const a = mockup.printArea

  const startDrag = (kind: Drag['kind']) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    containerRef.current?.setPointerCapture(e.pointerId)
    dragRef.current = { kind, startX: e.clientX, startY: e.clientY, start: a }
  }

  const handleMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    const rect = containerRef.current?.getBoundingClientRect()
    if (!drag || !rect) return
    const dx = (e.clientX - drag.startX) / rect.width
    const dy = (e.clientY - drag.startY) / rect.height
    const s = drag.start
    const printArea = drag.kind === 'move'
      ? { ...s, x: clamp(s.x + dx, 0, 1 - s.width), y: clamp(s.y + dy, 0, 1 - s.height) }
      : { ...s, width: clamp(s.width + dx, MIN_SIZE, 1 - s.x), height: clamp(s.height + dy, MIN_SIZE, 1 - s.y) }
    onChange({ ...mockup, printArea })
  }

  const endDrag = () => { dragRef.current = null }

  return (
    <div
      ref={containerRef}
      className="relative max-w-sm rounded-lg overflow-hidden border border-gray-200 select-none touch-none"
      onPointerMove={handleMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <img
        src={mockup.imageUrl}
        alt="Mockup"
        draggable={false}
        className="block w-full h-auto"
        onLoad={(e) => {
          const img = e.currentTarget
          const aspect = img.naturalWidth / img.naturalHeight
          if (aspect > 0 && Math.abs(aspect - mockup.aspect) > 0.001) onChange({ ...mockup, aspect })
        }}
      />
      <div
        onPointerDown={startDrag('move')}
        className="absolute border-2 border-dashed border-[#E8B55F] bg-[#E8B55F]/20 cursor-move"
        style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%`, width: `${a.width * 100}%`, height: `${a.height * 100}%` }}
      >
        <div
          onPointerDown={startDrag('resize')}
          className="absolute -right-1.5 -bottom-1.5 w-4 h-4 rounded-sm bg-[#E8B55F] border-2 border-white cursor-nwse-resize"
        />
      </div>
    </div>
  )
}

interface EmbroiderySettingsProps {
  value: EmbroideryFormFields
  onChange: (patch: Partial<EmbroideryFormFields>) => void
  images: ProductImage[]  // listing images, offered as mockup choices
  isBundle?: boolean
}

export default function EmbroiderySettings({ value, onChange, images, isBundle }: EmbroiderySettingsProps) {
  const { t } = useLang()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const chooseImage = (imageUrl: string) =>
    onChange({
      embroideryMockup: {
        imageUrl,
        aspect: value.embroideryMockup?.aspect ?? 1, // corrected by the editor once the image loads
        printArea: value.embroideryMockup?.printArea ?? DEFAULT_AREA,
      },
    })

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadError('')
    try {
      chooseImage(await uploadProductImage(file))
    } catch {
      setUploadError(t('form.errUpload'))
    } finally {
      setUploading(false)
    }
  }

  const candidates = images.filter((img) => img.url.trim())

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{t('form.embroidery')}</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox" checked={value.embroideryEnabled}
            onChange={(e) => onChange({ embroideryEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#E8B55F]"
          />
          <span className="text-sm text-gray-700">
            {t(isBundle ? 'form.embroideryEnabledBundle' : 'form.embroideryEnabled')}
          </span>
        </label>
      </div>

      {value.embroideryEnabled && (
        <>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(isBundle ? 'form.embroideryPriceBundle' : 'form.embroideryPrice')}
            </label>
            <input
              type="number" min="0" step="0.01" value={value.embroideryPrice}
              onChange={(e) => onChange({ embroideryPrice: e.target.value })} required placeholder="10.00"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
            />
            <p className="mt-1 text-xs text-gray-400">{t('form.embroideryPriceHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.embroideryNote')}
              <span className="ml-2 text-xs text-gray-400 font-normal">{t('form.embroideryNoteHint')}</span>
            </label>
            <textarea
              value={value.embroideryNote} onChange={(e) => onChange({ embroideryNote: e.target.value })}
              rows={2} placeholder={t('form.embroideryNotePlaceholder')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 resize-y"
            />
          </div>
        </>
      )}

      {/* Mockup — shown even when embroidery is off, so bags used in embroiderable bundles can have one */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.mockup')}
          <span className="ml-2 text-xs text-gray-400 font-normal">{t(isBundle ? 'form.mockupHintBundle' : 'form.mockupHint')}</span>
        </label>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {candidates.map((img) => (
            <button
              key={img.url}
              type="button"
              onClick={() => chooseImage(img.url)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${
                value.embroideryMockup?.imageUrl === img.url ? 'border-[#E8B55F]' : 'border-transparent hover:border-gray-300'
              }`}
              title={t('form.mockupUseImage')}
            >
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
          <label className="cursor-pointer px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
            {uploading ? t('form.uploading') : t('form.mockupUpload')}
            <input
              type="file" accept="image/*" className="hidden" disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
            />
          </label>
          {value.embroideryMockup && (
            <button
              type="button"
              onClick={() => onChange({ embroideryMockup: null })}
              className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700"
            >
              {t('form.mockupRemove')}
            </button>
          )}
        </div>
        {uploadError && <p className="text-xs text-red-600 mb-2">{uploadError}</p>}
        {value.embroideryMockup ? (
          <>
            <PrintAreaEditor mockup={value.embroideryMockup} onChange={(m) => onChange({ embroideryMockup: m })} />
            <p className="mt-1 text-xs text-gray-400">{t('form.mockupAreaHint')}</p>
          </>
        ) : (
          <p className="text-xs text-gray-400">{t('form.mockupNone')}</p>
        )}
      </div>
    </div>
  )
}
