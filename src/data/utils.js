export function parseAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN
  const normalized = String(value ?? "").trim().replace(/,/g, ".")
  if (!/^\d+(\.\d+)?$/.test(normalized)) return NaN
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : NaN
}

export function sanitizeAmountInput(value) {
  const cleaned = String(value ?? "").replace(/[^0-9.,]/g, "").replace(/,/g, ".")
  const [integerPart = "", ...fractionParts] = cleaned.split(".")
  return fractionParts.length ? `${integerPart}.${fractionParts.join("")}` : integerPart
}

export function personKey(value) {
  return String(value ?? "").trim().toLocaleLowerCase("tr-TR")
}

export function formatTL(value) {
  const num = Number(value) || 0
  return num.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL"
}

export function today() {
  const d = new Date()
  const gg = String(d.getDate()).padStart(2, "0")
  const aa = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${gg}.${aa}.${yyyy}`
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function activeEntries(entries) {
  return entries.filter((e) => e.amount - e.paid > 0.0001)
}

export function paidEntries(entries) {
  return entries.filter((e) => e.amount - e.paid <= 0.0001)
}

export function buildPersonList(entries, typeFilter = null) {
  const active = activeEntries(entries)
  const map = new Map()
  for (const e of active) {
    if (typeFilter && e.type !== typeFilter) continue
    const remaining = e.amount - e.paid
    const cur = map.get(e.person) || { person: e.person, net: 0, count: 0, lastNote: "" }
    cur.net += e.type === "alacak" ? remaining : -remaining
    cur.count += 1
    if (e.note && !cur.lastNote) cur.lastNote = e.note
    map.set(e.person, cur)
  }
  return Array.from(map.values())
}

export function buildSummary(entries) {
  let alacak = 0
  let borc = 0
  let paid = 0
  for (const e of entries) {
    const remaining = e.amount - e.paid
    paid += e.paid
    if (remaining > 0.0001) {
      if (e.type === "alacak") alacak += remaining
      else borc += remaining
    }
  }
  return { alacak, borc, paid }
}
