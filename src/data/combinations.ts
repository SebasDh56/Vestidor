export type AndeanCoatCombination = {
  code: string;
  name: string;
  palette: string;
  baseColor: string;
  accentColor: string;
};

export type CombinationSizeGroup = {
  id: "ninas" | "s" | "m";
  sizeLabel: string;
  audience: string;
  range: string;
  imageUrl: string;
  imageAlt: string;
  combinations: AndeanCoatCombination[];
};

export const COMBINATION_SIZE_GROUPS: CombinationSizeGroup[] = [
  {
    id: "ninas",
    sizeLabel: "Niñas",
    audience: "Línea infantil",
    range: "Combinaciones 01–03",
    imageUrl: "/images/combinations/abrigo-andino-ninas-01-03.webp",
    imageAlt: "Combinaciones 01, 02 y 03 del Abrigo Andino KILLAÉ para niñas",
    combinations: [
      { code: "01", name: "Luz Andina", palette: "Marfil, negro y dorado", baseColor: "#e8dfcf", accentColor: "#8b6322" },
      { code: "02", name: "Sendero Vivo", palette: "Taupe, turquesa y lima", baseColor: "#827568", accentColor: "#35aab8" },
      { code: "03", name: "Cielo de Páramo", palette: "Chocolate, azul y celeste", baseColor: "#40362f", accentColor: "#239fd0" },
    ],
  },
  {
    id: "s",
    sizeLabel: "Talla S",
    audience: "Silueta pequeña",
    range: "Combinaciones 04–06",
    imageUrl: "/images/combinations/abrigo-andino-talla-s-04-06.webp",
    imageAlt: "Combinaciones 04, 05 y 06 del Abrigo Andino KILLAÉ en talla S",
    combinations: [
      { code: "04", name: "Tierra Serena", palette: "Taupe, lavanda y celeste", baseColor: "#75695e", accentColor: "#b6cfd0" },
      { code: "05", name: "Fuego Suave", palette: "Taupe, negro y coral", baseColor: "#7b6f64", accentColor: "#bc5146" },
      { code: "06", name: "Valle Claro", palette: "Gris, verde y terracota", baseColor: "#aaa9a7", accentColor: "#777b35" },
    ],
  },
  {
    id: "m",
    sizeLabel: "Talla M",
    audience: "Silueta media",
    range: "Combinaciones 07–10",
    imageUrl: "/images/combinations/abrigo-andino-talla-m-07-10.webp",
    imageAlt: "Combinaciones 07, 08, 09 y 10 del Abrigo Andino KILLAÉ en talla M",
    combinations: [
      { code: "07", name: "Niebla Dorada", palette: "Gris, negro y dorado", baseColor: "#b7b5ae", accentColor: "#9d7c27" },
      { code: "08", name: "Noche Andina", palette: "Negro y oro viejo", baseColor: "#161616", accentColor: "#a6742f" },
      { code: "09", name: "Luna Roja", palette: "Marfil, rojo y naranja", baseColor: "#ded6ca", accentColor: "#a8372c" },
      { code: "10", name: "Bruma Turquesa", palette: "Gris, turquesa y tierra", baseColor: "#aaa9a6", accentColor: "#247c75" },
    ],
  },
];

export const COMBINATION_COUNT = COMBINATION_SIZE_GROUPS.reduce(
  (total, group) => total + group.combinations.length,
  0,
);
