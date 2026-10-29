import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { EmbroideryDesign, EmbroideryMockup } from '@/data/products'
import { uploadEmbroideryFile, MAX_EMBROIDERY_UPLOAD_BYTES } from '@/lib/embroideryService'

// ─── Options ──────────────────────────────────────────────────────────────────

export const EMBROIDERY_FONTS = [
  { id: 'Dancing Script', label: 'Script' },
  { id: 'Playfair Display', label: 'Classic' },
  { id: 'Montserrat', label: 'Block' },
  { id: 'Caveat', label: 'Handwritten' },
] as const

export const THREAD_COLORS = [
  { hex: '#3E2C1F', name: 'Espresso' },
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#E8B55F', name: 'Honey' },
  { hex: '#C0392B', name: 'Cherry' },
  { hex: '#E58FA3', name: 'Rose' },
  { hex: '#D9822B', name: 'Pumpkin' },
  { hex: '#F2D04B', name: 'Sunflower' },
  { hex: '#5B8C5A', name: 'Sage' },
  { hex: '#2E5E4E', name: 'Forest' },
  { hex: '#5B7DB1', name: 'Cornflower' },
  { hex: '#1F3A5F', name: 'Navy' },
  { hex: '#8E6CB0', name: 'Lavender' },
  { hex: '#9B8B7E', name: 'Stone' },
]

const CANVAS_SIZE = 600
const MAX_TEXT_LENGTH = 40
const MAX_NOTES_LENGTH = 500

// ─── Draft state (kept by the parent so the design survives closing the modal) ─

interface Stroke {
  color: string
  width: number
  points: [number, number][] // normalized 0..1
}

export interface EmbroideryDraft {
  text: string
  font: string
  textColor: string
  textSize: number           // px at CANVAS_SIZE
  textPos: [number, number]  // normalized center
  strokes: Stroke[]
  notes: string
  reference?: File
  uploadedReference?: { file: File; url: string } // avoids re-uploading the same reference on every save
}

export const EMPTY_DRAFT: EmbroideryDraft = {
  text: '',
  font: EMBROIDERY_FONTS[0].id,
  textColor: THREAD_COLORS[0].hex,
  textSize: 72,
  textPos: [0.5, 0.5],
  strokes: [],
  notes: '',
}

// ─── Rendering ────────────────────────────────────────────────────────────────

/** Canvas height for a print area, keeping the canvas CANVAS_SIZE wide. */
function canvasHeightFor(mockup?: EmbroideryMockup): number {
  if (!mockup) return CANVAS_SIZE
  const areaAspect = (mockup.printArea.width * mockup.aspect) / mockup.printArea.height
  return Math.round(Math.min(CANVAS_SIZE * 3, Math.max(CANVAS_SIZE / 3, CANVAS_SIZE / areaAspect)))
}

function drawFabric(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = '#F3E9D7'
  ctx.fillRect(0, 0, size, size)
  // Faint linen weave
  ctx.strokeStyle = 'rgba(155, 139, 126, 0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i < size; i += 6) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke()
  }
}

function drawHoopGuide(ctx: CanvasRenderingContext2D, size: number) {
  ctx.save()
  ctx.strokeStyle = 'rgba(107, 91, 79, 0.35)'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 8])
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.45, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

/**
 * Without a mockup the design sits on a square of plain fabric. With one, the
 * canvas is the print area itself and stays transparent so the product photo
 * shows through.
 */
