import React from "react"
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import * as DocumentPicker from "expo-document-picker"
import { colors, radius, spacing } from "../theme"
import { useData } from "../data/DataContext"
import Button from "../components/Button"

// ============================================================================
// EKRAN: AYARLAR & YEDEKLEME
// ============================================================================
export default function SettingsScreen() {
  const { entries, importData, resetAll } = useData()

  const handleBackup = async () => {
    try {
      const json = JSON.stringify(entries, null, 2)
      
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            'borc-takip-yedek.json',
            'application/json'
          );
          await FileSystem.writeAsStringAsync(fileUri, json, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          Alert.alert("Başarılı", "Yedek dosyası seçtiğiniz klasöre kaydedildi.");
        }
      } else {
        // iOS için doğrudan kaydetme kısıtlı olduğundan paylaşım menüsünü "Dosyalara Kaydet" için açar
        const fileUri = FileSystem.documentDirectory + "borc-takip-yedek.json"
        await FileSystem.writeAsStringAsync(fileUri, json, {
          encoding: FileSystem.EncodingType.UTF8,
        })
        await Sharing.shareAsync(fileUri);
      }
    } catch (e) {
      Alert.alert("Hata", "Yedekleme başarısız: " + e.message)
    }
  }

  const handleShare = async () => {
    try {
      const json = JSON.stringify(entries, null, 2)
      const fileUri = FileSystem.documentDirectory + "borc-takip-yedek.json"
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Yedeği Paylaş",
        })
      } else {
        Alert.alert("Hata", "Paylaşım bu cihazda kullanılamıyor.")
      }
    } catch (e) {
      Alert.alert("Hata", "Paylaşım başarısız: " + e.message)
    }
  }

  const handleImport = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      })
      if (res.canceled) return
      const uri = res.assets[0].uri
      const content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      })
      const data = JSON.parse(content)
      Alert.alert(
        "Yedeği Yükle",
        "Mevcut veriler yedekteki verilerle değiştirilecek. Devam edilsin mi?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Yükle",
            onPress: () => {
              const ok = importData(data)
              if (ok) Alert.alert("Başarılı", "Veriler geri yüklendi.")
              else Alert.alert("Hata", "Geçersiz yedek dosyası.")
            },
          },
        ]
      )
    } catch (e) {
      Alert.alert("Hata", "İçe aktarma başarısız: " + e.message)
    }
  }

  const handleReset = () => {
    Alert.alert(
      "Verileri Sıfırla",
      "Tüm kayıtlar kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Tümünü Sil",
          style: "destructive",
          onPress: () => {
            resetAll()
            Alert.alert("Tamamlandı", "Tüm veriler silindi.")
          },
        },
      ]
    )
  }

  return (
    <ScrollView style={set.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={set.card}>
        <Text style={set.title}>Yedekleme</Text>
        <Text style={set.desc}>
          Verilerinizi JSON dosyası olarak dışa aktarın veya daha önce aldığınız bir yedeği
          geri yükleyin.
        </Text>
        <Button title="Yedekle (Dosya Oluştur)" onPress={handleBackup} style={set.mt} />
        <Button title="Paylaş (Yedeği Gönder)" variant="primary" onPress={handleShare} style={set.mt} />
        <Button
          title="Yükle (Geri Yükle)"
          variant="surface"
          onPress={handleImport}
          style={set.mt}
        />
      </View>

      <View style={[set.card, { marginTop: spacing.lg }]}>
        <Text style={set.title}>Tehlikeli Bölge</Text>
        <Text style={set.desc}>
          Tüm kişileri ve kayıtları kalıcı olarak siler. İşlem geri alınamaz.
        </Text>
        <Button
          title="Verileri Sıfırla"
          variant="danger"
          onPress={handleReset}
          style={set.mt}
        />
      </View>

      <Text style={set.footer}>Toplam kayıt: {entries.length}</Text>
    </ScrollView>
  )
}

const set = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  desc: { color: colors.textMuted, fontSize: 14, marginTop: spacing.sm, lineHeight: 20 },
  mt: { marginTop: spacing.md },
  footer: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 13,
  },
})
