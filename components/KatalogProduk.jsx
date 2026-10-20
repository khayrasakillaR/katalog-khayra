"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";

export default function KatalogProduk({
  daftarProduk = [],
  totalProduk = 0,
  halaman = 1,
  totalHalaman = 1,
  kategoriAktif = "Semua",
  cariAktif = "",
  urutanAktif = "terbaru",
  daftarKategori = ["Semua"],
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [inputQuery, setInputQuery] = useState(cariAktif);

  // Sinkronkan input query jika parameter pencarian di URL berubah
  useEffect(() => {
    setInputQuery(cariAktif);
  }, [cariAktif]);

  function navigasi(paramsBaru) {
    const searchParams = new URLSearchParams();

    const finalKategori =
      paramsBaru.kategori !== undefined ? paramsBaru.kategori : kategoriAktif;
    const finalCari =
      paramsBaru.cari !== undefined ? paramsBaru.cari : inputQuery;
    const finalUrutan =
      paramsBaru.urutan !== undefined ? paramsBaru.urutan : urutanAktif;
    const finalHalaman =
      paramsBaru.halaman !== undefined ? paramsBaru.halaman : halaman;

    if (finalKategori && finalKategori !== "Semua") {
      searchParams.set("kategori", finalKategori);
    }
    if (finalCari && finalCari.trim()) {
      searchParams.set("cari", finalCari.trim());
    }
    if (finalUrutan && finalUrutan !== "terbaru") {
      searchParams.set("urutan", finalUrutan);
    }
    if (finalHalaman && finalHalaman > 1) {
      searchParams.set("halaman", finalHalaman.toString());
    }

    const queryStr = searchParams.toString();
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname);
  }

  // Debounce input pencarian (400 ms)
  useEffect(() => {
    if (inputQuery === cariAktif) return;
    const timer = setTimeout(() => {
      navigasi({ cari: inputQuery, halaman: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  function handleKategori(kat) {
    navigasi({ kategori: kat, halaman: 1 });
  }

  function handleUrutan(e) {
    navigasi({ urutan: e.target.value, halaman: 1 });
  }

  function handleHalaman(nomor) {
    navigasi({ halaman: nomor });
  }

  function resetSemua() {
    setInputQuery("");
    router.push(pathname);
  }

  const isFiltering =
    Boolean(cariAktif.trim()) ||
    kategoriAktif !== "Semua" ||
    urutanAktif !== "terbaru";

  return (
    <div className="flex flex-col gap-6">
      {/* Bar Kontrol: Pencarian & Menu Urutan (US-11 & US-15) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Kolom Pencarian */}
        <div className="relative w-full max-w-md">
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
            placeholder="Cari dimsum, rasa, menu..."
            className="w-full rounded-xl border border-garis bg-latar py-2.5 pl-10 pr-10 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          {inputQuery && (
            <button
              type="button"
              onClick={() => {
                setInputQuery("");
                navigasi({ cari: "", halaman: 1 });
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

        {/* Dropdown Menu Urutan (US-15) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label
            htmlFor="select-urutan"
            className="text-xs font-semibold text-teks-lembut"
          >
            Urutkan:
          </label>
          <select
            id="select-urutan"
            value={urutanAktif}
            onChange={handleUrutan}
            className="rounded-xl border border-garis bg-latar px-3 py-2 text-xs font-semibold text-teks focus:border-utama focus:outline-none sm:text-sm"
          >
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Harga: Termurah</option>
            <option value="termahal">Harga: Termahal</option>
          </select>
        </div>
      </div>

      {/* Pilihan Kategori (Chips) */}
      {daftarKategori.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {daftarKategori.map((kat) => {
            const aktif = kategoriAktif === kat;
            return (
              <button
                key={kat}
                type="button"
                onClick={() => handleKategori(kat)}
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

      {/* Ringkasan Filter & Tombol Reset */}
      {isFiltering && (
        <div className="flex items-center justify-between text-xs text-teks-lembut sm:text-sm">
          <span>
            Menampilkan total <strong>{totalProduk}</strong> produk
            {kategoriAktif !== "Semua" && ` di kategori "${kategoriAktif}"`}
            {cariAktif && ` untuk pencarian "${cariAktif}"`}
          </span>
          <button
            type="button"
            onClick={resetSemua}
            className="font-medium text-utama underline underline-offset-2 hover:text-utama-gelap"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* Hasil Produk / Empty State */}
      {daftarProduk.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan/50 px-4 py-16 text-center">
          <p className="text-base font-semibold text-teks">
            Produk tidak ditemukan
          </p>
          <p className="mt-1 text-sm text-teks-lembut">
            Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
          </p>
          <div className="mt-5">
            <Tombol type="button" varian="garis" onClick={resetSemua}>
              Reset filter
            </Tombol>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>

          {/* Navigasi Paginasi (US-16) */}
          {totalHalaman > 1 && (
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-garis pt-6 sm:flex-row">
              <span className="text-xs text-teks-lembut sm:text-sm">
                Halaman <strong>{halaman}</strong> dari{" "}
                <strong>{totalHalaman}</strong> ({totalProduk} produk)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={halaman <= 1}
                  onClick={() => handleHalaman(halaman - 1)}
                  className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks transition-colors hover:border-utama hover:text-utama disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-garis disabled:hover:text-teks"
                >
                  ← Sebelumnya
                </button>

                {Array.from({ length: totalHalaman }, (_, i) => i + 1).map(
                  (p) => {
                    const isCurrent = p === halaman;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleHalaman(p)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
                          isCurrent
                            ? "bg-utama text-white"
                            : "border border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                )}

                <button
                  type="button"
                  disabled={halaman >= totalHalaman}
                  onClick={() => handleHalaman(halaman + 1)}
                  className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks transition-colors hover:border-utama hover:text-utama disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-garis disabled:hover:text-teks"
                >
                  Berikutnya →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
