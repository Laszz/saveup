SaveUp — Design System & UI Specification

Dokumen ini mendefinisikan desain dan struktur UI SaveUp.
Dokumen ini digunakan sebagai acuan untuk implementasi antarmuka oleh coding agent.

Catatan: Desain harus terasa modern, sederhana, ringan, dan mudah digunakan. Jangan membuat UI yang terlalu ramai atau terlihat seperti aplikasi perbankan korporat.

1. Design Direction

1.1 Karakter Visual

SaveUp memiliki karakter:

Modern

Minimalis

Friendly

Clean

Personal

Motivating

Mudah dipahami dalam sekali lihat

Aplikasi harus terasa seperti personal finance companion, bukan aplikasi accounting yang rumit.

1.2 Prinsip UI

Simpel

Informasi penting harus terlihat tanpa user harus membuka banyak halaman.

Hierarki yang jelas

Angka keuangan utama harus menjadi elemen visual yang paling menonjol.

Action-oriented

User harus mudah menemukan aksi utama seperti:

Tambah transaksi

Menabung

Membuat goal

Tidak intimidating

Jangan membuat dashboard penuh angka, tabel, atau chart sekaligus.

Konsisten

Komponen yang sama harus memiliki behavior dan visual yang konsisten di seluruh aplikasi.

2. Navigation Structure

Gunakan bottom navigation dengan empat menu utama:

┌──────────────────────────────────────────────┐
│ │
│ Screen │
│ │
│ │
├──────────────────────────────────────────────┤
│ Home Goals Transactions Statistics │
└──────────────────────────────────────────────┘

Menu:

Dashboard

Saving Goals

Riwayat Transaksi

Statistik

Settings dapat diakses dari Dashboard melalui icon/settings action dan tidak perlu menjadi tab utama.

3. Dashboard

3.1 Tujuan

Dashboard adalah halaman utama yang memberikan gambaran kondisi keuangan user dalam waktu singkat.

User harus dapat mengetahui:

Berapa saldo yang tersedia.

Berapa pemasukan.

Berapa pengeluaran.

Berapa uang yang sedang ditabung.

Progress goal.

Transaksi terbaru.

Saving streak.

3.2 Struktur Layout

Urutan informasi:

Dashboard
│
├── Header
│ ├── Greeting
│ └── Settings
│
├── Balance Card
│
├── Quick Actions
│ ├── Income
│ ├── Expense
│ └── Saving
│
├── Saving Streak
│
├── Saving Goals Preview
│
└── Recent Transactions

3.3 Header

Contoh:

Selamat pagi 👋
Yuk kelola keuanganmu hari ini.

                              ⚙

Greeting dapat menyesuaikan waktu:

Selamat pagi

Selamat siang

Selamat sore

Selamat malam

Jangan terlalu panjang.

3.4 Balance Card

Balance menjadi informasi paling menonjol di dashboard.

Contoh:

Saldo saat ini

Rp 4.250.000

Di bawahnya dapat ditampilkan ringkasan:

↑ Rp 8.000.000 income
↓ Rp 2.750.000 expense

Balance harus mengikuti perhitungan dari PRD.

Rumus:

Balance =
Income

- Expense
- Saving

* Withdrawal

  3.5 Quick Actions

Sediakan action yang mudah ditemukan.

┌────────────┐ ┌────────────┐ ┌────────────┐
│ + │ │ − │ │ 💰 │
│ Income │ │ Expense │ │ Saving │
└────────────┘ └────────────┘ └────────────┘

Action:

Tambah Income

Tambah Expense

Tambah Saving

Behavior

Income

→ buka form Add Income.

Expense

→ buka form Add Expense.

Saving

→ buka pemilihan goal atau langsung membuka Add Saving jika goal tersedia.

3.6 Saving Streak

Jika streak tersedia:

🔥 12 Hari Berturut-turut

Konsisten menabung setiap hari!

Jika belum pernah menabung:

🔥 Mulai Saving Streak

Menabung hari ini untuk memulai streak-mu.

Card ini harus terasa motivational, tetapi tidak berlebihan.

3.7 Saving Goals Preview

Dashboard hanya menampilkan beberapa goal aktif, bukan seluruh goal.

Contoh:

Target Tabungan Lihat semua

💻 MacBook
Rp 5.000.000 / Rp 15.000.000

████████░░░░░░░░ 33%

✈️ Japan Trip
Rp 2.000.000 / Rp 10.000.000

████░░░░░░░░░░░░ 20%

Jika goal lebih banyak, tampilkan CTA:

Lihat semua

yang mengarah ke Saving Goals.

3.8 Recent Transactions

