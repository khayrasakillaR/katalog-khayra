"use client";

import { useState, useEffect } from "react";
import { toko } from "@/lib/toko";

export default function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [bisaInstall, setBisaInstall] = useState(false);
  const [terpasang, setTerpasang] = useState(false);

  useEffect(() => {
    // 1. Registrasi Service Worker untuk offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {});
    }

    // 2. Deteksi apakah sudah terpasang dalam mode standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setTerpasang(true);
      return;
    }

    // 3. Tangkap event beforeinstallprompt
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setBisaInstall(true);
    }

    function handleAppInstalled() {
      setBisaInstall(false);
      setDeferredPrompt(null);
      setTerpasang(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setBisaInstall(false);
    }
    setDeferredPrompt(null);
  }

  if (terpasang || !bisaInstall) {
    return null;
  }

  return (
    <aside
      aria-label="Promosi pasang aplikasi PWA"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-garis bg-latar p-4 shadow-2xl transition-all sm:bottom-6"
    >
      <div className="flex items-center gap-3">
        <img
          src="/icons/icon-192.png"
          alt={toko.nama}
          className="h-12 w-12 rounded-xl object-cover shadow-xs"
        />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-teks">Pasang {toko.nama}</h4>
          <p className="text-xs text-teks-lembut">
            Akses katalog lebih cepat langsung dari layar utama HP Anda!
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setBisaInstall(false)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-teks-lembut hover:bg-permukaan"
        >
          Nanti
        </button>
        <button
          type="button"
          onClick={installApp}
          className="rounded-lg bg-utama px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-utama-gelap"
        >
          Pasang Aplikasi
        </button>
      </div>
    </aside>
  );
}

