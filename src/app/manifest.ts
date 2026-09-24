import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Leaf Genix Lifesciences",
    short_name: "Leaf Genix",
    description:
      "Research-led nutraceuticals with complete ingredient quantities and clear label information.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#005c2d",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
