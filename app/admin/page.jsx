import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatClientSesiAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.pesan;
  const pesanError = params?.error;

  const supabase = await buatClientSesiAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .order("id", { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanSukses && (
        <p className="rounded-lg border border-garis bg-permukaan p-3 text-sm font-medium text-utama">
          {pesanSukses}
        </p>
      )}

      {pesanError && (
        <p className="rounded-lg border border-garis bg-permukaan p-3 text-sm font-medium text-bahaya">
          {pesanError}
        </p>
      )}

      {error ? (
        <p className="rounded-lg border border-garis bg-permukaan p-4 text-sm text-bahaya">
          Gagal memuat produk: {error.message}
        </p>
      ) : !daftarProduk || daftarProduk.length === 0 ? (
        <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