Tampilkan transaksi terbaru.

Contoh:

Transaksi Terbaru Lihat semua

- Rp 7.000.000
  Gaji
  Hari ini

− Rp 35.000
Makan
Hari ini

- Rp 500.000
  MacBook
  Kemarin

Gunakan visual berbeda untuk membedakan income, expense, saving, dan withdrawal.

3.9 Dashboard Empty State

Jika user belum memiliki transaksi:

Belum ada transaksi

Mulai catat pemasukan atau pengeluaranmu
untuk melihat kondisi keuanganmu.

[ Tambah Transaksi ]

Jika belum memiliki goal:

Belum ada target tabungan

Buat target pertamamu dan mulai menabung
sedikit demi sedikit.

[ Buat Goal ]

4. Saving Goals

4.1 Tujuan

Halaman Saving Goals digunakan untuk melihat dan mengelola seluruh target tabungan.

4.2 Struktur Layout

Saving Goals
│
├── Header
│
├── Summary
│
├── Active Goals
│ ├── Goal Card
│ ├── Goal Card
│ └── Goal Card
│
└── Completed Goals

Tambahkan floating action button atau primary button:

- Buat Goal

  4.3 Summary

Tampilkan ringkasan singkat:

Total ditabung

Rp 7.500.000

3 target aktif

Jika sesuai kebutuhan, dapat ditambahkan:

Total target
Rp 25.000.000

Jangan membuat summary terlalu besar.

5. Goal Card

Setiap goal ditampilkan sebagai card.

Contoh:

┌────────────────────────────────────┐
│ 💻 MacBook │
│ │
│ Rp 5.000.000 │
│ dari Rp 15.000.000 │
│ │
│ █████████░░░░░░░░ 33% │
│ │
│ Target: Des 2027 │
└────────────────────────────────────┘

Jika tidak memiliki target date:

💻 MacBook

Rp 5.000.000
dari Rp 15.000.000

█████████░░░░░░░ 33%

Jangan tampilkan label deadline kosong.

6. Goal Detail

Ketika user menekan goal:

Goal Detail
│
├── Header
│
├── Goal Summary
│
├── Progress
│
├── Target Information
│
├── Primary Actions
│ ├── Tambah Tabungan
│ └── Ambil Tabungan
│
├── Saving History
│
└── Goal Actions
│ ├── Edit
│ └── Delete

6.1 Goal Summary

Contoh:

💻

MacBook

Rp 5.000.000
terkumpul

dari Rp 15.000.000

Progress harus menjadi visual utama.

6.2 Goal Progress

Tampilkan:

33%

Rp 5.000.000 / Rp 15.000.000

Jika goal completed:

🎉 Target tercapai!

Rp 15.000.000 / Rp 15.000.000

Progress visual tidak boleh melebihi 100%.

6.3 Goal Actions

Primary:

[ + Tambah Tabungan ]

Secondary:

[ Ambil Tabungan ]

Tambah tabungan harus lebih menonjol daripada withdrawal.

7. Create/Edit Goal

Form:

Buat Goal

Nama Goal
[ Contoh: MacBook ]

Icon
[ 💻 ]

Target Tabungan
[ Rp 15.000.000 ]

Target Date
[ Desember 2027 ]

[ Buat Goal ]

Target date bersifat optional.

Jika kosong, goal tetap valid.

8. Add Saving

Form dibuat sederhana.

Tambah Tabungan

Goal
MacBook

Nominal
Rp [ 500.000 ]

Catatan
[ Gaji bulan Agustus ]

Tanggal
[ 31 Agustus 2026 ]

[ Simpan ]

Nominal harus menjadi input paling menonjol.

Setelah berhasil:

Goal progress diperbarui.

Balance diperbarui.

History diperbarui.

Streak diperbarui.

9. Withdraw Saving

Form:

Ambil Tabungan

Goal
MacBook

Tersedia
Rp 5.000.000

Nominal
Rp [ 500.000 ]

Catatan
[ Beli kebutuhan ]

[ Ambil Tabungan ]

Jika nominal lebih besar dari saldo:

Jumlah pengambilan melebihi
tabungan yang tersedia.

Button submit harus disabled atau validation error sampai nominal valid.

10. Riwayat Transaksi

10.1 Tujuan

Menampilkan seluruh aktivitas keuangan user secara kronologis.

Jenis:

Income

Expense

Saving

Withdrawal

10.2 Struktur Layout

Riwayat Transaksi
│
├── Search / Filter
│
├── Filter Type
│
├── Date Group
│
└── Transaction List

10.3 Filter

Minimal:

