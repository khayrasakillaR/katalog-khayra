"use client";

import { useActionState, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FormProduk({
  produk = {},
  action,
  labelTombol = "Simpan produk",
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [previewFoto, setPreviewFoto] = useState(null);

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

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
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
        <span>Unggah foto (.jpg, .jpeg, .png, .webp, maks. 2MB)</span>
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
        {(previewFoto || values.foto_url) && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={previewFoto || values.foto_url}
              alt="Pratinjau foto"
              className="h-16 w-16 rounded-lg border border-garis object-cover"
            />
            <span className="text-xs text-teks-lembut">Pratinjau foto produk</span>
          </div>
        )}
      </div>

      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        rows={4}
        defaultValue={values.deskripsi || ""}
      />

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
