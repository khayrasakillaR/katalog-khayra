"use client";

import { useActionState, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

export default function FormProduk({
  produk = {},
  action,
  labelTombol = "Simpan produk",
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [previewFoto, setPreviewFoto] = useState(null);

  // State untuk US-14 (AI Description)
  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);

  const values = state?.values || produk;
  const errors = state?.errors || {};

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFoto(URL.createObjectURL(file));
    } else {
      setPreviewFoto(null);
    }
  }

  // Handler untuk pembuatan deskripsi otomatis oleh AI (US-14)
  async function handleGenerateAI() {
    const inputNama = document.querySelector('input[name="nama"]')?.value || "";
    const inputKategori =
      document.querySelector('input[name="kategori"]')?.value || "";

    if (!inputNama.trim()) {
      setPesanAI("Isi nama produk terlebih dahulu sebelum membuat deskripsi dengan AI.");
      return;
    }

    setLoadingAI(true);
    setPesanAI(null);

    try {
      const res = await buatDeskripsiAI(inputNama, inputKategori);
      if (res.error) {
        setPesanAI(res.error);
      } else if (res.deskripsi) {
        const textarea = document.querySelector('textarea[name="deskripsi"]');
        if (textarea) {
          textarea.value = res.deskripsi;
        }
      }
    } catch (err) {
      setPesanAI("Terjadi gangguan: " + err.message);
    } finally {
      setLoadingAI(false);
    }
  }

  const fotoAktif = previewFoto || values.foto_url;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="id" value={values.id || produk.id || ""} />

      {state?.error && (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
          <p className="font-semibold">Terjadi kesalahan</p>
          <p className="mt-0.5">{state.error}</p>
        </div>
      )}

      <Input
        label="Nama produk"
        name="nama"
        defaultValue={values.nama || ""}
        error={errors.nama}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Harga (Rp)"
          name="harga"
          type="number"
          min="1"
          defaultValue={values.harga || ""}
          error={errors.harga}
          required
        />
        <Input
          label="Kategori"
          name="kategori"
          defaultValue={values.kategori || ""}
          placeholder="Misal: Dimsum Kukus"
          error={errors.kategori}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Stok"
          name="stok"
          type="number"
          min="0"
          defaultValue={values.stok ?? 0}
          error={errors.stok}
        />
        <Input
          label="Link foto (opsional jika upload file)"
          name="foto_url"
          placeholder="https://... atau /produk/..."
          defaultValue={values.foto_url || ""}
        />
      </div>

      <div className="flex flex-col gap-1.5 text-sm font-semibold">
        <span>Unggah foto baru (.jpg, .jpeg, .png, .webp, maks. 2MB)</span>
        <input
          type="file"
          name="foto_file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-teks hover:file:bg-garis"
        />
        {errors.foto && (
          <span className="text-xs font-normal text-bahaya">{errors.foto}</span>
        )}
        {fotoAktif && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={fotoAktif}
              alt="Pratinjau foto"
              className="h-16 w-16 rounded-lg border border-garis object-cover"
            />
            <span className="text-xs text-teks-lembut">
              {previewFoto ? "Pratinjau foto baru" : "Foto saat ini"}
            </span>
          </div>
        )}
      </div>

      {/* Bagian Deskripsi dengan Tombol AI (US-14) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="input-deskripsi"
            className="text-sm font-semibold text-teks"
          >
            Deskripsi
          </label>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={loadingAI}
            className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-permukaan px-2.5 py-1 text-xs font-semibold text-utama transition-colors hover:bg-garis disabled:opacity-50"
            title="Buat draf deskripsi produk secara otomatis dengan bantuan AI"
          >
            {loadingAI ? (
              <>
                <span className="animate-spin">⏳</span> Membuat deskripsi...
              </>
            ) : (
              <>✨ Generate Deskripsi AI</>
            )}
          </button>
        </div>

        {pesanAI && (
          <p className="rounded-lg border border-garis bg-permukaan p-2 text-xs text-bahaya">
            {pesanAI}
          </p>
        )}

        <textarea
          id="input-deskripsi"
          name="deskripsi"
          rows={4}
          defaultValue={values.deskripsi || ""}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
