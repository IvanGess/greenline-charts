import path from 'node:path'
import { createCanvas, loadImage } from '@napi-rs/canvas'

const page = process.argv[2] ?? 'GreenCharts2024_01-4'
const png = path.join(process.cwd(), `docs/rendered/${page}.png`)
const img = await loadImage(png)
const canvas = createCanvas(img.width, img.height)
const ctx = canvas.getContext('2d')
ctx.drawImage(img, 0, 0)
const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height)

function isAction(r, g, b) {
  if (r > 210 && g < 110 && b < 110) return true
  if (g > 190 && r < 110 && b < 110) return true
  if (r > 210 && g > 190 && b < 90) return true
  if (b > 150 && r > 90 && g < 90) return true
  return false
}

const mask = new Uint8Array(width * height)
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4
    if (isAction(data[i], data[i + 1], data[i + 2])) mask[y * width + x] = 1
  }
}

const regions = []
const seen = new Uint8Array(width * height)
const stack = []

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const start = y * width + x
    if (!mask[start] || seen[start]) continue
    let minX = x
    let maxX = x
    let minY = y
    let maxY = y
    let pixels = 0
    stack.push(start)
    seen[start] = 1
    while (stack.length) {
      const cur = stack.pop()
      const cy = Math.floor(cur / width)
      const cx = cur - cy * width
      pixels += 1
      minX = Math.min(minX, cx)
      maxX = Math.max(maxX, cx)
      minY = Math.min(minY, cy)
      maxY = Math.max(maxY, cy)
      const neigh = [
        cur - 1,
        cur + 1,
        cur - width,
        cur + width,
      ]
      for (const n of neigh) {
        const nx = n % width
        const ny = Math.floor(n / width)
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        if (!mask[n] || seen[n]) continue
        seen[n] = 1
        stack.push(n)
      }
    }
  const area = (maxX - minX) * (maxY - minY)
  if (pixels > 800 && area > width * height * 0.002) {
    regions.push({
      minX,
      minY,
      maxX,
      maxY,
      pixels,
      bbox: [
        minX / width,
        minY / height,
        (maxX - minX) / width,
        (maxY - minY) / height,
      ],
    })
  }
  }
}

let maskSum = 0
for (let i = 0; i < mask.length; i += 1) maskSum += mask[i]
console.log('mask pixels', maskSum, 'regions raw', regions.length)

regions.sort((a, b) => a.minY - b.minY || a.minX - b.minX)
for (const r of regions) {
  console.log(
    page,
    `bbox: [${r.bbox.map((n) => n.toFixed(3)).join(', ')}]`,
    `px ${r.pixels}`,
  )
}
