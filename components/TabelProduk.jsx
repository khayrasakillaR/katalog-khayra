"use client";

import { useState, useActionState, useEffect } from "react";
import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk }) {
  const [produkYangAkanDihapus, setProdukYangAkanDihapus] = useState(null);
  const [state, formAction, isPending] = useActionState(hapusProduk, null);

  // Tutup modal jika tombol Escape ditekan saat tidak sedang proses
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && !isPending) {
        setProdukYangAkanDihapus(null);
      }
    }
    if (produkYangAkanDihapus) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [produkYangAkanDihapus, isPending]);

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-garis">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3 font-semibold">Produk</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Harga</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {daftarProduk.map((produk) => (
              <tr key={produk.id} className="border-t border-garis">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={produk.foto_url}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <span className="font-semibold">{produk.nama}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
                <td className="px-4 py-3">{formatRupiah(produk.harga)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                      Ubah
                    </Tombol>
                    <Tombol
                      type="button"
                      varian="bahaya"
                      onClick={() => setProdukYangAkanDihapus(produk)}
                    >
                      Hapus
                    </Tombol>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog Konfirmasi Hapus Produk */}
      {produkYangAkanDihapus && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-hapus-judul"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-garis bg-latar p-6 shadow-2xl">
            <h2 id="modal-hapus-judul" className="text-lg font-bold text-teks">
              Hapus produk
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-teks-lembut">
              Apakah Anda yakin ingin menghapus{" "}
              <strong className="text-teks">{produkYangAkanDihapus.nama}</strong>?
              Produk yang dihapus tidak akan muncul lagi di katalog.
            </p>

            {state?.error && (
              <p className="mt-3 rounded-lg border border-garis bg-permukaan p-3 text-xs text-bahaya">
                {state.error}
              </p>
            )}

            <form action={formAction} className="mt-6 flex justify-end gap-3">
              <input type="hidden" name="id" value={produkYangAkanDihapus.id} />
              <Tombol
                type="button"
                varian="garis"
                disabled={isPending}
                onClick={() => setProdukYangAkanDihapus(null)}
              >
                Batal
              </Tombol>
              <Tombol type="submit" varian="bahaya" disabled={isPending}>
                {isPending ? "Menghapus..." : "Ya, Hapus"}
              </Tombol>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
