import { toko } from "@/lib/toko";
import { buatClientServer } from "@/lib/supabase/server";
import KatalogProduk from "@/components/KatalogProduk";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const cari = params?.cari?.trim() || "";
  const kategori = params?.kategori || "Semua";
  const urutan = params?.urutan || "terbaru";
  const halaman = Math.max(1, parseInt(params?.halaman || "1", 10));
  const perHalaman = 6;

  let daftarProduk = [];
  let totalProduk = 0;
  let daftarKategori = ["Semua"];
  let pesanError = null;

  try {
    const supabase = buatClientServer();

    // 1. Ambil daftar kategori unik dari database
    const { data: semuaKat } = await supabase.from("produk").select("kategori");
    if (semuaKat) {
      const listKat = new Set();
      semuaKat.forEach((p) => {
        if (p.kategori) listKat.add(p.kategori);
      });
      daftarKategori = ["Semua", ...Array.from(listKat)];
    }

    // 2. Bangun query database untuk filter, urut, dan paginasi (US-11, US-15, US-16)
    let query = supabase.from("produk").select("*", { count: "exact" });

    if (kategori && kategori !== "Semua") {
      query = query.eq("kategori", kategori);
    }

    if (cari) {
      query = query.or(`nama.ilike.%${cari}%,deskripsi.ilike.%${cari}%`);
    }

    // Urutan (US-15)
    if (urutan === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (urutan === "termahal") {
      query = query.order("harga", { ascending: false });
    } else {
      query = query.order("id", { ascending: false });
    }

    // Paginasi di database query (US-16)
    const offset = (halaman - 1) * perHalaman;
    query = query.range(offset, offset + perHalaman - 1);

    const { data, count, error } = await query;

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data || [];
      totalProduk = count || 0;
    }
  } catch (err) {
    pesanError = `Gagal terhubung ke database: ${err.message}`;
  }

  const totalHalaman = Math.max(1, Math.ceil(totalProduk / perHalaman));

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
            <p className="font-semibold">{pesanError}</p>
          </div>
        ) : (
          <KatalogProduk
            daftarProduk={daftarProduk}
            totalProduk={totalProduk}
            halaman={halaman}
            totalHalaman={totalHalaman}
            kategoriAktif={kategori}
            cariAktif={cari}
            urutanAktif={urutan}
            daftarKategori={daftarKategori}
          />
        )}
      </section>
    </>
  );
}
