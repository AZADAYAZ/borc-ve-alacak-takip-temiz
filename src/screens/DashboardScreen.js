import React, { useMemo, useRef, useState } from "react"
import { Dimensions, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native"
import { colors, radius, spacing } from "../theme"
import { useData } from "../data/DataContext"
import { buildPersonList, buildSummary, formatTL } from "../data/utils"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export default function DashboardScreen({ navigation }) {
  const { entries } = useData()
  const [activeTab, setActiveTab] = useState("alacak") // 'alacak' veya 'borc'
  const [query, setQuery] = useState("")
  const pagerRef = useRef(null)

  const summary = useMemo(() => buildSummary(entries), [entries])

  const alacakPeople = useMemo(() => {
    const list = buildPersonList(entries, "alacak")
    const filtered = query.trim()
      ? list.filter((p) => p.person.toLowerCase().includes(query.trim().toLowerCase()))
      : list
    return filtered.sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
  }, [entries, query])

  const borcPeople = useMemo(() => {
    const list = buildPersonList(entries, "borc")
    const filtered = query.trim()
      ? list.filter((p) => p.person.toLowerCase().includes(query.trim().toLowerCase()))
      : list
    return filtered.sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
  }, [entries, query])

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x
    const index = Math.round(x / SCREEN_WIDTH)
    const nextTab = index === 0 ? "alacak" : "borc"
    if (nextTab !== activeTab) {
      setActiveTab(nextTab)
    }
  }

  const handleTabPress = (tab) => {
    const x = tab === "alacak" ? 0 : SCREEN_WIDTH
    pagerRef.current?.scrollTo({ x, animated: true })
    setActiveTab(tab)
  }

  const renderPerson = ({ item, type }) => {
    const positive = item.net >= 0
    return (
      <View style={dash.personRow}>
        <TouchableOpacity
          style={dash.personInfo}
          onPress={() => navigation.navigate("PersonDetail", { person: item.person })}
        >
          <Text style={dash.personName}>{item.person}</Text>
          <Text
            style={[
              dash.personBalance,
              { color: positive ? colors.success : colors.danger },
            ]}
          >
            {positive ? "Alacak: " : "Borç: "}
            {formatTL(Math.abs(item.net))}
          </Text>
          {item.lastNote ? (
            <Text style={dash.personNote} numberOfLines={1}>
              {item.lastNote}
            </Text>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[dash.addBtn, { backgroundColor: type === "alacak" ? colors.success : colors.danger }]}
          onPress={() => navigation.navigate("AddEntry", { person: item.person, type: type })}
        >
          <Text style={dash.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={dash.container}>
      {/* SABİT ÜST BÖLÜM */}
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <View style={dash.summaryCard}>
          <View style={dash.summaryRow}>
            <View style={dash.summaryItem}>
              <Text style={dash.summaryLabel}>Toplam Alacak</Text>
              <Text style={[dash.summaryValue, { color: colors.success }]}>
                {formatTL(summary.alacak)}
              </Text>
            </View>
            <View style={dash.summaryItem}>
              <Text style={dash.summaryLabel}>Toplam Borç</Text>
              <Text style={[dash.summaryValue, { color: colors.danger }]}>
                {formatTL(summary.borc)}
              </Text>
            </View>
            <View style={dash.summaryItem}>
              <Text style={dash.summaryLabel}>Güncel Durum</Text>
              <Text style={[dash.summaryValue, { color: (summary.alacak - summary.borc >= 0) ? colors.success : colors.danger }]}>
                {formatTL(summary.alacak - summary.borc)}
              </Text>
            </View>
          </View>
        </View>

        <View style={dash.tabs}>
          <TouchableOpacity
            style={[dash.tab, activeTab === "alacak" && dash.tabActive]}
            onPress={() => handleTabPress("alacak")}
          >
            <Text style={[dash.tabText, activeTab === "alacak" && dash.tabTextActive]}>
              Alacaklar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dash.tab, activeTab === "borc" && dash.tabActive]}
            onPress={() => handleTabPress("borc")}
          >
            <Text style={[dash.tabText, activeTab === "borc" && dash.tabTextActive]}>
              Borçlar
            </Text>
          </TouchableOpacity>
        </View>

        <View style={dash.actionsRow}>
          <TouchableOpacity
            style={[dash.actionBtn, { backgroundColor: colors.surfaceAlt }]}
            onPress={() => navigation.navigate("History")}
          >
            <Text style={dash.actionBtnText}>Geçmiş</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dash.actionBtn, { backgroundColor: colors.surfaceAlt }]}
            onPress={() => navigation.navigate("People")}
          >
            <Text style={dash.actionBtnText}>Kişiler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dash.actionBtnSmall, { backgroundColor: colors.surfaceAlt }]}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={dash.actionBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={dash.search}
          placeholder="Kişi Ara..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* YATAY KAYDIRILABİLİR İÇERİK */}
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {/* Alacaklar Listesi */}
        <View style={{ width: SCREEN_WIDTH }}>
          <FlatList
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
            data={alacakPeople}
            keyExtractor={(item) => "alacak-" + item.person}
            renderItem={({ item }) => renderPerson({ item, type: "alacak" })}
            ListEmptyComponent={
              <View style={dash.empty}>
                <Text style={dash.emptyText}>Henüz aktif alacak kaydı yok</Text>
              </View>
            }
          />
        </View>

        {/* Borçlar Listesi */}
        <View style={{ width: SCREEN_WIDTH }}>
          <FlatList
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
            data={borcPeople}
            keyExtractor={(item) => "borc-" + item.person}
            renderItem={({ item }) => renderPerson({ item, type: "borc" })}
            ListEmptyComponent={
              <View style={dash.empty}>
                <Text style={dash.emptyText}>Henüz aktif borç kaydı yok</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* + Butonu */}
      <TouchableOpacity
        style={[dash.fab, { 
          backgroundColor: activeTab === "alacak" ? colors.success : colors.danger,
        }]}
        onPress={() => navigation.navigate("AddEntry", { type: activeTab })}
      >
        <Text style={dash.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const dash = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: { flexDirection: "row" },
  summaryItem: { flex: 1 },
  summaryLabel: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: "700" },
  tabs: {
    flexDirection: "row",
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.surfaceAlt },
  tabText: { color: colors.textMuted, fontWeight: "600" },
  tabTextActive: { color: colors.text },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
  },
  actionBtnSmall: {
    width: 48,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
  },
  actionBtnText: { color: colors.onPrimary, fontWeight: "600", fontSize: 14 },
  search: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 16,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  personInfo: { flex: 1 },
  personName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  personBalance: { fontSize: 15, fontWeight: "500" },
  personNote: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    fontStyle: "italic",
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: colors.onPrimary,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: { color: colors.onPrimary, fontSize: 32, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: colors.textMuted, fontSize: 16 },
})

