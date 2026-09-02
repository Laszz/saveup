SaveUp — Product Requirements Document

Dokumen ini ditujukan sebagai source of truth untuk coding agent.
Agent harus mengikuti requirement di dokumen ini dan tidak menambahkan fitur di luar scope tanpa instruksi pengguna.

1. Ringkasan Produk

SaveUp adalah aplikasi personal finance offline-first untuk Android yang menggabungkan:

Pencatatan pemasukan (income)

Pencatatan pengeluaran (expense)

Target tabungan (saving goals)

Pencatatan aktivitas menabung

Pengambilan uang dari tabungan

Riwayat transaksi

Statistik keuangan

Saving streak

Pengingat menabung

SaveUp bukan aplikasi bank. Aplikasi tidak memindahkan, menyimpan, atau mengakses uang sungguhan. Semua data merupakan catatan keuangan pengguna.

2. Tujuan Produk

SaveUp harus membantu pengguna:

Mengetahui jumlah uang yang dimiliki berdasarkan catatan transaksi.

Mengetahui pemasukan dan pengeluaran.

Membuat beberapa target tabungan.

Menambahkan dan mengambil uang dari target tabungan.

Melihat perkembangan setiap target.

Memahami pola pengeluaran melalui statistik.

Termotivasi untuk konsisten menabung melalui saving streak.

Menggunakan seluruh fitur utama tanpa koneksi internet.

3. Target Pengguna

Target pengguna adalah semua orang yang ingin:

Mencatat keuangan pribadi.

Mengontrol pengeluaran.

Menabung berdasarkan tujuan.

Memantau progres keuangan.

Contoh use case:

Mahasiswa menabung untuk laptop.

First jobber menabung untuk liburan.

Pengguna mencatat gaji dan pengeluaran bulanan.

Pengguna memiliki beberapa target tabungan sekaligus.

4. Scope MVP

4.1 Must Have

Fitur berikut wajib tersedia:

Onboarding

Dashboard

Pencatatan income

Pencatatan expense

Edit transaksi

Hapus transaksi

Riwayat transaksi

Kategori transaksi

Create saving goal

Edit saving goal

Delete saving goal

Add saving

Withdraw saving

Progress saving goal

Goal completion

Balance calculation

Local persistence

Offline functionality

4.2 Should Have

Jika tidak mengganggu fitur wajib:

Statistik

Target date

Saving streak

Saving reminder

Multiple saving goals

Goal icon

Filter transaksi

4.3 Nice to Have

Jangan diprioritaskan sebelum fitur MVP selesai:

Achievement

Animasi kompleks

Monthly chart yang kompleks

Dark mode

Export data

4.4 Out of Scope

Jangan implementasikan fitur berikut pada MVP:

Backend

Authentication

Cloud sync

Bank integration

E-wallet integration

Payment

Transfer uang sungguhan

Investasi

Pinjaman

Financial advice

Social/shared goals

5. Platform & Technical Requirements

5.1 Platform

Target utama:

Android

React Native

Aplikasi harus dapat dijalankan sebagai aplikasi mobile Android.

5.2 Offline-first

Aplikasi harus tetap berfungsi ketika tidak ada koneksi internet.

Fitur berikut harus dapat digunakan offline:

Melihat dashboard

Membuat income

Membuat expense

Membuat saving goal

Menambahkan saving

Withdrawal

Melihat history

Melihat statistik

Tidak boleh ada fitur core yang bergantung pada API internet.

5.3 Penyimpanan Data

Gunakan local database/storage.

Rekomendasi: SQLite karena aplikasi memiliki relasi antara goals, transactions, dan categories.

Tidak perlu membuat backend untuk MVP.

5.4 Bahasa

UI: Bahasa Indonesia

Kode: TypeScript direkomendasikan

Nama variable/function: gunakan bahasa Inggris

5.5 Mata Uang

Default currency:

IDR

Format nominal harus menggunakan format Rupiah yang konsisten.

Contoh:

Rp 1.500.000

Architecture currency harus memungkinkan penambahan currency lain di masa depan, tetapi MVP cukup menggunakan IDR.

6. Arsitektur Aplikasi

Gunakan pemisahan tanggung jawab yang jelas.

Struktur konseptual:

src/
├── components/
├── screens/
├── navigation/
├── database/
├── services/
├── store/
├── hooks/
├── utils/
├── types/
└── constants/

Agent boleh menyesuaikan struktur folder jika ada alasan teknis yang baik, tetapi:

