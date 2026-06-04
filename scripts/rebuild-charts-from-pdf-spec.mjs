import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.join(process.cwd(), 'src', 'entities', 'range', 'model', 'charts')
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

function r(rank) {
  const idx = RANKS.indexOf(rank)
  if (idx === -1) throw new Error(`Unknown rank: ${rank}`)
  return idx
}

function pair(rank) {
  return `${rank}${rank}`
}

function pairPlus(minRank) {
  const min = r(minRank)
  return RANKS.slice(0, min + 1).map((x) => pair(x))
}

function pairRange(fromRank, toRank) {
  const from = r(fromRank)
  const to = r(toRank)
  const [start, end] = from <= to ? [from, to] : [to, from]
  return RANKS.slice(start, end + 1).map((x) => pair(x))
}

function combo(high, low, suited) {
  return `${high}${low}${suited ? 's' : 'o'}`
}

function suitedPlus(high, lowMin) {
  const hi = r(high)
  const low = r(lowMin)
  const out = []
  for (let i = low; i > hi; i -= 1) out.push(combo(high, RANKS[i], true))
  return out
}

function offsuitPlus(high, lowMin) {
  const hi = r(high)
  const low = r(lowMin)
  const out = []
  for (let i = low; i > hi; i -= 1) out.push(combo(high, RANKS[i], false))
  return out
}

function suitedRange(high, lowFrom, lowTo) {
  const a = r(lowFrom)
  const b = r(lowTo)
  const [start, end] = a <= b ? [a, b] : [b, a]
  const out = []
  for (let i = start; i <= end; i += 1) out.push(combo(high, RANKS[i], true))
  return out
}

function offsuitRange(high, lowFrom, lowTo) {
  const a = r(lowFrom)
  const b = r(lowTo)
  const [start, end] = a <= b ? [a, b] : [b, a]
  const out = []
  for (let i = start; i <= end; i += 1) out.push(combo(high, RANKS[i], false))
  return out
}

function expandToken(token) {
  // Pairs: 77+, QQ-TT, 99
  let m = token.match(/^([AKQJT98765432])\1\+$/)
  if (m) return pairPlus(m[1])
  m = token.match(/^([AKQJT98765432])\1-([AKQJT98765432])\2$/)
  if (m) return pairRange(m[1], m[2])
  m = token.match(/^([AKQJT98765432])\1$/)
  if (m) return [pair(m[1])]

  // Suited / Offsuit: A2s+, A2o+, K2s-K4s, QJs-Q8s, AKo
  m = token.match(/^([AKQJT98765432])([AKQJT98765432])([so])\+$/)
  if (m) return m[3] === 's' ? suitedPlus(m[1], m[2]) : offsuitPlus(m[1], m[2])
  m = token.match(
    /^([AKQJT98765432])([AKQJT98765432])([so])-([AKQJT98765432])([AKQJT98765432])([so])$/,
  )
  if (m) {
    if (m[1] !== m[4] || m[3] !== m[6]) {
      throw new Error(`Unsupported mixed range token: ${token}`)
    }
    return m[3] === 's'
      ? suitedRange(m[1], m[2], m[5])
      : offsuitRange(m[1], m[2], m[5])
  }
  m = token.match(/^([AKQJT98765432])([AKQJT98765432])([so])$/)
  if (m) return [combo(m[1], m[2], m[3] === 's')]

  throw new Error(`Unsupported token: ${token}`)
}

function addHands(solution, actionId, tokens) {
  for (const token of tokens) {
    for (const hand of expandToken(token)) {
      if (!solution[hand]) solution[hand] = []
      if (!solution[hand].includes(actionId)) solution[hand].push(actionId)
    }
  }
}

function writeChart(chart, actions, actionMap) {
  const solution = {}
  for (const [actionId, tokens] of Object.entries(actionMap)) {
    addHands(solution, actionId, tokens)
  }
  const out = { ...chart, actions, solution }
  const file = path.join(OUT_DIR, `${chart.id}.json`)
  fs.writeFileSync(file, JSON.stringify(out, null, 2))
  console.log('updated', chart.id, Object.keys(solution).length)
}

