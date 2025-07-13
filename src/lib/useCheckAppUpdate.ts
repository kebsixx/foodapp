import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import VersionCheck from 'react-native-version-check';

/**
 * Custom hook untuk memeriksa update aplikasi di Play Store/App Store.
 * Hook ini tidak mengembalikan apa-apa, hanya menjalankan efek samping (menampilkan alert).
 */
export const useCheckAppUpdate = () => {

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // 'needUpdate' akan mengembalikan objek jika update diperlukan,
        // atau undefined jika tidak.
        const updateNeeded = await VersionCheck.needUpdate();

        if (updateNeeded && updateNeeded.isNeeded) {
          // Jika update dibutuhkan, tampilkan alert
          Alert.alert(
            'Versi Baru Tersedia',
            'Versi baru dari Cerita Senja telah tersedia. Perbarui sekarang untuk mendapatkan fitur terbaru dan perbaikan.',
            [
              {
                text: 'Nanti Saja',
                style: 'cancel',
              },
              {
                text: 'Update Sekarang',
                onPress: () => {
                  // Buka link ke App Store atau Play Store
                  Linking.openURL(updateNeeded.storeUrl);
                },
              },
            ]
          );
        }
      } catch (error) {
        // Sebaiknya tidak menampilkan error ke pengguna, cukup log di console
        console.error("Gagal memeriksa update aplikasi:", error);
      }
    };

    // Panggil fungsi pengecekan
    checkVersion();

  }, []); // Dependensi kosong '[]' memastikan ini hanya berjalan sekali saat aplikasi dimuat

};