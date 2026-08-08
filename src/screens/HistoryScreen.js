import React, { useMemo } from "react"
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors, radius, spacing } from "../theme"
import { formatTL, paidEntries } from "../data/utils"
import { useData } from "../data/DataContext"

// ============================================================================
// EKRAN: ÖDEME GEÇMİŞİ
// ============================================================================
export default function HistoryScreen() {
  const { entries, undoEntry, deleteEntry } = useData()
  const history = useMemo(() => paidEntries(entries), [entries])

  const confirmDelete = (entry) => {
    Alert.alert("Kaydı Sil", "Bu kaydı silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => deleteEntry(entry.id) },
    ])
  }

  const renderItem = ({ item }) => {
    const isBorc = item.type === "borc"
    const stripe = isBorc ? colors.danger : colors.success
    return (
      <View style={hist.card}>
        <View style={[hist.stripe, { backgroundColor: stripe }]} />
        <View style={hist.content}>
          <View style={hist.header}>
            <Text style={hist.person}>{item.person}</Text>
            <Text style={hist.date}>{item.date}</Text>
          </View>
          <Text style={[hist.type, { color: stripe }]}>
            {isBorc ? "Borç" : "Alacak"} · {formatTL(item.amount)}
          </Text>
          {item.note ? <Text style={hist.note}>{item.note}</Text> : null}
          <View style={hist.actions}>
            <TouchableOpacity
              style={[hist.btn, { backgroundColor: colors.primary }]}
              onPress={() => undoEntry(item.id)}
            >
              <Text style={hist.btnText}>Geri Al</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[hist.btn, { backgroundColor: colors.danger }]}
              onPress={() => confirmDelete(item)}
            >
              <Text style={hist.btnText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={hist.container}>
      <FlatList
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={hist.empty}>Henüz ödenmiş kayıt yok.</Text>}
      />
    </View>
  )
}

const hist = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  stripe: { width: 6 },
  content: { flex: 1, padding: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  person: { color: colors.text, fontSize: 17, fontWeight: "600" },
  date: { color: colors.textMuted, fontSize: 13 },
  type: { fontSize: 15, fontWeight: "600", marginTop: 2 },
  note: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  btn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: "center" },
  btnText: { color: colors.onPrimary, fontWeight: "600", fontSize: 14 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40, fontSize: 15 },
})
