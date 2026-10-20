# Verifikasi produksi

Diperiksa pada 21 Oktober 2026, zona waktu Asia/Jakarta.

## Hasil

- Cloudflare Workers Static Assets berhasil dideploy dengan custom domain dan HTTPS.
- 82 halaman bilingual dapat diindeks. Pemeriksaan 87 URL, termasuk robots, sitemap, Markdown, dan llms.txt, mengembalikan HTTP 200.
- URL yang tidak ada mengembalikan HTTP 404.
- GitHub Actions menjalankan instalasi bersih, build, dan pemeriksaan konten dengan sukses.
- Uji produksi memeriksa pencarian, hasil kosong, kategori, simpanan setelah reload dan pergantian bahasa, pagination, checklist dan reset, serta pergantian tema.
- Uji penyimpanan yang diblokir tetap berfungsi dalam tab. Panduan dan FAQ tetap terbaca tanpa JavaScript.
- Lebar 360, 390, 768, 1024, dan 1440 px diperiksa untuk overflow. Hero desktop tetap dua baris dan tombolnya terlihat tanpa scroll.
- Mode terang/gelap diperiksa pada mobile dan desktop. Pemeriksaan axe WCAG 2 A/AA dan WCAG 2.1 A/AA lulus pada beranda dan contoh halaman tiap jenis.
- Uji terakhir tidak menemukan uncaught error atau console error.

Pemeriksaan otomatis mencakup sebagian aksesibilitas. Fokus keyboard, urutan DOM, label, kontras, target sentuh, disclosure native, fallback tanpa JavaScript, serta teks kesalahan juga ditinjau saat pembuatan.

## Pilihan teknis

Halaman menggunakan HTML statis, CSS, dan JavaScript kecil untuk interaksi. Tidak ada framework runtime, database, iklan, atau font dari CDN. Foto responsif memakai AVIF/WebP. Aset menggunakan nama berbasis hash dan cache setahun. HTML melakukan revalidasi.

HTML memakai `Cache-Control: no-transform` agar Cloudflare tidak menyisipkan beacon analytics otomatis yang bertentangan dengan CSP dan pilihan tanpa pelacak. Konsekuensinya, kompresi HTML oleh proxy juga tidak diterapkan. Ukuran beranda sekitar 90 KB sebelum transfer; hasil PageSpeed publik dicatat terpisah. Aturan ini hanya dikirim oleh situs ini dan tidak mengubah pengaturan domain lain.

`workers.dev` mendapat `X-Robots-Tag: noindex`; URL kanonis mengarah ke custom domain. CSP membatasi script/font/gambar ke origin sendiri. Inline CSS memakai hash CSP. Script JSON-LD berisi data inert.

## Audit

- [PageSpeed Insights publik](pagespeed.md)
- [Lighthouse dari komputer pengujian](results.md)

Kedua alat menilai situs produksi. Lokasi runner, latensi, beban perangkat, dan waktu pengujian dapat membuat skor berbeda. Hasil lab bukan data pengguna nyata. Belum ada data CrUX karena situs baru. GEO tidak memiliki ukuran baku 100/100; structured data dan sumber bukan jaminan peringkat atau kutipan AI.
