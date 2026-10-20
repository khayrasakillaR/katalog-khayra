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

