import type { EmbroideryDesign } from '@/data/products'

/**
 * Shows a design composited onto its product mockup (or the bare design when it
 * has none). SVG keeps the overlay aligned with the print area at any box size,
 * and avoids canvas compositing, which would need CORS on the storage bucket.
 */
export default function EmbroideryPreview({ design, className = '' }: { design: EmbroideryDesign; className?: string }) {
  const { mockup } = design
  if (!mockup) {
    return <img src={design.previewUrl} alt="Embroidery design" className={`object-cover ${className}`} />
  }
  const w = mockup.aspect * 100
  const h = 100
  const a = mockup.printArea
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label="Embroidery design on product"
    >
      <image href={mockup.imageUrl} x={0} y={0} width={w} height={h} />
      <image
        href={design.previewUrl}
        x={a.x * w}
        y={a.y * h}
        width={a.width * w}
        height={a.height * h}
        preserveAspectRatio="none"
      />
    </svg>
  )
}