const ACTIONS = {
  rfi: [
    { id: 'raise', label: 'Открываем всегда', color: '#d32f2f' },
    { id: 'raise_situational', label: 'Открываем в подходящих ситуациях', color: '#f9a825' },
  ],
  iso: [
    { id: 'iso', label: 'Изолейт', color: '#d32f2f' },
    { id: 'complete', label: 'Добор на SB (+0.5bb)', color: '#2e7d32' },
  ],
  sbDef: [
    { id: 'threebet', label: '3-бет всегда', color: '#d32f2f' },
    { id: 'threebet_situational', label: '3-бет ситуационно', color: '#f9a825' },
  ],
  bbDef: [
    { id: 'threebet', label: '3-бет', color: '#d32f2f' },
    { id: 'call', label: 'Колл', color: '#2e7d32' },
  ],
  blinds4bet: [
    { id: 'fivebet_push', label: '5-бет пуш', color: '#7b1fa2' },
    { id: 'call', label: 'Колл 4-бета', color: '#2e7d32' },
    { id: 'call_situational', label: 'Колл ситуационно', color: '#f9a825' },
  ],
  threebetIp: [
    { id: 'fivebet_push', label: '5-бет пуш', color: '#7b1fa2' },
    { id: 'threebet_fold_4bet', label: '3-бет, фолд на 4-бет', color: '#d32f2f' },
    { id: 'threebet_call_4bet', label: '3-бет, колл 4-бета', color: '#f9a825' },
    {
      id: 'threebet_call_4bet_situational',
      label: '3-бет, колл 4-бета ситуационно',
      color: '#2e7d32',
    },
  ],
  def3betIp: [
    { id: 'call_3bet', label: 'Колл 3-бета', color: '#2e7d32' },
    { id: 'fourbet_fold_5bet', label: '4-бет, фолд на 5-бет', color: '#d32f2f' },
    { id: 'fourbet_call_5bet', label: '4-бет, колл 5-бет пуша', color: '#7b1fa2' },
    { id: 'fold', label: 'Фолд', color: '#9aa3a0' },
  ],
}

// Page 4: RFI
writeChart(
  {
    id: 'rfi-utg',
    title: 'RFI — UTG (14%)',
    position: 'UTG',
    situation: 'Open Raise (RFI)',
    sourcePage: 'GreenCharts2024_01-4.pdf',
  },
  ACTIONS.rfi,
  {
    raise: ['77+', 'A2s+', 'K9s+', 'QTs+', 'JTs', 'ATo+', 'KJo+'],
    raise_situational: ['66-55', 'K8s', 'Q9s', 'J9s', 'T9s', '98s', '87s', '76s', '65s', '54s', 'A9o', 'KTo', 'QTo', 'JTo'],
  },
)
writeChart(
  {
    id: 'rfi-mp',
    title: 'RFI — MP (16%)',
    position: 'MP',
    situation: 'Open Raise (RFI)',
    sourcePage: 'GreenCharts2024_01-4.pdf',
  },
  ACTIONS.rfi,
  {
    raise: ['66+', 'A2s+', 'K9s+', 'Q9s+', 'J9s+', 'T9s', 'ATo+', 'KTo+', 'QJo+'],
    raise_situational: ['55', 'K8s', 'Q8s', 'J8s', 'T8s', '98s', '87s', '76s', '65s', '54s', 'A9o', 'K9o', 'QTo', 'JTo'],
  },
)
writeChart(
  {
    id: 'rfi-co',
    title: 'RFI — CO (26%)',
    position: 'CO',
    situation: 'Open Raise (RFI)',
    sourcePage: 'GreenCharts2024_01-4.pdf',
  },
  ACTIONS.rfi,
  {
    raise: ['44+', 'A2s+', 'K5s+', 'Q8s+', 'J8s+', 'T8s+', '97s+', '87s', '76s', '65s', 'A9o+', 'KTo+', 'QTo+', 'JTo'],
    raise_situational: ['33-22', 'K2s-K4s', 'Q5s-Q7s', 'J7s', 'T7s', '96s', '86s', '75s', '64s', '54s', 'A2o-A8o', 'K9o', 'Q9o', 'J9o'],
  },
)
writeChart(
  {
    id: 'rfi-btn',
    title: 'RFI — BU (42%)',
    position: 'BTN',
    situation: 'Open Raise (RFI)',
    sourcePage: 'GreenCharts2024_01-4.pdf',
  },
  ACTIONS.rfi,
  {
    raise: ['22+', 'A2s+', 'K2s+', 'Q2s+', 'J5s+', 'T6s+', '96s+', '85s+', '75s+', '64s+', '54s', 'A2o+', 'K7o+', 'Q9o+', 'J9o+', 'T9o'],
    raise_situational: ['J2s-J4s', 'T2s-T5s', '92s-95s', '82s-84s', '72s-74s', '62s-63s', '52s-53s', '42s-43s', '32s', 'K2o-K6o', 'Q2o-Q8o', 'J2o-J8o', 'T7o-T8o', '97o-98o', '87o'],
  },
)
writeChart(
  {
    id: 'rfi-sb',
    title: 'RFI — SB (44%)',
    position: 'SB',
    situation: 'Open Raise (RFI)',
    sourcePage: 'GreenCharts2024_01-4.pdf',
  },
  ACTIONS.rfi,
  {
    raise: ['22+', 'A2s+', 'K2s+', 'Q2s+', 'J2s+', 'T5s+', '95s+', '85s+', '75s+', '64s+', '54s', 'A2o+', 'K5o+', 'Q8o+', 'J8o+', 'T8o+', '98o'],
    raise_situational: ['T2s-T4s', '92s-94s', '82s-84s', '72s-74s', '62s-63s', '52s-53s', '42s-43s', '32s', 'K2o-K4o', 'Q2o-Q7o', 'J2o-J7o', 'T7o', '97o', '87o'],
  },
)

