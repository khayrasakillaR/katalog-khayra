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
