"use client";

import { useState, useMemo, useEffect } from "react";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";

export default function KatalogProduk({ daftarProduk = [] }) {
  const [inputQuery, setInputQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [kategoriDipilih, setKategoriDipilih] = useState("Semua");

  // Debounce search input (300 ms) agar tidak membebani performa
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  // Ekstrak daftar kategori unik dari data produk
  const daftarKategori = useMemo(() => {
    const list = new Set();
    daftarProduk.forEach((p) => {
      if (p.kategori) list.add(p.kategori);
    });
    return ["Semua", ...Array.from(list)];
  }, [daftarProduk]);

  // Filter produk berdasarkan kombinasi kata kunci dan kategori
  const hasilFilter = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();

    return daftarProduk.filter((produk) => {
      const cocokKategori =
        kategoriDipilih === "Semua" || produk.kategori === kategoriDipilih;

      const cocokKataKunci =
        !query ||
        produk.nama?.toLowerCase().includes(query) ||
        produk.deskripsi?.toLowerCase().includes(query);

      return cocokKategori && cocokKataKunci;
    });
  }, [daftarProduk, debouncedQuery, kategoriDipilih]);

  function resetFilter() {
    setInputQuery("");
    setDebouncedQuery("");
    setKategoriDipilih("Semua");
  }

  const isFiltering =
    inputQuery.trim().length > 0 || kategoriDipilih !== "Semua";

  return (
    <div className="flex flex-col gap-6">
      {/* Kolom Pencarian & Pilihan Kategori */}
      <div className="flex flex-col gap-4">
        {/* Input Pencarian */}
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-teks-lembut">
            <svg
              className="h-4 w-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Cari menu dimsum atau bahan..."
            className="w-full rounded-xl border border-garis bg-latar py-2.5 pl-10 pr-10 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          {inputQuery && (
            <button
              type="button"
              onClick={() => {
                setInputQuery("");
                setDebouncedQuery("");
              }}
              title="Hapus pencarian"
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-teks-lembut hover:text-teks"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Pilihan Kategori (Chips) */}
        {daftarKategori.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {daftarKategori.map((kat) => {
              const aktif = kategoriDipilih === kat;
              return (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setKategoriDipilih(kat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                    aktif
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                  }`}
                >
                  {kat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ringkasan Hasil Saat Memfilter */}
      {isFiltering && (
        <div className="flex items-center justify-between text-xs text-teks-lembut sm:text-sm">
          <span>
            Menampilkan <strong>{hasilFilter.length}</strong> produk
            {kategoriDipilih !== "Semua" && ` di kategori "${kategoriDipilih}"`}
            {debouncedQuery.trim() &&
              ` untuk pencarian "${debouncedQuery.trim()}"`}
          </span>
          <button
            type="button"
            onClick={resetFilter}
            className="font-medium text-utama underline underline-offset-2 hover:text-utama-gelap"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* Hasil Produk atau Empty State */}
      {hasilFilter.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan/50 px-4 py-16 text-center">
          <p className="text-base font-semibold text-teks">
            Produk tidak ditemukan
          </p>
          <p className="mt-1 text-sm text-teks-lembut">
            Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
          </p>
          <div className="mt-5">
            <Tombol type="button" varian="garis" onClick={resetFilter}>
              Reset filter
            </Tombol>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {hasilFilter.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}

