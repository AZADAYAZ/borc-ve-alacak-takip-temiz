import React from "react"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer, DefaultTheme } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { colors } from "./src/theme"
import { DataProvider } from "./src/data/DataContext"
import DashboardScreen from "./src/screens/DashboardScreen"
import AddEntryScreen from "./src/screens/AddEntryScreen"
import PersonDetailScreen from "./src/screens/PersonDetailScreen"
import HistoryScreen from "./src/screens/HistoryScreen"
import PeopleScreen from "./src/screens/PeopleScreen"
import SettingsScreen from "./src/screens/SettingsScreen"

const Stack = createNativeStackNavigator()
const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary } }
const screenOptions = { headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, headerTitleStyle: { fontWeight: "700" }, contentStyle: { backgroundColor: colors.bg } }

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Borç Takip" }} />
            <Stack.Screen name="AddEntry" component={AddEntryScreen} options={({ route }) => ({ title: route.params?.editItem ? "Kaydı Düzenle" : "Yeni Kayıt" })} />
            <Stack.Screen name="PersonDetail" component={PersonDetailScreen} options={({ route }) => ({ title: route.params?.person || "Kişi Detayı" })} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: "Ödeme Geçmişi" }} />
            <Stack.Screen name="People" component={PeopleScreen} options={{ title: "Kişi Yönetimi" }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Ayarlar & Yedekleme" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </DataProvider>
    </SafeAreaProvider>
  )
}