// Page 5: ISO
writeChart(
  { id: 'iso-mp', title: 'ISO — MP (11%)', position: 'MP', situation: 'Isolate (ISO)', sourcePage: 'GreenCharts2024_01-5.pdf' },
  ACTIONS.iso,
  { iso: ['77+', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'AKo', 'AQo', 'AJo', 'KQo'] },
)
writeChart(
  { id: 'iso-co', title: 'ISO — CO (14%)', position: 'CO', situation: 'Isolate (ISO)', sourcePage: 'GreenCharts2024_01-5.pdf' },
  ACTIONS.iso,
  { iso: ['66+', 'A2s+', 'K9s+', 'QJs', 'QTs', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo'] },
)
writeChart(
  { id: 'iso-btn', title: 'ISO — BU (20%)', position: 'BTN', situation: 'Isolate (ISO)', sourcePage: 'GreenCharts2024_01-5.pdf' },
  ACTIONS.iso,
  { iso: ['55+', 'A2s+', 'K2s+', 'QJs-Q8s', 'JTs-J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'] },
)
writeChart(
  { id: 'iso-sb', title: 'ISO — SB (12%)', position: 'SB', situation: 'Isolate (ISO)', sourcePage: 'GreenCharts2024_01-5.pdf' },
  ACTIONS.iso,
  {
    iso: ['88+', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'QJs', 'AKo', 'AQo', 'AJo', 'KQo'],
    complete: ['77-22', 'A8s-A2s', 'KTs-K2s', 'QTs-Q2s', 'JTs-J2s', 'T9s-T2s', '98s-92s', '87s-82s', '76s-72s', '65s-62s', '54s-52s', '43s', '42s', '32s'],
  },
)
writeChart(
  { id: 'iso-bb', title: 'ISO — BB (14%)', position: 'BB', situation: 'Isolate (ISO)', sourcePage: 'GreenCharts2024_01-5.pdf' },
  ACTIONS.iso,
  { iso: ['66+', 'A2s+', 'K9s+', 'QJs', 'QTs', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo'] },
)

// Page 6: SB defense
for (const item of [
  ['sb-vs-utg', 'SB vs UTG', ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'AKo'], ['99', 'ATs', 'KQs', 'KJs']],
  ['sb-vs-mp', 'SB vs MP', ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'KQs', 'AKo', 'AQo'], ['99', 'ATs', 'KJs', 'QJs', 'A5s']],
  ['sb-vs-co', 'SB vs CO', ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'AKo', 'AQo', 'AJo'], ['88', '77', 'A9s', 'A5s', 'A4s', 'A3s', 'KTs', 'KJo']],
  ['sb-vs-btn', 'SB vs BU', ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', 'AKo', 'AQo', 'AJo', 'ATo'], ['A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTs', 'K9s', 'QTs', 'J9s', 'KQo', 'KJo']],
]) {
  writeChart(
    { id: item[0], title: item[1], position: 'SB', situation: 'Small Blind Defense', sourcePage: 'GreenCharts2024_01-6.pdf' },
    ACTIONS.sbDef,
    { threebet: item[2], threebet_situational: item[3] },
  )
}

// Page 7: BB defense
for (const item of [
  ['bb-vs-utg', 'BB vs UTG', ['AA', 'KK', 'QQ', 'AKs', 'AQs', 'AJs', 'AKo'], ['JJ-22', 'ATs-A2s', 'KQs-K9s', 'QJs-QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', '54s', 'AQo', 'AJo', 'KQo']],
  ['bb-vs-mp', 'BB vs MP', ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'AJs', 'ATs', 'AKo', 'AQo'], ['TT-22', 'A9s-A2s', 'KQs-K9s', 'QJs-QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', '54s', 'AJo', 'ATo', 'KQo']],
  ['bb-vs-co', 'BB vs CO', ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo'], ['99-22', 'A9s-A6s', 'KQs-K8s', 'QJs-Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '65s', '54s', 'ATo', 'KQo', 'KJo', 'QJo']],
  ['bb-vs-sb', 'BB vs SB', ['AA-88', '22', 'AKs-A2s', 'KQs-K8s', 'QJs-Q9s', 'JTs-J9s', 'T9s-T8s', '98s-97s', '87s-86s', '76s', '75s', '65s', '64s', '54s', 'AKo-A7o', 'KQo-KTo', 'QJo', 'QTo', 'JTo'], ['77-33', 'K7s-K2s', 'Q8s-Q2s', 'J8s-J2s', 'T7s-T2s', '96s-92s', '85s-82s', '74s-72s', '63s-62s', '53s-52s', '43s-42s', '32s', 'A6o-A2o', 'K9o-K2o', 'Q9o-Q2o', 'J9o-J2o', 'T9o-T2o', '98o-92o', '87o-82o', '76o-72o', '65o-62o', '54o-52o', '43o']],
  ['bb-vs-btn-25', 'BB vs BU (2.5bb)', ['AA-TT', 'AKs-A9s', 'A5s-A2s', 'KQs', 'KJs', 'QJs', 'AKo', 'AQo', 'AJo', 'KQo'], ['99-22', 'A8s-A6s', 'KTs-K2s', 'QTs-Q2s', 'JTs-J2s', 'T9s-T2s', '98s-92s', '87s-82s', '76s-72s', '65s-62s', '54s-52s', '43s-42s', '32s', 'ATo-A2o', 'KJo-K2o', 'QJo-Q2o', 'JTo-J2o', 'T9o-T2o', '98o-92o', '87o-82o', '76o-72o', '65o-62o', '54o-52o', '43o']],
  ['bb-vs-btn-30', 'BB vs BU (3bb)', ['AA-TT', 'AKs-A9s', 'A5s-A2s', 'KQs', 'KJs', 'QJs', 'AKo', 'AQo', 'AJo', 'KQo'], ['99-22', 'A8s-A6s', 'KTs-K2s', 'QTs-Q2s', 'JTs-J2s', 'T9s-T2s', '98s-92s', '87s-82s', '76s-72s', '65s-62s', '54s-52s', '43s-42s', '32s', 'ATo-A2o', 'KJo-K2o', 'QJo-Q2o', 'JTo-J2o', 'T9o-T2o', '98o-92o', '87o-82o', '76o-72o', '65o-62o', '54o-52o', '43o']],
]) {
  writeChart(
    { id: item[0], title: item[1], position: 'BB', situation: 'Big Blind Defense', sourcePage: 'GreenCharts2024_01-7.pdf' },
    ACTIONS.bbDef,
    { threebet: item[2], call: item[3] },
  )
}