Semua
Income
Expense
Saving
Withdrawal

Filter dapat dibuat sebagai horizontal chips/tabs.

Contoh:

[ Semua ] [ Income ] [ Expense ] [ Saving ]

11. Transaction Item

Contoh:

┌──────────────────────────────────────┐
│ 🍔 Makan −Rp35K │
│ Makanan Hari ini│
└──────────────────────────────────────┘

Income:

💼 Gaji +Rp7.000K
Gaji Hari ini

Saving:

💰 MacBook +Rp500K
Saving Hari ini

Withdrawal:

↩ MacBook −Rp100K
Withdrawal Hari ini

Gunakan icon dan typography yang jelas untuk membedakan tipe transaksi.

12. Transaction Detail

Saat transaction item ditekan:

Transaction Detail

Gaji

- Rp 7.000.000

Income
Gaji
31 Agustus 2026

Catatan:
Gaji bulan Agustus

[ Edit ]
[ Hapus ]

Untuk saving:

MacBook

- Rp 500.000

Saving
31 Agustus 2026

Untuk withdrawal:

MacBook

− Rp 100.000

Withdrawal
31 Agustus 2026

13. Statistik

13.1 Tujuan

Statistics membantu user memahami kondisi dan kebiasaan keuangannya.

Jangan membuat halaman statistik seperti dashboard accounting yang kompleks.

Fokus pada insight yang mudah dipahami.

13.2 Struktur Layout

Statistik
│
├── Period Selector
│
├── Financial Summary
│
├── Income vs Expense
│
├── Expense Breakdown
│
└── Saving Overview

14. Period Selector

User dapat memilih periode:

Minggu ini
Bulan ini
3 Bulan
Tahun ini
Custom

Untuk MVP minimal:

Bulan ini

Jika custom period belum diimplementasikan, jangan tampilkan opsi yang belum berfungsi.

15. Financial Summary

Contoh:

Bulan Agustus

Income
Rp 8.000.000

Expense
Rp 2.750.000

Saving
Rp 1.000.000

Gunakan hierarchy yang jelas.

16. Income vs Expense

Visualisasi dapat menggunakan bar chart atau line chart sederhana.

Contoh konsep:

Income █████████████████
Expense ██████
Saving ████

Tujuan chart adalah membantu user memahami perbandingan, bukan menampilkan data sebanyak mungkin.

17. Expense Breakdown

Tampilkan kategori pengeluaran.

Contoh:

Pengeluaran

Makanan Rp 950.000
Belanja Rp 550.000
Transportasi Rp 400.000
Hiburan Rp 250.000
Lainnya Rp 600.000

Dapat divisualisasikan dengan donut/pie chart.

Namun chart tidak wajib jika data lebih mudah dipahami dalam list.

18. Saving Overview

Tampilkan:

Total ditabung bulan ini

Rp 1.000.000

Target aktif
3

Progress keseluruhan
30%

Jika ada saving goals, tampilkan beberapa goal dengan progress.

19. Statistics Empty State

Jika belum ada transaksi:

Belum ada data statistik

Catat beberapa transaksi untuk
melihat pola keuanganmu.

Jangan menampilkan chart kosong yang membingungkan.

20. Color Semantics

Warna harus digunakan berdasarkan makna, bukan dekorasi semata.

Income

Gunakan warna semantic untuk nilai positif.

Expense

Gunakan warna semantic untuk nilai negatif.

Saving

Gunakan warna yang terasa positif/motivational tetapi tetap berbeda dari income.

Withdrawal

Gunakan warna netral/negatif ringan.

Warning

Digunakan untuk:

Validation

Nominal withdrawal terlalu besar

Potensi masalah

Jangan menggunakan warna secara berlebihan.

21. Typography

Gunakan typography yang:

Mudah dibaca.

Memiliki hierarchy jelas.

Tidak terlalu banyak variasi ukuran.

Hierarchy minimal:

Display / Balance
Heading
Section Title
Body
Caption

Nominal uang utama harus menggunakan ukuran/font weight yang lebih kuat dibanding label.

22. Spacing

Gunakan sistem spacing konsisten.

Rekomendasi base unit:

4
8
12
16
20
24
32

Hindari menggunakan angka spacing acak di setiap component.

23. Components

Buat component reusable minimal:

BalanceCard
GoalCard
ProgressBar
TransactionItem
TransactionTypeIcon
SummaryCard
QuickActionButton
SectionHeader
EmptyState
PrimaryButton
SecondaryButton
InputField
AmountInput
CategorySelector
GoalSelector
DatePicker
FilterChip

Component harus menerima data melalui props dan tidak mengambil data database secara langsung jika tidak diperlukan.

