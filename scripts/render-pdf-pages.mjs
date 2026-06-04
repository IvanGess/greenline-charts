import fs from 'node:fs'
import path from 'node:path'
import { createCanvas } from '@napi-rs/canvas'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const docsDir = path.join(process.cwd(), 'docs')
const outDir = path.join(docsDir, 'rendered')
fs.mkdirSync(outDir, { recursive: true })

const files = fs
  .readdirSync(docsDir)
  .filter((f) => f.startsWith('GreenCharts') && f.endsWith('.pdf'))
  .sort()

for (const file of files) {
  const buf = new Uint8Array(fs.readFileSync(path.join(docsDir, file)))
  const doc = await getDocument({ data: buf, useSystemFonts: true }).promise
  const page = await doc.getPage(1)
  const scale = 2
  const viewport = page.getViewport({ scale })
  const canvas = createCanvas(viewport.width, viewport.height)
  const ctx = canvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise
  const base = file.replace('.pdf', '')
  const outPath = path.join(outDir, `${base}.png`)
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'))
  console.log('wrote', outPath, viewport.width, 'x', viewport.height)
}