// Page 8: Blinds vs 4bet
for (const item of [
  ['blinds-vs-utg-4bet', 'SB|BB vs UTG', ['AA', 'AKs', 'AQs'], ['AKo', 'KK'], []],
  ['blinds-vs-mp-4bet', 'SB|BB vs MP', ['AA', 'AKs'], ['AKo', 'KK'], ['AQs', 'TT']],
  ['blinds-vs-co-4bet', 'SB|BB vs CO', ['AA', 'AKs', 'AQs'], ['AKo', 'KK', 'QQ', 'JJ'], ['AJs', 'KQs', 'KJs', 'TT']],
  ['bb-vs-sb-4bet', 'BB vs SB', ['AA', 'AKs', 'AKo', 'KK', 'QQ', 'JJ', 'TT', '99', 'A5s', 'A4s'], ['AQs', 'AJs', 'KQs', 'KJs', 'QJs'], ['ATs', 'KTs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', '54s']],
  ['blinds-vs-btn-25-4bet', 'SB|BB vs BU (2.5bb)', ['AA', 'AKs', 'AKo', 'KK', 'QQ', 'JJ', 'TT', '99', 'A5s', 'A4s'], ['AQs', 'AJs', 'KQs', 'KJs', 'QJs'], ['ATs', 'KTs', 'QTs', 'JTs']],
  ['blinds-vs-btn-30-4bet', 'SB|BB vs BU (3bb)', ['AA', 'AKs', 'AKo', 'KK', 'QQ', 'JJ', 'TT', '99', 'A5s'], ['AQs', 'AJs', 'KQs', 'KJs', 'QJs'], ['ATs', 'KTs', 'QTs', 'JTs']],
]) {
  writeChart(
    { id: item[0], title: item[1], position: item[0] === 'bb-vs-sb-4bet' ? 'BB' : 'SB', situation: 'Blinds Defense vs 4bet', sourcePage: 'GreenCharts2024_01-8.pdf' },
    ACTIONS.blinds4bet,
    { fivebet_push: item[2], call: item[3], call_situational: item[4] },
  )
}