24. Forms

Semua form harus:

Memiliki label.

Memiliki validation.

Menampilkan error yang jelas.

Memiliki keyboard/input type yang sesuai.

Memformat nominal secara konsisten.

Tidak kehilangan input ketika terjadi validation error.

Untuk amount:

Gunakan numeric keyboard.

Simpan sebagai number/integer pada database.

Jangan menyimpan string format Rp 1.000.000 sebagai nilai database.

25. Loading State

Jika operasi database membutuhkan waktu:

Loading...

atau skeleton sederhana.

Jangan membuat user bisa menekan submit berkali-kali.

Saat submit sedang berjalan:

Disable button.

Tampilkan loading indicator.

26. Confirmation

Gunakan confirmation untuk destructive actions.

Contoh delete transaction:

Hapus transaksi?

Transaksi ini akan dihapus
secara permanen.

[ Batal ] [ Hapus ]

Contoh delete goal:

Hapus goal?

Goal dan data terkait akan dihapus
sesuai aturan aplikasi.

[ Batal ] [ Hapus ]

27. Feedback

Setelah action berhasil, user harus mendapatkan feedback.

Contoh:

✓ Tabungan berhasil ditambahkan

atau menggunakan toast/snackbar.

Feedback harus singkat dan tidak mengganggu flow.

28. Responsive Layout

Target utama adalah Android phone.

Tetap gunakan layout yang aman untuk berbagai ukuran layar.

Perhatikan:

Safe area

Status bar

Navigation bar

Keyboard

Small screen

Large screen

Jangan menggunakan fixed width yang menyebabkan overflow.

29. Accessibility

Minimal:

Touch target cukup besar.

Text memiliki kontras yang baik.

Icon tidak menjadi satu-satunya cara memahami informasi.

Button memiliki label yang jelas.

Jangan menggunakan warna sebagai satu-satunya indikator income/expense.

Contoh:

Jangan hanya:

Hijau = income
Merah = expense

Tetapi juga gunakan:

- Rp 500.000
  − Rp 50.000

30. Interaction Guidelines

Tap

Digunakan untuk:

Membuka detail.

Menjalankan action.

Memilih kategori.

Long Press

Tidak diperlukan untuk MVP kecuali ada kebutuhan khusus.

Swipe

Tidak diperlukan untuk MVP.

Jangan menambahkan gesture kompleks tanpa kebutuhan.

31. Empty States

Setiap halaman harus memiliki empty state yang relevan.

Dashboard

Belum ada transaksi.

Saving Goals

Belum ada goal.

Transaction History

Belum ada transaksi.

Statistics

Belum ada data.

Empty state harus selalu memiliki:

Judul singkat.

Penjelasan singkat.

CTA jika relevan.

32. Design Priorities

Jika terdapat trade-off antara visual dan usability, prioritaskan:

Usability

Readability

Data clarity

Consistency

Performance

Visual polish

Jangan mengorbankan usability hanya untuk membuat UI terlihat lebih unik.

33. MVP Screen Checklist

Dashboard

Header

Balance

Income summary

Expense summary

Quick actions

Saving streak

Saving goals preview

Recent transactions

Empty states

Saving Goals

Goal summary

Active goals

Completed goals

Create goal

Goal detail

Add saving

Withdraw saving

Edit goal

Delete goal

Goal completion state

Riwayat Transaksi

Transaction list

Type filter

Transaction detail

Edit transaction

Delete transaction

Empty state

Statistik

Period selector

Income summary

Expense summary

Saving summary

Income vs expense

Expense breakdown

Saving overview

Empty state

34. Design Definition of Done

Design dianggap siap diimplementasikan apabila:

Semua empat halaman utama memiliki struktur yang jelas.

User dapat memahami balance dari Dashboard.

User dapat menemukan action untuk mencatat uang dengan cepat.

User dapat melihat progress saving goals.

User dapat melihat seluruh transaksi.

User dapat memahami pola pengeluaran melalui Statistik.

Empty state tersedia.

Loading/error/validation state diperhitungkan.

Component UI dapat digunakan ulang.

Tidak ada screen yang membutuhkan desain baru di tengah implementasi karena requirement dasarnya sudah didefinisikan.

35. Design Principle Summary

SaveUp harus terasa seperti:

“Aplikasi yang bikin gue lebih sadar sama uang gue, tanpa bikin gue pusing ngatur uang.”

Prioritas desain:

Simple
↓
Clear
↓
Useful
↓
Motivating

Bukan:

Complex
↓
Lots of charts
↓
Lots of numbers
↓
Confusing
