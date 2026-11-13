import { FoodCategory, FoodItem } from "@/types";

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;

const categoryPhotos: Record<FoodCategory, string> = {
  frutas: unsplash("photo-1490474418585-ba9bad8fd0ea"),
  verduras: unsplash("photo-1546069901-ba9599a7e63c"),
  lacteos: unsplash("photo-1550583724-b2692b85b150"),
  carnes: unsplash("photo-1532550907401-a500c9a57435"),
  granos: unsplash("photo-1512058564366-18510be2db19"),
  panaderia: unsplash("photo-1509440159596-0249088772ff"),
  bebidas: unsplash("photo-1505252585461-04db1eb84625"),
  congelados: unsplash("photo-1512621776951-a57141f2eefd"),
  despensa: unsplash("photo-1512058564366-18510be2db19"),
  otros: unsplash("photo-1546069901-ba9599a7e63c"),
};

const productPhotos: Array<{ terms: string[]; photo: string }> = [
  { terms: ["aguacate", "avocado"], photo: "photo-1523049673857-eb18f1d7b578" },
  { terms: ["banano", "banana", "platano", "plátano"], photo: "photo-1571771894821-ce9b6c11b08e" },
  { terms: ["manzana", "apple"], photo: "photo-1560806887-1e4cd0b6cbd6" },
  { terms: ["tomate", "tomato"], photo: "photo-1546094096-0df4bcaaa337" },
  { terms: ["leche", "milk"], photo: "photo-1550583724-b2692b85b150" },
  { terms: ["huevo", "egg"], photo: "photo-1506976785307-8732e854ad03" },
  { terms: ["pollo", "chicken"], photo: "photo-1532550907401-a500c9a57435" },
  { terms: ["queso", "cheese"], photo: "photo-1486297678162-eb2a19b0a32d" },
  { terms: ["yogurt", "yogur"], photo: "photo-1488477181946-6428a0291777" },
  { terms: ["pan", "bread"], photo: "photo-1509440159596-0249088772ff" },
  { terms: ["arroz", "rice"], photo: "photo-1512058564366-18510be2db19" },
  { terms: ["zanahoria", "carrot"], photo: "photo-1445282768818-728615cc910a" },
  { terms: ["cebolla", "onion"], photo: "photo-1518977676601-b53f82aba655" },
  { terms: ["pasta"], photo: "photo-1473093295043-cdd812d0e601" },
];

export function getFoodImageUrl(food: Pick<FoodItem, "name" | "category">): string {
  const normalizedName = food.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const match = productPhotos.find(({ terms }) => terms.some((term) => normalizedName.includes(term)));
  return match ? unsplash(match.photo) : categoryPhotos[food.category];
}
