"use server";

import { redirect } from "next/navigation";
import { buatClientSesiAdmin } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  // Mendukung pemanggilan baik melalui useActionState maupun form action langsung
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  const email = data?.get("email")?.toString().trim();
  const password = data?.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatClientSesiAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatClientSesiAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export const logout = keluar;

export async function gantiPassword(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  const passwordBaru = data?.get("password_baru")?.toString() || "";
  const konfirmasiPassword =
    data?.get("konfirmasi_password")?.toString() || "";

  // 1. Periksa sesi admin yang sedang login di server
  const supabase = await buatClientSesiAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Kamu harus login terlebih dahulu untuk mengganti password." };
  }

  // 2. Validasi panjang password minimal 8 karakter
  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  // 3. Validasi kecocokan dengan konfirmasi password
  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  // 4. Update password melalui Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: `Gagal mengganti password: ${error.message}` };
  }

  return { success: true, message: "Password berhasil diganti." };
}

export async function tambahProduk(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  // 1. Wajib memeriksa di server bahwa admin sudah login
  const supabase = await buatClientSesiAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Aksi ditolak: Anda harus login sebagai admin." };
  }

  // 2. Ekstraksi dan sanitasi input untuk pencegahan XSS
  const namaRaw = data?.get("nama")?.toString() || "";
  const hargaRaw = data?.get("harga")?.toString() || "";
  const kategoriRaw = data?.get("kategori")?.toString() || "";
  const stokRaw = data?.get("stok")?.toString() || "";
  const deskripsiRaw = data?.get("deskripsi")?.toString() || "";
  const fotoUrlRaw = data?.get("foto_url")?.toString() || "";
  const fotoFile = data?.get("foto_file");

  const nama = namaRaw.replace(/<[^>]*>/g, "").trim();
  const kategori = kategoriRaw.replace(/<[^>]*>/g, "").trim();
  const deskripsi = deskripsiRaw.replace(/<[^>]*>/g, "").trim();
  let fotoUrl = fotoUrlRaw.replace(/<[^>]*>/g, "").trim();

  // 3. Validasi per field
  const errors = {};

  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  } else if (nama.length < 3) {
    errors.nama = "Nama produk minimal 3 karakter.";
  } else if (nama.length > 100) {
    errors.nama = "Nama produk maksimal 100 karakter.";
  }

  const hargaNum = Number(hargaRaw);
  if (!hargaRaw || isNaN(hargaNum) || hargaNum <= 0) {
    errors.harga = "Harga wajib diisi angka positif numerik (> 0).";
  }

  if (!kategori) {
    errors.kategori = "Kategori wajib diisi.";
  }

  if (stokRaw !== "") {
    const stokNum = Number(stokRaw);
    if (isNaN(stokNum) || stokNum < 0 || !Number.isInteger(stokNum)) {
      errors.stok = "Stok harus berupa angka bulat non-negatif (≥ 0).";
    }
  }

  // Validasi file foto jika diunggah
  if (fotoFile && typeof fotoFile === "object" && fotoFile.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(fotoFile.type)) {
      errors.foto = "Format foto tidak didukung. Gunakan .jpg, .jpeg, .png, atau .webp.";
    } else if (fotoFile.size > 2 * 1024 * 1024) {
      errors.foto = "Ukuran gambar terlalu besar. Maksimal 2MB.";
    }
  }

  // Jika ada error validasi, kembalikan error beserta nilai form agar tidak hilang
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: {
        nama: namaRaw,
        harga: hargaRaw,
        kategori: kategoriRaw,
        stok: stokRaw,
        deskripsi: deskripsiRaw,
        foto_url: fotoUrlRaw,
      },
    };
  }

  // 4. Proses upload foto ke Supabase Storage (jika ada file)
  if (fotoFile && typeof fotoFile === "object" && fotoFile.size > 0) {
    try {
      const buffer = Buffer.from(await fotoFile.arrayBuffer());
      const ext = fotoFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanFileName = `produk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("produk")
        .upload(cleanFileName, buffer, {
          contentType: fotoFile.type,
          upsert: true,
        });

      if (uploadErr) {
        return {
          error: `Gagal mengunggah foto: ${uploadErr.message}. Silakan coba lagi.`,
          values: {
            nama: namaRaw,
            harga: hargaRaw,
            kategori: kategoriRaw,
            stok: stokRaw,
            deskripsi: deskripsiRaw,
            foto_url: fotoUrlRaw,
          },
        };
      }

      const { data: pubData } = supabase.storage
        .from("produk")
        .getPublicUrl(cleanFileName);

      fotoUrl = pubData.publicUrl;
    } catch {
      return {
        error: "Koneksi terputus saat mengunggah foto. Silakan coba lagi.",
        values: {
          nama: namaRaw,
          harga: hargaRaw,
          kategori: kategoriRaw,
          stok: stokRaw,
          deskripsi: deskripsiRaw,
          foto_url: fotoUrlRaw,
        },
      };
    }
  }

  if (!fotoUrl) {
    fotoUrl = "/produk/dimsum-ayam.svg";
  }

  // 5. Simpan ke database Supabase
  const dataInsert = {
    nama,
    harga: hargaNum,
    kategori,
    deskripsi: deskripsi || null,
    foto_url: fotoUrl,
  };

  let insertRes;
  if (stokRaw !== "") {
    insertRes = await supabase
      .from("produk")
      .insert({ ...dataInsert, stok: Number(stokRaw) });
    if (insertRes.error && insertRes.error.message?.includes("'stok'")) {
      insertRes = await supabase.from("produk").insert(dataInsert);
    }
  } else {
    insertRes = await supabase.from("produk").insert(dataInsert);
  }

  if (insertRes.error) {
    return {
      error: `Gagal menyimpan produk: ${insertRes.error.message}`,
      values: {
        nama: namaRaw,
        harga: hargaRaw,
        kategori: kategoriRaw,
        stok: stokRaw,
        deskripsi: deskripsiRaw,
        foto_url: fotoUrlRaw,
      },
    };
  }

  // 6. Selesai: arahkan kembali ke katalog admin dengan notifikasi sukses
  redirect("/admin?pesan=" + encodeURIComponent("Produk berhasil ditambahkan"));
}

export async function ubahProduk(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  // 1. Wajib memeriksa di server bahwa admin sudah login
  const supabase = await buatClientSesiAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Aksi ditolak: Anda harus login sebagai admin." };
  }

  // 2. Baca ID produk
  const id = data?.get("id")?.toString();
  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  // Periksa apakah produk ada di database
  const { data: existingProduct, error: fetchErr } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !existingProduct) {
    redirect("/admin?error=" + encodeURIComponent("Produk tidak ditemukan"));
  }

  // 3. Ekstraksi dan sanitasi input untuk pencegahan XSS
  const namaRaw = data?.get("nama")?.toString() || "";
  const hargaRaw = data?.get("harga")?.toString() || "";
  const kategoriRaw = data?.get("kategori")?.toString() || "";
  const stokRaw = data?.get("stok")?.toString() || "";
  const deskripsiRaw = data?.get("deskripsi")?.toString() || "";
  const fotoUrlRaw = data?.get("foto_url")?.toString() || "";
  const fotoFile = data?.get("foto_file");

  const nama = namaRaw.replace(/<[^>]*>/g, "").trim();
  const kategori = kategoriRaw.replace(/<[^>]*>/g, "").trim();
  const deskripsi = deskripsiRaw.replace(/<[^>]*>/g, "").trim();
  let fotoUrl = fotoUrlRaw.replace(/<[^>]*>/g, "").trim();

  // 4. Validasi per field
  const errors = {};

  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  } else if (nama.length < 3) {
    errors.nama = "Nama produk minimal 3 karakter.";
  } else if (nama.length > 100) {
    errors.nama = "Nama produk maksimal 100 karakter.";
  }

  const hargaNum = Number(hargaRaw);
  if (!hargaRaw || isNaN(hargaNum) || hargaNum <= 0) {
    errors.harga = "Harga wajib diisi angka positif numerik (> 0).";
  }

  if (!kategori) {
    errors.kategori = "Kategori wajib diisi.";
  }

  if (stokRaw !== "") {
    const stokNum = Number(stokRaw);
    if (isNaN(stokNum) || stokNum < 0 || !Number.isInteger(stokNum)) {
      errors.stok = "Stok harus berupa angka bulat non-negatif (≥ 0).";
    }
  }

  const hasNewFile =
    fotoFile && typeof fotoFile === "object" && fotoFile.size > 0;

  if (hasNewFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(fotoFile.type)) {
      errors.foto = "Format foto tidak didukung. Gunakan .jpg, .jpeg, .png, atau .webp.";
    } else if (fotoFile.size > 2 * 1024 * 1024) {
      errors.foto = "Ukuran gambar terlalu besar. Maksimal 2MB.";
    }
  }

  // Jika ada error validasi, kembalikan error beserta nilai form agar tidak hilang
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: {
        id,
        nama: namaRaw,
        harga: hargaRaw,
        kategori: kategoriRaw,
        stok: stokRaw,
        deskripsi: deskripsiRaw,
        foto_url: fotoUrlRaw,
      },
    };
  }

  // 5. Edge Case: Pembaruan tanpa perubahan data
  const isNoChange =
    !hasNewFile &&
    nama === existingProduct.nama &&
    hargaNum === existingProduct.harga &&
    kategori === (existingProduct.kategori || "") &&
    deskripsi === (existingProduct.deskripsi || "") &&
    (fotoUrl === (existingProduct.foto_url || "") || (!fotoUrl && existingProduct.foto_url));

  if (isNoChange) {
    redirect("/admin");
  }

  // 6. Upload foto baru jika ada file yang diunggah
  if (hasNewFile) {
    try {
      const buffer = Buffer.from(await fotoFile.arrayBuffer());
      const ext = fotoFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanFileName = `produk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("produk")
        .upload(cleanFileName, buffer, {
          contentType: fotoFile.type,
          upsert: true,
        });

      if (uploadErr) {
        return {
          error: `Gagal mengunggah foto: ${uploadErr.message}. Silakan coba lagi.`,
          values: {
            id,
            nama: namaRaw,
            harga: hargaRaw,
            kategori: kategoriRaw,
            stok: stokRaw,
            deskripsi: deskripsiRaw,
            foto_url: fotoUrlRaw,
          },
        };
      }

      const { data: pubData } = supabase.storage
        .from("produk")
        .getPublicUrl(cleanFileName);

      fotoUrl = pubData.publicUrl;
    } catch {
      return {
        error: "Koneksi terputus saat mengunggah foto. Silakan coba lagi.",
        values: {
          id,
          nama: namaRaw,
          harga: hargaRaw,
          kategori: kategoriRaw,
          stok: stokRaw,
          deskripsi: deskripsiRaw,
          foto_url: fotoUrlRaw,
        },
      };
    }
  }

  // Pertahankan foto lama jika fotoUrl tidak diisi
  if (!fotoUrl) {
    fotoUrl = existingProduct.foto_url || "/produk/dimsum-ayam.svg";
  }

  // 7. Simpan pembaruan ke database Supabase
  const dataUpdate = {
    nama,
    harga: hargaNum,
    kategori,
    deskripsi: deskripsi || null,
    foto_url: fotoUrl,
  };

  let updateRes;
  if (stokRaw !== "") {
    updateRes = await supabase
      .from("produk")
      .update({ ...dataUpdate, stok: Number(stokRaw) })
      .eq("id", id);
    if (updateRes.error && updateRes.error.message?.includes("'stok'")) {
      updateRes = await supabase.from("produk").update(dataUpdate).eq("id", id);
    }
  } else {
    updateRes = await supabase.from("produk").update(dataUpdate).eq("id", id);
  }

  if (updateRes.error) {
    return {
      error: `Gagal memperbarui produk: ${updateRes.error.message}`,
      values: {
        id,
        nama: namaRaw,
        harga: hargaRaw,
        kategori: kategoriRaw,
        stok: stokRaw,
        deskripsi: deskripsiRaw,
        foto_url: fotoUrlRaw,
      },
    };
  }

  // 8. Selesai: arahkan kembali ke katalog admin dengan notifikasi sukses
  redirect("/admin?pesan=" + encodeURIComponent("Produk berhasil diperbarui"));
}
