import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { makeId, parseAmount, personKey } from "./utils"

const STORAGE_KEY = "@borc_takip_entries_v1"
const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [entries, setEntries] = useState([])
  const [loaded, setLoaded] = useState(false)
  const entriesRef = useRef([])
  const writeQueueRef = useRef(Promise.resolve())

  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          const normalized = Array.isArray(parsed) ? parsed.map(normalizeEntry) : []
          entriesRef.current = normalized
          setEntries(normalized)
        }
      } catch (e) {
        console.log("load error", e)
      } finally {
        setLoaded(true)
      }
    })()
  }, [])

  const persist = useCallback((nextOrUpdater) => {
    const next = typeof nextOrUpdater === "function"
      ? nextOrUpdater(entriesRef.current)
      : nextOrUpdater
    entriesRef.current = next
    setEntries(next)
    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)))
      .catch((e) => console.log("save error", e))
    return writeQueueRef.current
  }, [])

  const addEntry = useCallback(({ person, type, amount, note, date }) => {
    const numericAmount = parseAmount(amount)
    if (!person?.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return false
    const entry = {
      id: makeId(), person: person.trim(), type, amount: numericAmount, paid: 0, payments: [],
      note: note ? note.trim() : "", date, createdAt: Date.now(),
    }
    persist((current) => [entry, ...current])
    return true
  }, [persist])

  const updateEntry = useCallback((id, changes) => {
    persist((current) => current.map((e) => (e.id === id ? { ...e, ...changes } : e)))
  }, [persist])

  const deleteEntry = useCallback((id) => {
    persist((current) => current.filter((e) => e.id !== id))
  }, [persist])

  const deletePerson = useCallback((personName) => {
    const key = personKey(personName)
    persist((current) => current.filter((e) => personKey(e.person) !== key))
  }, [persist])

  const updatePersonName = useCallback((oldName, newName) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const oldKey = personKey(oldName)
    persist((current) => current.map((e) => (personKey(e.person) === oldKey ? { ...e, person: trimmed } : e)))
  }, [persist])

  const payEntry = useCallback((id, payAmount) => {
    persist((current) => current.map((e) => {
      if (e.id !== id) return e
      const remaining = Math.max(0, e.amount - e.paid)
      const requested = payAmount == null ? remaining : parseAmount(payAmount)
      if (!Number.isFinite(requested) || requested <= 0) return e
      const pay = Math.min(requested, remaining)
      return { ...e, paid: e.paid + pay, payments: [...(e.payments || []), { id: makeId(), amount: pay, createdAt: Date.now() }] }
    }))
  }, [persist])

  const undoEntry = useCallback((id) => {
    persist((current) => current.map((e) => {
      if (e.id !== id) return e
      const payments = Array.isArray(e.payments) ? e.payments : []
      if (payments.length === 0) return { ...e, paid: 0 }
      const lastPayment = payments[payments.length - 1]
      return { ...e, paid: Math.max(0, e.paid - lastPayment.amount), payments: payments.slice(0, -1) }
    }))
  }, [persist])

  const resetAll = useCallback(() => persist([]), [persist])
  const importData = useCallback((data) => {
    if (!Array.isArray(data)) return false
    persist(data.map(normalizeEntry))
    return true
  }, [persist])

  const value = { entries, loaded, addEntry, updateEntry, deleteEntry, deletePerson, updatePersonName, payEntry, undoEntry, resetAll, importData }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function normalizeEntry(entry) {
  const amount = parseAmount(entry?.amount)
  const paid = Number.isFinite(Number(entry?.paid)) ? Math.max(0, Number(entry.paid)) : 0
  return { ...entry, amount: Number.isFinite(amount) ? amount : 0, paid, payments: Array.isArray(entry?.payments) ? entry.payments : [] }
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}