function renderDesign(
  ctx: CanvasRenderingContext2D, width: number, height: number, draft: EmbroideryDraft,
  opts: { fabric: boolean; guide: boolean },
) {
  const scale = width / CANVAS_SIZE
  ctx.clearRect(0, 0, width, height)
  if (opts.fabric) drawFabric(ctx, width)
  if (opts.guide) drawHoopGuide(ctx, width)

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const stroke of draft.strokes) {
    if (stroke.points.length === 0) continue
    const w = stroke.width * scale
    ctx.beginPath()
    stroke.points.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x * width, y * height)
      else ctx.lineTo(x * width, y * height)
    })
    if (stroke.points.length === 1) {
      const [x, y] = stroke.points[0]
      ctx.lineTo(x * width + 0.01, y * height)
    }
    // Thread body with a slight shadow, then a dashed sheen to suggest stitches
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
    ctx.shadowOffsetY = 1.5 * scale
    ctx.shadowBlur = 2 * scale
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = w
    ctx.stroke()
    ctx.restore()
    ctx.save()
    ctx.setLineDash([w * 1.4, w * 0.8])
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
    ctx.lineWidth = Math.max(1, w * 0.35)
    ctx.stroke()
    ctx.restore()
  }

  if (draft.text.trim()) {
    ctx.save()
    ctx.font = `600 ${draft.textSize * scale}px "${draft.font}", Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
    ctx.shadowOffsetY = 1.5 * scale
    ctx.shadowBlur = 2 * scale
    ctx.fillStyle = draft.textColor
    ctx.fillText(draft.text, draft.textPos[0] * width, draft.textPos[1] * height)
    ctx.restore()
  }
}

function threadColorsUsed(draft: EmbroideryDraft): string[] {
  const colors = new Set<string>()
  if (draft.text.trim()) colors.add(draft.textColor)
  draft.strokes.forEach((s) => colors.add(s.color))
  return [...colors]
}

function colorName(hex: string): string {
  return THREAD_COLORS.find((c) => c.hex === hex)?.name ?? hex
}

// ─── Component ────────────────────────────────────────────────────────────────

interface EmbroideryDesignerProps {
  open: boolean
  productName: string
  price: number
  note?: string
  mockup?: EmbroideryMockup
  draft: EmbroideryDraft
  onDraftChange: Dispatch<SetStateAction<EmbroideryDraft>>
  onClose: () => void
  onSave: (design: EmbroideryDesign) => void
}

export default function EmbroideryDesigner({
  open, productName, price, note, mockup, draft, onDraftChange, onClose, onSave,
}: EmbroideryDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [mode, setMode] = useState<'text' | 'draw'>('text')
  const [drawColor, setDrawColor] = useState(THREAD_COLORS[0].hex)
  const [drawWidth, setDrawWidth] = useState(8)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasHeight = canvasHeightFor(mockup)

  const set = <K extends keyof EmbroideryDraft>(key: K, value: EmbroideryDraft[K]) =>
    onDraftChange((d) => ({ ...d, [key]: value }))

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) renderDesign(ctx, CANVAS_SIZE, canvasHeight, draft, { fabric: !mockup, guide: !mockup })
  }, [draft, mockup, canvasHeight])

  useEffect(() => {
    if (!open) return
    redraw()
    // Canvas text only uses a web font once it has loaded
    document.fonts?.load(`600 ${draft.textSize}px "${draft.font}"`).then(redraw).catch(() => {})
  }, [open, redraw, draft.font, draft.textSize])

  const referencePreview = useMemo(
    () => (draft.reference ? URL.createObjectURL(draft.reference) : null),
    [draft.reference],
  )
  // Release the preview's object URL when the reference changes or the designer unmounts
  useEffect(() => {
    if (!referencePreview) return
    return () => URL.revokeObjectURL(referencePreview)
  }, [referencePreview])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !saving) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, saving, onClose])

  if (!open) return null

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    return [x, y]
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const pt = pointFromEvent(e)
    if (mode === 'text') {
      set('textPos', pt)
    } else {
      onDraftChange((d) => ({ ...d, strokes: [...d.strokes, { color: drawColor, width: drawWidth, points: [pt] }] }))
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const pt = pointFromEvent(e)
    if (mode === 'text') {
      set('textPos', pt)
    } else {
      onDraftChange((d) => {
        const last = d.strokes[d.strokes.length - 1]
        if (!last) return d
        return { ...d, strokes: [...d.strokes.slice(0, -1), { ...last, points: [...last.points, pt] }] }
      })
    }
  }

  const handlePointerUp = () => { drawingRef.current = false }

  const pointerHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  }

  const hasDesign = draft.text.trim().length > 0 || draft.strokes.length > 0

  const handleReferenceFile = (file: File | undefined) => {
    setError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Reference must be an image file.'); return }
    if (file.size > MAX_EMBROIDERY_UPLOAD_BYTES) { setError('Reference image must be smaller than 5 MB.'); return }
    set('reference', file)
  }

  const handleSave = async () => {
    const referenceFile = draft.reference
    if (!hasDesign && !referenceFile) {
      setError('Add some text, draw a design, or upload a reference image.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = CANVAS_SIZE
      exportCanvas.height = canvasHeight
      const ctx = exportCanvas.getContext('2d')
      if (!ctx) throw new Error('Your browser could not render the design.')
      await document.fonts?.load(`600 ${draft.textSize}px "${draft.font}"`).catch(() => {})
      renderDesign(ctx, CANVAS_SIZE, canvasHeight, draft, { fabric: !mockup, guide: false })
      const blob = await new Promise<Blob | null>((resolve) => exportCanvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Your browser could not render the design.')

      const [previewUrl, referenceUrl] = await Promise.all([
        uploadEmbroideryFile(blob, 'design'),
        (async () => {
          if (!referenceFile) return undefined
          if (draft.uploadedReference?.file === referenceFile) return draft.uploadedReference.url
          const url = await uploadEmbroideryFile(referenceFile, 'reference')
          set('uploadedReference', { file: referenceFile, url })
          return url
        })(),
      ])

      const text = draft.text.trim()
      const notes = draft.notes.trim()
      onSave({
        previewUrl,
        ...(text ? { text, font: draft.font } : {}),
        threadColors: threadColorsUsed(draft),
        ...(notes ? { notes } : {}),
        ...(referenceUrl ? { referenceUrl } : {}),
        ...(mockup ? { mockup } : {}),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your design. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const swatch = (hex: string, selected: boolean, onClick: () => void) => (
    <button
      key={hex}
      type="button"
      onClick={onClick}
      title={colorName(hex)}
      aria-label={colorName(hex)}
      aria-pressed={selected}
      className={`w-7 h-7 rounded-full border-2 transition-transform ${
        selected ? 'border-[#3E2C1F] scale-110' : 'border-[#F5E6D3] hover:scale-105'
      }`}
      style={{ backgroundColor: hex }}
    />
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !saving && onClose()}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Design your embroidery"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#F5E6D3]">
          <div>
            <h2 className="text-xl font-bold text-[#3E2C1F]">Design your embroidery</h2>
            <p className="text-sm text-[#6B5B4F]">{productName} · +${price.toFixed(2)} per bag</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-[#6B5B4F] hover:text-[#3E2C1F] transition-colors p-1"
            aria-label="Close designer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Canvas */}
          <div>
            {mockup ? (
              <div className="relative rounded-xl overflow-hidden border border-[#F5E6D3] bg-[#F5E6D3]">
                <img src={mockup.imageUrl} alt={productName} className="block w-full h-auto select-none" draggable={false} />
                <div
                  className="absolute outline-2 outline-dashed outline-white/80"
                  style={{
                    left: `${mockup.printArea.x * 100}%`,
                    top: `${mockup.printArea.y * 100}%`,
                    width: `${mockup.printArea.width * 100}%`,
                    height: `${mockup.printArea.height * 100}%`,
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={canvasHeight}
                    {...pointerHandlers}
                    className={`block w-full h-full touch-none ${mode === 'draw' ? 'cursor-crosshair' : 'cursor-move'}`}
                  />
                </div>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                {...pointerHandlers}
                className={`w-full aspect-square rounded-xl border border-[#F5E6D3] touch-none ${
                  mode === 'draw' ? 'cursor-crosshair' : 'cursor-move'
                }`}
              />
            )}
            <p className="mt-2 text-xs text-[#9B8B7E]">
              {mode === 'text'
                ? 'Drag on the design area to position your text.'
                : mockup
                  ? "Draw inside the dashed area. That's where it will be stitched."
                  : 'Draw on the fabric. Keep your design inside the dashed hoop.'}
            </p>
            {note && (
              <p className="mt-3 text-sm text-[#6B5B4F] bg-[#FFF8E7] border border-[#F5E6D3] rounded-lg px-3 py-2">{note}</p>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-5">
            <div className="flex rounded-full bg-[#F5E6D3] p-1" role="tablist">
              {(['text', 'draw'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    mode === m ? 'bg-white text-[#3E2C1F] shadow-sm' : 'text-[#6B5B4F] hover:text-[#3E2C1F]'
                  }`}
                >
                  {m === 'text' ? 'Text' : 'Draw'}
                </button>
              ))}
            </div>

            {mode === 'text' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="embroidery-text" className="block text-sm font-medium text-[#3E2C1F] mb-1">Your text</label>
                  <input
                    id="embroidery-text"
                    value={draft.text}
                    maxLength={MAX_TEXT_LENGTH}
                    onChange={(e) => set('text', e.target.value)}
                    placeholder="e.g. The Millers' Loaf"
                    className="w-full px-3 py-2 border border-[#F5E6D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-[#3E2C1F]"
                  />
                  <p className="mt-1 text-xs text-[#9B8B7E] text-right">{draft.text.length}/{MAX_TEXT_LENGTH}</p>
                </div>
                <div>
                  <span className="block text-sm font-medium text-[#3E2C1F] mb-1">Lettering</span>
                  <div className="grid grid-cols-2 gap-2">
                    {EMBROIDERY_FONTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => set('font', f.id)}
                        aria-pressed={draft.font === f.id}
                        className={`px-3 py-2 rounded-lg border text-base transition-colors ${
                          draft.font === f.id ? 'border-[#E8B55F] bg-[#FFF8E7] text-[#3E2C1F]' : 'border-[#F5E6D3] text-[#6B5B4F] hover:border-[#E8B55F]'
                        }`}
                        style={{ fontFamily: `"${f.id}", Georgia, serif` }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="embroidery-size" className="block text-sm font-medium text-[#3E2C1F] mb-1">Size</label>
                  <input
                    id="embroidery-size"
                    type="range" min={32} max={140} step={2}
                    value={draft.textSize}
                    onChange={(e) => set('textSize', Number(e.target.value))}
                    className="w-full accent-[#E8B55F]"
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium text-[#3E2C1F] mb-2">
                    Thread color <span className="font-normal text-[#9B8B7E]">· {colorName(draft.textColor)}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {THREAD_COLORS.map((c) => swatch(c.hex, draft.textColor === c.hex, () => set('textColor', c.hex)))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-[#3E2C1F] mb-2">
                    Thread color <span className="font-normal text-[#9B8B7E]">· {colorName(drawColor)}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {THREAD_COLORS.map((c) => swatch(c.hex, drawColor === c.hex, () => setDrawColor(c.hex)))}
                  </div>
                </div>
                <div>
                  <label htmlFor="embroidery-width" className="block text-sm font-medium text-[#3E2C1F] mb-1">Stitch thickness</label>
                  <input
                    id="embroidery-width"
                    type="range" min={3} max={20} step={1}
                    value={drawWidth}
                    onChange={(e) => setDrawWidth(Number(e.target.value))}
                    className="w-full accent-[#E8B55F]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => set('strokes', draft.strokes.slice(0, -1))}
                    disabled={draft.strokes.length === 0}
                    className="px-4 py-1.5 border border-[#E8B55F] text-[#3E2C1F] rounded-full text-sm hover:bg-[#FFF8E7] disabled:opacity-40"
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={() => set('strokes', [])}
                    disabled={draft.strokes.length === 0}
                    className="px-4 py-1.5 border border-[#F5E6D3] text-[#6B5B4F] rounded-full text-sm hover:border-red-300 hover:text-red-600 disabled:opacity-40"
                  >
                    Clear drawing
                  </button>
                </div>
              </div>
            )}

            {/* Reference image */}
            <div className="pt-4 border-t border-[#F5E6D3]">
              <span className="block text-sm font-medium text-[#3E2C1F] mb-1">
                Reference image <span className="font-normal text-[#9B8B7E]">(optional)</span>
              </span>
              <p className="text-xs text-[#9B8B7E] mb-2">A sketch, logo, or photo we can work from.</p>
              {referencePreview ? (
                <div className="flex items-center gap-3">
                  <img src={referencePreview} alt="Reference" className="w-16 h-16 rounded-lg object-cover border border-[#F5E6D3]" />
                  <button
                    type="button"
                    onClick={() => set('reference', undefined)}
                    className="text-sm text-[#9B8B7E] hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="inline-block cursor-pointer px-4 py-1.5 border border-[#E8B55F] text-[#3E2C1F] rounded-full text-sm hover:bg-[#FFF8E7]">
                  Upload image
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => { handleReferenceFile(e.target.files?.[0]); e.target.value = '' }}
                  />
                </label>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="embroidery-notes" className="block text-sm font-medium text-[#3E2C1F] mb-1">
                Notes for our stitcher <span className="font-normal text-[#9B8B7E]">(optional)</span>
              </label>
              <textarea
                id="embroidery-notes"
                value={draft.notes}
                maxLength={MAX_NOTES_LENGTH}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                placeholder="Placement, sizing, anything we should know…"
                className="w-full px-3 py-2 border border-[#F5E6D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-[#3E2C1F] resize-y"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving design…' : 'Save design'}
            </button>
            <p className="text-xs text-[#9B8B7E] text-center">
              Each piece is stitched by hand, so the finished embroidery may differ slightly from this preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
