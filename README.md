# Borç ve Alacak Takip (React Native / Expo)

Mobil borç/alacak takip uygulaması. Tüm veriler cihazda `AsyncStorage` ile saklanır — sunucu veya internet gerekmez.

## Özellikler

- **Ana Ekran:** Toplam kalan alacak, toplam kalan borç ve ödenmiş toplam özeti (TL). Kişileri net bakiyeye göre listeler, kişi arama çubuğu ve her kişi için hızlı `+` borç ekleme butonu. Kayıt yoksa "Henüz kayıtlı borç yok" gösterilir.
- **Kayıt Ekleme:** Dinamik kişi seçimi (yazarken öneri, yoksa yeni kişi), sadece rakam kabul eden miktar alanı, zorunlu tür seçimi (Borç Aldım / Alacak Vereceğim), boş bırakılırsa bugünün tarihi, isteğe bağlı not.
- **Kişi Detayı:** Sadece o kişinin ödenmemiş kayıtları; borç (kırmızı) ve alacak (yeşil) şeritlerle ayrılır. Kısmi/tam ödeme modalı (boş bırakılırsa kalan tümü ödenir, kalan borçtan fazla girilemez).
- **Ödeme Geçmişi:** Tamamı ödenen kayıtlar arşive taşınır, "Geri Al" ile tekrar aktif edilebilir.
- **Düzenle & Sil:** Miktar/not düzenleme (yapılmış ödemeden az girilemez), onaylı silme (Alert). Tüm kayıtları silinen kişi listeden kalkar.
- **Yedekleme:** JSON dışa aktarma (Share), içe aktarma ve onaylı "Verileri Sıfırla".

## Çalıştırma

```bash
npm install        # veya: yarn
npx expo start
```

Telefonda **Expo Go** uygulamasıyla QR kodu okutarak test edebilirsiniz.

## Android APK Üretme

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Alternatif olarak yerel derleme için `npx expo prebuild` sonrası Android Studio kullanılabilir.
