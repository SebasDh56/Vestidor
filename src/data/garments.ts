import type { Garment, SizeChartEntry } from "@/src/types/garment";

export const STANDARD_SIZE_CHART: SizeChartEntry[] = [
  { size: "S", chestMin: 82, chestMax: 90, shoulderWidth: 37, garmentLength: 59 },
  { size: "M", chestMin: 90, chestMax: 98, shoulderWidth: 39, garmentLength: 61 },
  { size: "L", chestMin: 98, chestMax: 106, shoulderWidth: 41, garmentLength: 63 },
  { size: "XL", chestMin: 106, chestMax: 116, shoulderWidth: 44, garmentLength: 65 },
];

export const KILLA_SIZE_CHART: SizeChartEntry[] = [
  { size: "S", chestMin: 84, chestMax: 90, shoulderWidth: 43, garmentLength: 58 },
  { size: "M", chestMin: 90, chestMax: 96, shoulderWidth: 45, garmentLength: 60 },
  { size: "L", chestMin: 96, chestMax: 104, shoulderWidth: 47, garmentLength: 64 },
];

export const DEFAULT_GARMENTS: Garment[] = [
  {
    id: 1,
    slug: "chaqueta-killa-marfil",
    name: "Chaqueta Killa Marfil",
    category: "Chaquetas cortas",
    description:
      "Chaqueta abierta de textura suave con paneles geométricos multicolor en hombros y puños.",
    material: "Paño artesanal de tacto suave",
    color: "Marfil natural",
    imageUrl: "/images/products/chaqueta-killa-reference.png",
    imageKey: null,
    imageFocus: "center",
    overlayColor: "#d8cbb5",
    overlayAccent: "#a54428",
    featured: true,
    sizes: ["S", "M", "L"],
    sizeChart: KILLA_SIZE_CHART,
  },
  {
    id: 2,
    slug: "abrigo-inti-camel",
    name: "Abrigo Inti Camel",
    category: "Abrigos",
    description:
      "Abrigo camel de línea recta con solapas textiles y acentos geométricos en bolsillos y puños.",
    material: "Paño estructurado",
    color: "Camel andino",
    imageUrl: "/images/products/collection-reference.png",
    imageKey: null,
    imageFocus: "left",
    overlayColor: "#ad7645",
    overlayAccent: "#315e67",
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    sizeChart: STANDARD_SIZE_CHART.map((entry) => ({
      ...entry,
      garmentLength: entry.garmentLength + 18,
    })),
  },
  {
    id: 3,
    slug: "blazer-sisay-camel",
    name: "Blazer Sisay Camel",
    category: "Blazers",
    description:
      "Blazer camel de solapa clásica con bordado floral azul y detalles delicados en mangas.",
    material: "Paño liviano bordado",
    color: "Camel dorado",
    imageUrl: "/images/products/collection-reference.png",
    imageKey: null,
    imageFocus: "center",
    overlayColor: "#b7844b",
    overlayAccent: "#2b8790",
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    sizeChart: STANDARD_SIZE_CHART.map((entry) => ({
      ...entry,
      garmentLength: entry.garmentLength + 13,
    })),
  },
  {
    id: 4,
    slug: "abrigo-sisa-rosa",
    name: "Abrigo Sisa Rosa",
    category: "Abrigos bordados",
    description:
      "Abrigo rosa empolvado de silueta larga, realzado con bordados florales vivos en frente y mangas.",
    material: "Paño suave bordado",
    color: "Rosa empolvado",
    imageUrl: "/images/products/collection-reference.png",
    imageKey: null,
    imageFocus: "right",
    overlayColor: "#d6a5a6",
    overlayAccent: "#b72e58",
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    sizeChart: STANDARD_SIZE_CHART.map((entry) => ({
      ...entry,
      garmentLength: entry.garmentLength + 20,
    })),
  },
];
