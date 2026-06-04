import fs from 'node:fs'
import path from 'node:path'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const docsDir = path.join(process.cwd(), 'docs')
const files = fs
  .readdirSync(docsDir)
  .filter((f) => f.startsWith('GreenCharts') && f.endsWith('.pdf'))
  .sort()

for (const file of files) {
  const buf = new Uint8Array(fs.readFileSync(path.join(docsDir, file)))
  const doc = await getDocument({ data: buf, useSystemFonts: true }).promise
  let text = ''
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((it) => ('str' in it ? it.str : '')).join(' ') + '\n'
  }
  console.log('\n====', file, '====')
  console.log(text.trim().slice(0, 1500) || '(no text)')
}
