import React, { useEffect, useMemo, useState } from "react"
import { Alert, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { colors, radius, spacing } from "../theme"
import { activeEntries, formatTL } from "../data/utils"
import { useData } from "../data/DataContext"
import Button from "../components/Button"

// ============================================================================
// EKRAN: KİŞİ DETAYI
// ============================================================================
export default function PersonDetailScreen({ navigation, route }) {
  const { person } = route.params
  const { entries, payEntry, deleteEntry } = useData()

  const [payTarget, setPayTarget] = useState(null)
  const [payValue, setPayValue] = useState("")

  const personEntries = useMemo(
    () => activeEntries(entries).filter((e) => e.person === person),
    [entries, person]
  )

  // Bu kişinin aktif olan ilk kaydının türünü (alacak/borc) alıyoruz ki + butonuna basınca o tür seçili gelsin
  const personType = useMemo(() => {
    const firstEntry = personEntries[0];
    return firstEntry ? firstEntry.type : "borc";
  }, [personEntries]);

  useEffect(() => {
    if (personEntries.length === 0) navigation.goBack()
  }, [personEntries.length, navigation])

  const openPay = (entry) => {
    setPayTarget(entry)
    setPayValue("")
  }

  const confirmPay = () => {
    if (!payTarget) return
    const remaining = payTarget.amount - payTarget.paid
    if (payValue.trim() === "") {
      payEntry(payTarget.id, null)
    } else {
      const val = parseAmount(payValue)
      if (isNaN(val) || val <= 0) {
        Alert.alert("Uyarı", "Geçerli bir ödeme miktarı girin.")
        return
      }
      if (val > remaining + 0.0001) {
        Alert.alert("Uyarı", `Ödeme, kalan borçtan (${formatTL(remaining)}) fazla olamaz.`)
        return
      }
      payEntry(payTarget.id, val)
    }
    setPayTarget(null)
    setPayValue("")
  }

  const confirmDelete = (entry) => {
    Alert.alert("Kaydı Sil", "Bu kaydı silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => deleteEntry(entry.id) },
    ])
  }

  const renderItem = ({ item }) => {
    const remaining = item.amount - item.paid
    const isBorc = item.type === "borc"
    const stripe = isBorc ? colors.danger : colors.success
    return (
      <View style={det.entryCard}>
        <View style={[det.stripe, { backgroundColor: stripe }]} />
        <View style={det.entryContent}>
          <View style={det.entryHeader}>
            <Text style={[det.entryType, { color: stripe }]}>
              {isBorc ? "Borç" : "Alacak"}
            </Text>
            <Text style={det.entryDate}>{item.date}</Text>
          </View>

          <Text style={det.entryAmount}>{formatTL(remaining)}</Text>
          {item.paid > 0 && (
            <Text style={det.entryPaid}>
              Toplam {formatTL(item.amount)} · Ödenen {formatTL(item.paid)}
            </Text>
          )}
          {item.note ? <Text style={det.entryNote}>{item.note}</Text> : null}

          <View style={det.entryActions}>
            <TouchableOpacity
              style={[det.smallBtn, { backgroundColor: colors.primary }]}
              onPress={() => openPay(item)}
            >
              <Text style={det.smallBtnText}>Öde</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[det.smallBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => navigation.navigate("AddEntry", { editItem: item })}
            >
              <Text style={det.smallBtnText}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[det.smallBtn, { backgroundColor: colors.danger }]}
              onPress={() => confirmDelete(item)}
            >
              <Text style={det.smallBtnText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={det.container}>
      <FlatList
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
        data={personEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={det.empty}>Bu kişiye ait aktif kayıt yok.</Text>}
      />

      <Modal
        visible={!!payTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setPayTarget(null)}
      >
        <View style={det.modalOverlay}>
          <View style={det.modalCard}>
            <Text style={det.modalTitle}>Ödeme Yap</Text>
            {payTarget && (
              <Text style={det.modalSub}>
                Kalan: {formatTL(payTarget.amount - payTarget.paid)}
              </Text>
            )}
            <Text style={det.modalHint}>
              Boş bırakırsanız kalan tüm tutar ödenmiş sayılır.
            </Text>
            <TextInput
              style={det.modalInput}
              placeholder="Miktar (TL)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={payValue}
              onChangeText={(t) => setPayValue(sanitizeAmountInput(t))}
            />
            <View style={det.modalActions}>
              <Button
                title="İptal"
                variant="surface"
                onPress={() => setPayTarget(null)}
                style={{ flex: 1 }}
              />
              <Button
                title="Onayla"
                variant="success"
                onPress={confirmPay}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
      {/* FAB altındaki tam genişlik alt bar (kaydırmada listeyle çakışmayı önler) */}
      <View style={det.fabBottomBar} />
      <TouchableOpacity 
        style={det.fab} 
        onPress={() => navigation.navigate('AddEntry', { person: person, type: personType })}
      >
        <Text style={det.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const det = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  entryCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  stripe: { width: 6 },
  entryContent: { flex: 1, padding: spacing.lg },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  fab: {position: 'absolute',
  bottom: spacing.xl,
  right: spacing.xl,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 4,
},
  fabBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.sm,
    height: 72,
    backgroundColor: colors.bg,
    opacity: 0.55,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fabText: {
    color: colors.onPrimary,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'android' ? -4 : 0, // Ortalamak için küçük bir ayar
  },
  entryType: { fontSize: 14, fontWeight: "700" },
  entryDate: { color: colors.textMuted, fontSize: 13 },
  entryAmount: { color: colors.text, fontSize: 22, fontWeight: "700" },
  entryPaid: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  entryNote: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  entryActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  smallBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  smallBtnText: { color: colors.onPrimary, fontWeight: "600", fontSize: 14 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40, fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  modalSub: { color: colors.text, fontSize: 16, marginTop: spacing.sm },
  modalHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
  },
  modalActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
})
