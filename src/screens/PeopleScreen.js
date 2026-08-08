import React, { useMemo, useState } from "react"
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { colors, radius, spacing } from "../theme"
import { useData } from "../data/DataContext"
import Button from "../components/Button"

// EKRAN: KİŞİ YÖNETİMİ
// ============================================================================
export default function PeopleScreen({ navigation }) {
  const { entries, deletePerson, updatePersonName } = useData()
  const [query, setQuery] = useState("")
  const [editTarget, setEditTarget] = useState(null)
  const [newName, setNewName] = useState("")

  const allPeople = useMemo(() => {
    const set = new Set(entries.map((e) => e.person))
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"))
  }, [entries])

  const filtered = useMemo(() => {
    return query.trim()
      ? allPeople.filter((p) => p.toLowerCase().includes(query.trim().toLowerCase()))
      : allPeople
  }, [allPeople, query])

  const confirmDelete = (person) => {
    Alert.alert(
      "Kişiyi Sil",
      `${person} isimli kişiyi ve ona ait TÜM kayıtları silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => deletePerson(person),
        },
      ]
    )
  }

  const startEdit = (person) => {
    setEditTarget(person)
    setNewName(person)
  }

  const handleUpdateName = () => {
    if (!newName.trim()) return
    updatePersonName(editTarget, newName)
    setEditTarget(null)
  }

  return (
    <View style={pep.container}>
      <TextInput
        style={pep.search}
        placeholder="Kişi Ara..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={pep.row}>
            <Text style={pep.name}>{item}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={pep.editBtn}
                onPress={() => startEdit(item)}
              >
                <Text style={pep.editText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={pep.deleteBtn}
                onPress={() => confirmDelete(item)}
              >
                <Text style={pep.deleteText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={pep.empty}>Kayıtlı kişi bulunamadı.</Text>
        }
      />

      <Modal visible={!!editTarget} transparent animationType="fade">
        <View style={pep.modalOverlay}>
          <View style={pep.modalCard}>
            <Text style={pep.modalTitle}>İsim Düzenle</Text>
            <TextInput
              style={pep.modalInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={pep.modalActions}>
              <Button title="İptal" variant="surface" onPress={() => setEditTarget(null)} style={{ flex: 1 }} />
              <Button title="Kaydet" onPress={handleUpdateName} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const pep = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  search: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: spacing.lg,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontSize: 16, flex: 1, fontWeight: "500" },
  editBtn: {
    backgroundColor: colors.primary + "22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editText: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  deleteBtn: {
    backgroundColor: colors.danger + "22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteText: { color: colors.danger, fontWeight: "600", fontSize: 13 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: spacing.xl },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: spacing.md },
  modalInput: { backgroundColor: colors.surfaceAlt, color: colors.text, borderRadius: radius.md, padding: 14, fontSize: 16, marginBottom: spacing.lg },
  modalActions: { flexDirection: "row", gap: spacing.sm },
})

