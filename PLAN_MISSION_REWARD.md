# Rencana Implementasi Misi & Reward (Economy System) - Updated

Berdasarkan pengecekan kondisi smart contract dan frontend saat ini, terdapat beberapa *mismatch* (ketidaksesuaian) antara implementasi yang ada dengan kebutuhan *Economy System* yang berjalan secara nyata (bukan sekadar mock/dummy).

Berikut adalah rencana persetujuan langkah demi langkah untuk menyempurnakan implementasinya:

## 1. Perbaikan Bug Saat Ini (Immediate Fixes) -> [SUDAH FIX / DIABAIKAN]
*(Status: User mengkonfirmasi bug terkait Hydration, Remaining Pixel, dan Error `InsufficientFee` sudah diperbaiki. Fokus dilanjutkan ke Poin 2).*

## 2. Penyempurnaan `MissionBoard.sol` (Real Missions & Fix Duplicate)
Saat ini frontend sudah menampilkan 3 slot misi, namun terkadang menghasilkan misi yang *double* (sama dalam 1 hari) dan masih menggunakan verifikasi *dummy* saat pengguna melakukan claim.
**Tindak Lanjut**: 
- **Fix Duplicate Missions**: Memperbarui algoritma deterministik `getMissionsToday()` di `MissionBoard.sol` agar memastikan 3 misi yang digenerate setiap harinya diacak namun **pasti unik (tidak ada duplikat dalam 1 array)**.
- **Strict On-Chain Validation**: Menghapus mekanisme dummy. Menambahkan fungsi validasi konkrit di `MissionBoard.sol` yang membaca state asli dari `CeloPlace.sol` (misalnya: cek waktu real `timestamp` untuk *Early Bird*, cek real `chargesUsed` untuk *Full Charges*, atau integrasi khusus jika dibutuhkan untuk misi seperti *Neighbor/Contested* yang memerlukan logic spesifik atau proof of coordinates on-chain).
- Menyediakan kuota spesifik (spots left) per harinya secara on-chain.

## 3. Penyempurnaan `RewardPool.sol` & Sistem Distribusi Klaim (Real Claim)
Saat ini skrip `generateWeeklyDistribution.ts` hanya membuat Merkle Tree statis dengan alamat dummy.
**Tindak Lanjut**:
- Kita akan memperbarui `generateWeeklyDistribution.ts` agar **membaca data real on-chain**.
- Skrip ini akan melakukan *scanning* seluruh event atau membaca seluruh area map `pixels`, menghitung dominasi area aktif setiap address, menghitung *weekly pool balance* yang tersedia di `RewardPool.sol`, dan membuat proporsi *reward* CELO secara presisi.
- Hasil *Merkle Tree* ditulis menjadi `weeklyDistribution.json` untuk dibaca frontend agar user bisa meng-klaim besaran *real*-nya.

## 4. Sinkronisasi Frontend & ABI
- Re-compile Smart Contract setelah perubahan logic *Unique Missions* & validasinya.
- Meng-copy ulang ABI terbaru ke `lib/contracts.ts`.
- Memperbarui komponen `MissionBoard.tsx` (menghapus dummy proof, memanggil logic claim yang asli) dan `RewardClaimPanel.tsx` untuk menghandle *real variables*.

---
Rencana ter-update telah disesuaikan berdasarkan instruksi. Silakan review kembali. Jika sudah tepat, beri instruksi untuk mulai eksekusi/implementasi.