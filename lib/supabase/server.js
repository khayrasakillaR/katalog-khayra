import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function bersihkanUrlSupabase(url) {
  if (!url) return "";
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

/**
 * Membuat koneksi Supabase untuk server memakai SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data dari server (misalnya katalog dan detail produk).
 */
export function buatClientServer() {
  const supabaseUrl = bersihkanUrlSupabase(process.env.SUPABASE_URL);
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Membuat koneksi sesi admin memakai SUPABASE_PUBLISHABLE_KEY dan cookie (@supabase/ssr).
 * Digunakan untuk login, logout, ganti password, dan aksi kelola produk.
 */
export async function buatClientSesiAdmin() {
  const cookieStore = await cookies();
  const supabaseUrl = bersihkanUrlSupabase(process.env.SUPABASE_URL);
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createSSRClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Abaikan jika dipanggil saat Server Component sedang me-render
        }
      },
    },
  });
}

export const createServerClient = buatClientServer;
export const getSupabaseServer = buatClientServer;
export const createAdminSessionClient = buatClientSesiAdmin;