UI tidak boleh menangani seluruh business logic.

Database access harus dipisahkan dari UI.

Formatting dan calculation logic harus reusable.

Type harus didefinisikan dengan jelas.

7. Navigasi

Struktur navigasi minimal:

Onboarding
↓
Main App
├── Home
├── Goals
├── Statistics
└── Settings

Screen tambahan:

Goal Detail
Add/Edit Goal
Add Transaction
Transaction Detail/Edit
Transaction History
Add Saving
Withdraw Saving

Desain visual tidak ditentukan oleh PRD ini. Agent harus fokus pada functionality dan struktur screen.

8. Data Model

8.1 Goal

Goal {
id: string
name: string
icon?: string
targetAmount: number
targetDate?: string
createdAt: string
completedAt?: string
}

Catatan:

currentAmount sebaiknya tidak menjadi sumber data utama jika dapat dihitung dari transaction history.

Saldo goal dapat dihitung:

currentAmount =
sum(saving transactions)

- sum(withdrawal transactions)

Jika agent memilih menyimpan currentAmount untuk optimasi, nilainya harus selalu konsisten dengan transaction history.

8.2 Transaction

Transaction {
id: string
type: 'income' | 'expense' | 'saving' | 'withdrawal'
amount: number
categoryId?: string
goalId?: string
note?: string
date: string
createdAt: string
}

Rules:

income → tidak membutuhkan goalId

expense → tidak membutuhkan goalId

saving → wajib memiliki goalId

withdrawal → wajib memiliki goalId

8.3 Category

Category {
id: string
name: string
type: 'income' | 'expense'
icon?: string
isDefault: boolean
}

8.4 Settings

Settings {
currency: string
reminderEnabled: boolean
reminderTime?: string
}

9. Kategori Default

Income

Gaji

Freelance

Hadiah

Investasi

Lainnya

Expense

Makanan

Transportasi

Belanja

Hiburan

Tagihan

Kesehatan

Pendidikan

Langganan

Lainnya

Kategori dapat diperluas pada versi berikutnya dengan custom category.

10. Functional Requirements

FR-001 — Onboarding

Saat pertama kali membuka aplikasi, user melihat onboarding.

Onboarding harus:

Menjelaskan fungsi SaveUp.

Memiliki CTA untuk mulai menggunakan aplikasi.

Tidak membutuhkan login.

Setelah onboarding selesai, status onboarding harus disimpan secara lokal sehingga tidak muncul lagi setiap kali aplikasi dibuka.

Acceptance Criteria

User dapat menyelesaikan onboarding.

User masuk ke Home setelah onboarding.

Setelah aplikasi ditutup dan dibuka kembali, onboarding tidak muncul lagi.

FR-002 — Dashboard

Home harus menampilkan ringkasan:

Balance

Total income

Total expense

Total savings

Saving goals aktif

Transaksi terbaru

Saving streak jika fitur streak sudah diimplementasikan

Dashboard harus mengambil data dari local database.

Acceptance Criteria

Dashboard menampilkan data aktual.

Data berubah setelah transaksi dibuat.

Data tetap tersedia setelah aplikasi direstart.

Dashboard dapat dibuka tanpa internet.

FR-003 — Create Income

User dapat membuat transaksi income.

Input:

Amount — wajib

Category — wajib

Note — opsional

Date — default tanggal saat ini

Validation:

Amount harus lebih besar dari 0.

Category harus valid.

Acceptance Criteria

User dapat menyimpan income.

Income muncul di transaction history.

Balance bertambah.

Statistik income diperbarui.

Data tersimpan secara lokal.

FR-004 — Create Expense

User dapat membuat transaksi expense.

Input:

Amount — wajib

Category — wajib

Note — opsional

Date — default tanggal saat ini

Validation:

Amount harus lebih besar dari 0.

Category harus valid.

Acceptance Criteria

User dapat menyimpan expense.

Expense muncul di transaction history.

Balance berkurang.

Statistik expense diperbarui.

Data tersimpan secara lokal.

FR-005 — Edit Transaction

User dapat mengedit income atau expense.

Field yang dapat diubah:

Amount

Category

Note

Date

Acceptance Criteria

User dapat membuka transaksi.

User dapat mengubah data.

Perhitungan balance diperbarui.

Statistik diperbarui.

History menggunakan data terbaru.

FR-006 — Delete Transaction

User dapat menghapus transaksi.

Sebelum menghapus, tampilkan confirmation.

Contoh:

