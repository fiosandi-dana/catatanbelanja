import type { MetadataRoute } from "next";

/**
 * PWA manifest. Served at /manifest.webmanifest by Next.js.
 * Note: icons array is a placeholder — replace with real Pasar DANA mark
 * once design provides 192x192 and 512x512 PNGs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Catatan Belanja",
    short_name: "Catatan",
    description:
      "Cek harga sembako, catat belanja, lacak pengeluaran rumah tangga.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5F5",
    theme_color: "#2563EB",
    lang: "id",
    orientation: "portrait",
    icons: [
      // TODO: replace with real 192/512 marks. Browsers will fall back to
      // the route icon below until then.
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
