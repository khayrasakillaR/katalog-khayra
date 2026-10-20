import Link from "next/link";
import { notFound } from "next/navigation";
import { buatClientServer } from "@/lib/supabase/server";
import OpsiPesanProduk from "@/components/OpsiPesanProduk";

export const dynamic = "force-dynamic";

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = buatClientServer();

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  return (
    <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
      <img
        src={produk.foto_url}
        alt={produk.nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          Kembali ke katalog
        </Link>
        <p className="text-sm text-teks-lembut">{produk.kategori}</p>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
          {produk.nama}
        </h1>
        <p className="max-w-prose leading-relaxed text-teks-lembut">
          {produk.deskripsi}
        </p>

        {/* Pilihan varian, jumlah, dan tombol WhatsApp (US-12) */}
        <OpsiPesanProduk produk={produk} />
      </div>
    </article>
  );
}
