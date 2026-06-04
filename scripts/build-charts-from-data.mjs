import fs from 'node:fs'
import path from 'node:path'

import { CHARTS } from './charts-green-data.mjs'

const outDir = path.join(process.cwd(), 'src/entities/range/model/charts')
fs.mkdirSync(outDir, { recursive: true })

for (const chart of CHARTS) {
  const file = path.join(outDir, `${chart.id}.json`)
  fs.writeFileSync(file, JSON.stringify(chart, null, 2))
  console.log(chart.id, Object.keys(chart.solution).length, 'hands')
}