Hapus transaksi ini?

Setelah dihapus:

Data transaksi hilang.

Balance diperbarui.

Statistik diperbarui.

11. Saving Goal Requirements

FR-007 — Create Goal

User dapat membuat goal tanpa batas jumlah yang ditentukan aplikasi.

Input:

Name — wajib

Icon — opsional

Target amount — wajib

Target date — opsional

Default:

Status: active

Current amount: 0

Validation:

Name tidak boleh kosong.

Target amount harus > 0.

Target date, jika ada, harus berupa tanggal valid.

Acceptance Criteria

User dapat membuat goal.

Goal muncul di daftar goal.

Goal memiliki progress 0% jika belum ada saving.

Goal tetap tersedia setelah aplikasi direstart.

FR-008 — Edit Goal

User dapat mengubah:

Name

Icon

Target amount

Target date

Perubahan target tidak boleh merusak transaction history.

Jika target amount diubah lebih kecil dari current amount, goal dapat langsung dianggap completed sesuai business rule goal completion.

FR-009 — Delete Goal

User dapat menghapus goal setelah confirmation.

Agent harus menjaga integritas data transaksi.

Pilihan implementasi yang direkomendasikan:

Hapus goal beserta transaksi saving/withdrawal terkait.

Jika menggunakan pendekatan lain, pastikan tidak ada orphan transaction yang mengacu ke goal yang sudah tidak ada.

FR-010 — Add Saving

User dapat menambahkan saving ke goal.

Input:

Goal — wajib

Amount — wajib

Note — opsional

Date — default tanggal saat ini

Validation:

Amount > 0

Goal harus aktif/valid

Setelah saving:

currentAmount += savingAmount

Saving dicatat sebagai transaction dengan:

type = 'saving'
goalId = target goal

Acceptance Criteria

Saving berhasil ditambahkan.

Progress goal bertambah.

Saving muncul di history.

Balance berkurang sesuai nominal saving.

Saving streak diperbarui.

Data tetap ada setelah restart.

FR-011 — Withdraw Saving

User dapat mengambil sebagian uang dari goal.

Input:

Goal — wajib

Amount — wajib

Note — opsional

Date — default tanggal saat ini

Validation:

withdrawalAmount <= currentAmount

Jika tidak memenuhi:

Withdrawal tidak dapat melebihi jumlah tabungan saat ini.

Withdrawal dicatat sebagai:

type = 'withdrawal'

Acceptance Criteria

User dapat melakukan withdrawal.

Current amount goal berkurang.

Withdrawal muncul di history.

Balance bertambah kembali.

Withdrawal tidak dapat melebihi current amount.

FR-012 — Goal Progress

Progress dihitung:

progress =
currentAmount / targetAmount \* 100

Progress harus dibatasi maksimal 100% pada UI.

Contoh:

currentAmount = 5.000.000
targetAmount = 10.000.000

progress = 50%

Jika:

currentAmount >= targetAmount

goal dianggap completed.

FR-013 — Goal Completion

Ketika goal mencapai target:

currentAmount >= targetAmount

status berubah menjadi:

completed

Simpan:

completedAt

Goal yang sudah selesai tetap dapat dilihat oleh user.

Jangan menghapus transaction history.

UI celebration/animation boleh ditambahkan, tetapi tidak boleh mengganggu business logic.

12. Target Date

Target date bersifat opsional.

Jika user tidak mengisi target date:

Goal tetap valid.

Tidak ada error.

Tidak ada perhitungan kebutuhan saving berdasarkan waktu.

Jika target date tersedia, aplikasi dapat menghitung estimasi saving yang dibutuhkan.

Contoh:

Target:
Rp12.000.000

Current:
Rp3.000.000

Sisa:
Rp9.000.000

Deadline:
6 bulan

Estimasi:
Rp1.500.000/bulan

Perhitungan ini bersifat informatif dan bukan kewajiban user.

13. Transaction History

History harus menampilkan:

Income

Expense

Saving

Withdrawal

Minimal informasi:

Nominal

Type

Category/Goal

Note jika ada

Date

Urutan default:

terbaru → terlama

Filter minimal:

All

Income

Expense

Saving

Withdrawal

Jika memungkinkan, tambahkan filter tanggal.

14. Balance

Gunakan rumus:

Balance =
Total Income

- Total Expense
- Total Saving

* Total Withdrawal

Contoh:

Income Rp10.000.000
Expense Rp4.000.000
Saving Rp2.000.000
Withdrawal Rp500.000

