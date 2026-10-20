import { createClient } from "@supabase/supabase-js";

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

export const createServerClient = buatClientServer;
export const getSupabaseServer = buatClientServer;

