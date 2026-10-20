"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function OpsiPesanProduk({ produk }) {
  const isMinuman = produk.kategori?.toLowerCase().includes("minuman");

  // Varian Porsi / Ukuran
  const daftarUkuran = isMinuman
    ? [
        { nama: "Reguler (16 oz)", ekstra: 0 },
        { nama: "Large (22 oz)", ekstra: 4000 },
      ]
    : [
        { nama: "Porsi Standar", ekstra: 0 },
        {
          nama: "Porsi Jumbo (2x)",
          ekstra: Math.round(((produk.harga || 0) * 0.85) / 1000) * 1000,
        },
      ];

  // Varian Saus / Cocolan (khusus makanan)
  const daftarSaus = isMinuman
    ? []
    : [
        { nama: "Saus Sambal Khas", ekstra: 0 },
        { nama: "Chili Oil Gurih", ekstra: 2000 },
        { nama: "Saus Mentai", ekstra: 5000 },
      ];

  const [ukuranDipilih, setUkuranDipilih] = useState(daftarUkuran[0]);
  const [sausDipilih, setSausDipilih] = useState(daftarSaus[0] || null);
  const [jumlah, setJumlah] = useState(1);

  const stokTersedia =
    produk.stok !== undefined && produk.stok !== null ? produk.stok : 50;
  const isStokHabis = stokTersedia <= 0;

  // Hitung harga per item sesuai varian
  const hargaSatuan =
    (produk.harga || 0) +
    (ukuranDipilih?.ekstra || 0) +
    (sausDipilih?.ekstra || 0);

  const totalHarga = hargaSatuan * jumlah;

  function kurangiJumlah() {
    if (jumlah > 1) {
      setJumlah(jumlah - 1);
    }
  }

  function tambahJumlah() {
    if (jumlah < stokTersedia) {
      setJumlah(jumlah + 1);
    }
  }

  // Buat pesan WhatsApp otomatis (US-03 & US-12)
  const detailVarian = [
    ukuranDipilih?.nama,
    sausDipilih ? `Saus: ${sausDipilih.nama}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const teksPesan = `Halo ${toko.nama}, saya ingin memesan:
- Produk: ${produk.nama}
- Varian: ${detailVarian}
- Jumlah: ${jumlah} item
- Total: ${formatRupiah(totalHarga)}

Mohon konfirmasi ketersediaannya. Terima kasih!`;

  const urlWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(teksPesan)}`;

  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* Tampilan Harga Dinamis */}
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="rounded-md bg-harga-latar px-3 py-1 text-2xl font-bold text-harga">
          {formatRupiah(hargaSatuan)}
        </p>
        {stokTersedia > 0 && stokTersedia <= 10 && (
          <span className="text-xs font-semibold text-bahaya">
            Sisa stok: {stokTersedia}
          </span>
        )}
        {isStokHabis && (
          <span className="rounded bg-bahaya/10 px-2.5 py-1 text-xs font-bold text-bahaya">
            Stok Habis
          </span>
        )}
      </div>

      {/* Pilihan Varian Ukuran/Porsi */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-teks">
          Pilih Ukuran / Porsi:
        </label>
        <div className="flex flex-wrap gap-2">
          {daftarUkuran.map((item) => {
            const aktif = ukuranDipilih.nama === item.nama;
            return (
              <button
                key={item.nama}
                type="button"
                disabled={isStokHabis}
                onClick={() => setUkuranDipilih(item)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  aktif
                    ? "border-utama bg-utama/10 font-bold text-utama"
                    : "border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                } ${isStokHabis ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {item.nama}{" "}
                {item.ekstra > 0 && `(+${formatRupiah(item.ekstra)})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pilihan Varian Saus (jika ada) */}
      {daftarSaus.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-teks">
            Pilihan Saus / Cocolan:
          </label>
          <div className="flex flex-wrap gap-2">
            {daftarSaus.map((item) => {
              const aktif = sausDipilih?.nama === item.nama;
              return (
                <button
                  key={item.nama}
                  type="button"
                  disabled={isStokHabis}
                  onClick={() => setSausDipilih(item)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    aktif
                      ? "border-utama bg-utama/10 font-bold text-utama"
                      : "border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                  } ${isStokHabis ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {item.nama}{" "}
                  {item.ekstra > 0 && `(+${formatRupiah(item.ekstra)})`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pemilihan Jumlah Barang */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold text-teks">Jumlah:</label>
        <div className="flex items-center rounded-lg border border-garis bg-latar">
          <button
            type="button"
            onClick={kurangiJumlah}
            disabled={jumlah <= 1 || isStokHabis}
            className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks transition-colors hover:bg-permukaan disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Kurangi jumlah"
          >
            -
          </button>
          <span className="w-12 text-center text-sm font-bold text-teks">
            {jumlah}
          </span>
          <button
            type="button"
            onClick={tambahJumlah}
            disabled={jumlah >= stokTersedia || isStokHabis}
            className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks transition-colors hover:bg-permukaan disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
        <div className="text-sm text-teks-lembut">
          Total:{" "}
          <strong className="text-teks">{formatRupiah(totalHarga)}</strong>
        </div>
      </div>

      {/* Tombol Pesan via WhatsApp */}
      {isStokHabis ? (
        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-garis px-5 py-3 font-semibold text-teks-lembut sm:w-auto"
        >
          Stok Habis
        </button>
      ) : (
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap sm:w-auto"
        >
          Pesan via WhatsApp ({formatRupiah(totalHarga)})
        </a>
      )}
    </div>
  );
}