// Page 9: 3Bet IP
writeChart(
  { id: '3bet-ip-15', title: '3bet IP vs RFI 15%', position: 'IP', situation: '3Bet IP', sourcePage: 'GreenCharts2024_01-9.pdf' },
  ACTIONS.threebetIp,
  {
    fivebet_push: ['AA', 'KK'],
    threebet_call_4bet: ['AKs', 'AQs', 'AJs', 'AKo', 'QQ'],
    threebet_fold_4bet: ['ATs', 'KQs', 'KJs', 'QJs', 'JJ', 'TT', '99'],
    threebet_call_4bet_situational: ['AQo'],
  },
)
writeChart(
  { id: '3bet-ip-18', title: '3bet IP vs RFI 18%', position: 'IP', situation: '3Bet IP', sourcePage: 'GreenCharts2024_01-9.pdf' },
  ACTIONS.threebetIp,
  {
    fivebet_push: ['AA', 'KK'],
    threebet_call_4bet: ['AKs', 'AQs', 'AJs', 'AKo', 'QQ', 'KQs'],
    threebet_fold_4bet: ['ATs', 'KJs', 'KTs', 'QJs', 'QTs', 'JJ', 'JTs', 'TT', '99', '88'],
    threebet_call_4bet_situational: ['AQo'],
  },
)
writeChart(
  { id: '3bet-ip-26', title: '3bet IP vs RFI 26%', position: 'IP', situation: '3Bet IP', sourcePage: 'GreenCharts2024_01-9.pdf' },
  ACTIONS.threebetIp,
  {
    fivebet_push: ['AA', 'KK'],
    threebet_call_4bet: ['AKs', 'AQs', 'AJs', 'ATs', 'AKo', 'QQ', 'KQs', 'KJs', 'KTs', '99'],
    threebet_fold_4bet: ['A5s', 'A4s', 'QJs', 'QTs', 'JJ', 'JTs', 'TT', '88', '77', '76s'],
    threebet_call_4bet_situational: ['AQo'],
  },
)

// Page 10: known accurate charts with mixed 50% vs fold
writeChart(
  { id: 'def-3bet-ip-6', title: 'IP vs 3bet 6%', position: 'IP', situation: 'Defense vs 3Bet IP', sourcePage: 'GreenCharts2024_01-10.pdf' },
  ACTIONS.def3betIp,
  {
    fourbet_call_5bet: ['AA', 'KK', 'AKs'],
    call_3bet: ['QQ-TT', 'AQs', 'AJs', 'KQs', 'AKo'],
  },
)
writeChart(
  { id: 'def-3bet-ip-14', title: 'IP vs 3bet 14%', position: 'IP', situation: 'Defense vs 3Bet IP', sourcePage: 'GreenCharts2024_01-10.pdf' },
  ACTIONS.def3betIp,
  {
    fourbet_call_5bet: ['AA', 'KK', 'AKs'],
    fourbet_fold_5bet: ['AKo'],
    call_3bet: ['QQ-66', 'AQs-AJs', 'KQs'],
    // Split 50/50 (action + fold)
    fourbet_fold_5bet: ['AKo', 'A5s-A2s'],
    call_3bet: ['QQ-66', 'AQs-AJs', 'KQs', 'A9s-A6s', 'KJs', 'QJs', 'T9s', '98s', '87s', '76s', '65s', '54s'],
    fold: ['A5s-A2s', 'A9s-A6s', 'KJs', 'QJs', 'T9s', '98s', '87s', '76s', '65s', '54s'],
  },
)

console.log('Rebuild from PDF spec complete.')