Balance Rp4.500.000

Balance harus dihitung berdasarkan transaction data, bukan nilai yang diinput manual oleh user.

15. Statistics

Statistics minimal mencakup:

Income

Total income

Income periode tertentu

Expense

Total expense

Expense periode tertentu

Savings

Total saving

Saving periode tertentu

Expense Breakdown

Tampilkan pengeluaran berdasarkan kategori.

Contoh:

Makanan 35%
Belanja 20%
Transportasi 15%
Hiburan 10%
Lainnya 20%

Monthly Overview

User dapat melihat perbandingan:

Income

Expense

Saving

per bulan.

16. Saving Streak

Saving streak digunakan untuk memotivasi kebiasaan menabung.

Aturan:

Satu hari dengan minimal satu saving = satu hari aktif.

Multiple saving pada hari yang sama tetap dihitung sebagai satu hari.

Nominal tidak menentukan streak.

Saving Rp10.000 tetap dihitung.

Withdrawal tidak menambah streak.

Income/expense tidak menambah streak.

Contoh:

25 Aug → Save
26 Aug → Save
27 Aug → Save
28 Aug → Save

Streak:

4 hari

Jika tidak ada saving pada hari berikutnya, streak terputus sesuai aturan streak yang diimplementasikan.

Gunakan tanggal lokal pengguna untuk menentukan hari.

17. Saving Reminder

User dapat mengaktifkan reminder.

Settings:

Reminder:
ON / OFF

Time:
20:00

Contoh notifikasi:

💰 Saatnya menabung!
Jangan lupa menambahkan tabungan hari ini.

Reminder harus bersifat lokal/device notification dan tidak membutuhkan backend.

Jika implementasi notification membutuhkan permission:

Minta permission secara jelas.

Jangan memblokir penggunaan aplikasi jika permission ditolak.

18. Settings

Minimal:

Currency

Saving reminder ON/OFF

Reminder time

About SaveUp

MVP tidak membutuhkan:

Account

Login

Cloud sync

19. UX Requirements

PRD ini tidak menentukan desain UI secara detail.

Agent harus memastikan:

Loading state tersedia jika dibutuhkan.

Empty state tersedia.

Error state tersedia.

Form memiliki validation.

Destructive action memiliki confirmation.

Nominal menggunakan format currency.

Tombol/action utama mudah ditemukan.

Tidak ada data yang hilang secara diam-diam.

Empty State

Contoh:

Belum ada transaksi.

Mulai catat pemasukan atau pengeluaranmu.

Goal kosong:

Belum ada target tabungan.

Buat goal pertamamu.

20. Validation & Edge Cases

Agent wajib menangani kasus berikut.

Amount

Tidak valid:

0
-10000
empty
non-numeric

Valid:

10000
500000
1500000

Withdrawal

Tidak boleh:

currentAmount = 500000
withdrawal = 600000

Goal

Tidak boleh:

Name kosong

Target <= 0

Target Date

Jika digunakan:

Harus tanggal valid.

Tidak boleh menyebabkan crash ketika kosong.

Delete Goal

Tidak boleh meninggalkan transaction yang memiliki goalId invalid.

App Restart

Setelah aplikasi ditutup dan dibuka kembali:

Goals tetap ada.

Transactions tetap ada.

Settings tetap ada.

Balance tetap konsisten.

Streak tetap konsisten.

Offline

Tidak boleh menampilkan error internet untuk fitur yang sepenuhnya lokal.

21. Data Integrity

Ini adalah requirement penting.

Agent harus memastikan:

Transaction history
↓
Calculation
↓
Dashboard
↓
Statistics

menghasilkan data yang konsisten.

Jangan menyimpan nilai hasil perhitungan di banyak tempat tanpa alasan.

Jika terjadi perubahan transaction:

Balance harus berubah.

Statistik harus berubah.

Goal progress harus berubah jika transaksi terkait goal.

Saving streak harus dihitung ulang jika transaksi saving diubah/dihapus.

22. Testing Requirements

Minimal buat test untuk business logic penting.

Test cases:

Balance

Income meningkatkan balance.

Expense menurunkan balance.

Saving menurunkan balance.

Withdrawal meningkatkan balance.

Goal

Goal baru memiliki progress 0%.

Add saving meningkatkan progress.

Withdrawal mengurangi progress.

Withdrawal lebih besar dari current amount ditolak.

Goal mencapai 100% ketika target tercapai.

