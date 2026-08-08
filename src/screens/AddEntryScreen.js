import React, { useMemo, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { colors, radius, spacing } from "../theme"
import { useData } from "../data/DataContext"
import { parseAmount, sanitizeAmountInput, today } from "../data/utils"
import Button from "../components/Button"

// EKRAN: KAYIT EKLE / DÜZENLE
// ============================================================================
export default function AddEntryScreen({ navigation, route }) {
  const { entries, addEntry, updateEntry } = useData()
  const editItem = route.params?.editItem || null
  const presetPerson = route.params?.person || ""
  const presetType = route.params?.type || "borc"

  const [person, setPerson] = useState(editItem ? editItem.person : presetPerson)
  const [type, setType] = useState(editItem ? editItem.type : presetType)
  const [amount, setAmount] = useState(editItem ? String(editItem.amount) : "")
  const [note, setNote] = useState(editItem ? editItem.note : "")
  const [date, setDate] = useState(editItem ? editItem.date : "")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const knownPeople = useMemo(() => {
    const set = new Set(entries.map((e) => e.person))
    return Array.from(set)
  }, [entries])

  const suggestions = useMemo(() => {
    if (!person.trim()) return []
    return knownPeople.filter(
      (p) =>
        p.toLowerCase().includes(person.trim().toLowerCase()) &&
        p.toLowerCase() !== person.trim().toLowerCase()
    )
  }, [person, knownPeople])

  const handleSave = () => {
    if (!person.trim()) {
      Alert.alert("Uyarı", "Lütfen bir kişi adı girin.")
      return
    }
    const numericAmount = parseAmount(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("Uyarı", "Lütfen tek bir ondalık ayraç içeren geçerli bir miktar girin.")
      return
    }
    if (!type) {
      Alert.alert("Uyarı", "Lütfen kayıt türünü (Borç / Alacak) seçin.")
      return
    }
    const finalDate = date.trim() || today()

    if (editItem) {
      if (numericAmount < editItem.paid) {
        Alert.alert(
          "Uyarı",
          `Miktar, yapılmış ödeme tutarından (${editItem.paid} TL) az olamaz.`
        )
        return
      }
      updateEntry(editItem.id, {
        person: person.trim(),
        type,
        amount: numericAmount,
        note: note.trim(),
        date: finalDate,
      })
    } else {
      addEntry({ person, type, amount, note, date: finalDate })
    }
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={add.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={add.label}>Kişi</Text>
        <TextInput
          style={add.input}
          placeholder="Kişi adı yazın..."
          placeholderTextColor={colors.textMuted}
          value={person}
          onChangeText={(t) => {
            setPerson(t)
            setShowSuggestions(true)
          }}
        />
        {showSuggestions &&
          suggestions.map((s) => (
            <TouchableOpacity
              key={s}
              style={add.suggestion}
              onPress={() => {
                setPerson(s)
                setShowSuggestions(false)
              }}
            >
              <Text style={add.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}

        <Text style={add.label}>Tür</Text>
        <View style={add.typeRow}>
          <TouchableOpacity
            style={[
              add.typeBtn,
              { backgroundColor: type === "borc" ? colors.danger : colors.surfaceAlt },
            ]}
            onPress={() => setType("borc")}
          >
            <Text style={add.typeBtnText}>Borç Aldım</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              add.typeBtn,
              { backgroundColor: type === "alacak" ? colors.success : colors.surfaceAlt },
            ]}
            onPress={() => setType("alacak")}
          >
            <Text style={add.typeBtnText}>Alacak Vereceğim</Text>
          </TouchableOpacity>
        </View>

        <Text style={add.label}>Miktar (TL)</Text>
        <TextInput
          style={add.input}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={amount}
          onChangeText={(t) => setAmount(sanitizeAmountInput(t))}
        />

        <Text style={add.label}>Tarih (GG.AA.YYYY) — boş bırakılırsa bugün</Text>
        <TextInput
          style={add.input}
          placeholder={today()}
          placeholderTextColor={colors.textMuted}
          value={date}
          onChangeText={setDate}
        />

        <Text style={add.label}>Not / Açıklama (isteğe bağlı)</Text>
        <TextInput
          style={[add.input, add.textarea]}
          placeholder="Açıklama..."
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Button
          title={editItem ? "Değişiklikleri Kaydet" : "Kaydet"}
          onPress={handleSave}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const add = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: 60 },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
  },
  textarea: { minHeight: 90, textAlignVertical: "top" },
  suggestion: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: { color: colors.text, fontSize: 15 },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  typeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
  },
  typeBtnText: { color: colors.onPrimary, fontWeight: "600", fontSize: 15 },
})