Goal dapat menjadi completed.

Transaction

Amount 0 ditolak.

Amount negatif ditolak.

Transaction tersimpan.

Transaction dapat diedit.

Transaction dapat dihapus.

Streak

Saving pada hari berbeda meningkatkan streak.

Multiple saving pada hari yang sama hanya dihitung satu hari.

Income/expense tidak memengaruhi streak.

23. Acceptance Criteria MVP

MVP dianggap selesai apabila seluruh poin berikut terpenuhi:

Core Finance

User dapat mencatat income.

User dapat mencatat expense.

User dapat mengedit transaksi.

User dapat menghapus transaksi.

User dapat melihat history.

Balance dihitung dengan benar.

Kategori transaksi tersedia.

Saving

User dapat membuat banyak saving goals.

User dapat mengedit goal.

User dapat menghapus goal.

User dapat menambahkan saving.

User dapat melakukan withdrawal.

Withdrawal tidak boleh melebihi saldo goal.

Progress goal diperbarui.

Goal dapat menjadi completed.

Goal completed tetap dapat dilihat.

Statistics

Total income tersedia.

Total expense tersedia.

Total savings tersedia.

Expense breakdown tersedia.

Monthly overview tersedia.

Motivation

Saving streak tersedia.

Saving reminder tersedia jika fitur reminder diaktifkan.

Offline

Aplikasi dapat digunakan tanpa internet.

Data tersimpan setelah app restart.

Tidak membutuhkan backend.

24. Development Priority

Agent harus mengerjakan fitur berdasarkan urutan berikut:

Phase 1 — Project Foundation

Setup React Native.

Setup TypeScript.

Setup navigation.

Setup local database.

Buat types/models.

Buat utility currency dan date.

Phase 2 — Transactions

Transaction model.

Category model.

Create income.

Create expense.

Transaction list.

Edit transaction.

Delete transaction.

Balance calculation.

Phase 3 — Saving Goals

Goal model.

Create goal.

Goal list.

Goal detail.

Add saving.

Withdrawal.

Goal progress.

Goal completion.

Phase 4 — Dashboard

Balance.

Income summary.

Expense summary.

Savings summary.

Active goals.

Recent transactions.

Phase 5 — Statistics

Monthly income.

Monthly expense.

Monthly saving.

Expense breakdown.

Charts jika diperlukan.

Phase 6 — Motivation

Saving streak.

Local notification/reminder.

Goal completion feedback.

25. Aturan untuk Coding Agent

Agent harus mengikuti aturan berikut:

Jangan membuat backend untuk MVP.

Jangan membuat authentication.

Jangan membutuhkan internet untuk fitur core.

Jangan menambahkan bank/e-wallet integration.

Jangan menambahkan fitur besar yang tidak ada di PRD.

Prioritaskan correctness business logic daripada visual polish.

Gunakan reusable components.

Pisahkan UI, state, database, dan business logic.

Hindari duplikasi logic.

Gunakan TypeScript dengan type yang jelas.

Tangani loading, empty, error, dan validation state.

Jangan hardcode hasil perhitungan balance/progress.

Jangan menyimpan uang sungguhan atau data pembayaran.

Jangan menghapus data secara diam-diam.

Jika requirement ambigu, pilih solusi paling sederhana yang konsisten dengan PRD dan dokumentasikan keputusan tersebut.

Jangan mengubah requirement inti tanpa persetujuan pengguna.

26. Definition of Done

Flow berikut harus berhasil sepenuhnya:

Buka SaveUp
↓
Selesaikan onboarding
↓
Masuk Home
↓
Catat Income Rp5.000.000
↓
Catat Expense Rp50.000
↓
Buat Goal "Laptop"
↓
Target Rp10.000.000
↓
Tambah Saving Rp500.000
↓
Progress goal berubah
↓
Saving masuk history
↓
Saving streak bertambah
↓
Withdraw Rp100.000
↓
Progress berkurang
↓
Withdrawal masuk history
↓
Buka Statistics
↓
Income & Expense terlihat
↓
Tutup aplikasi
↓
Buka kembali
↓
Semua data tetap tersedia

Semua flow di atas harus dapat dilakukan tanpa koneksi internet.

27. Definisi Produk

SaveUp adalah aplikasi personal finance offline-first yang menggabungkan pencatatan pemasukan dan pengeluaran dengan target tabungan, sehingga pengguna dapat memahami kondisi keuangannya sekaligus tetap termotivasi mencapai tujuan finansialnya.
