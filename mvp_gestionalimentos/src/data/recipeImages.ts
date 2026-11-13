const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const recipeImages: Record<string, string> = {
  "huevos-pericos": photo("photo-1525351484163-7529414344d8"),
  "arepas-con-queso": photo("photo-1509440159596-0249088772ff"),
  "tortilla-de-papa": photo("photo-1512621776951-a57141f2eefd"),
  "arroz-con-huevo": photo("photo-1512058564366-18510be2db19"),
  "sopa-de-verduras": photo("photo-1547592180-85f173990554"),
  calentado: photo("photo-1512621776951-a57141f2eefd"),
  "batido-de-banano": photo("photo-1505252585461-04db1eb84625"),
  "ensalada-de-frutas": photo("photo-1490474418585-ba9bad8fd0ea"),
  "pasta-con-verduras": photo("photo-1473093295043-cdd812d0e601"),
  "ensalada-de-pollo": photo("photo-1546069901-ba9599a7e63c"),
  "pan-tostado-con-aguacate": photo("photo-1525351484163-7529414344d8"),
  "arroz-con-pollo": photo("photo-1512058564366-18510be2db19"),
  "crema-de-tomate": photo("photo-1547592180-85f173990554"),
  "sudado-de-pollo": photo("photo-1532550907401-a500c9a57435"),
  omelette: photo("photo-1525351484163-7529414344d8"),
  "yogurt-con-frutas": photo("photo-1488477181946-6428a0291777"),
  "tostadas-francesas": photo("photo-1506084868230-bb9d95c24759"),
  mazamorra: photo("photo-1578985545062-69928b1d9587"),
  "caldo-de-costilla": photo("photo-1547592180-85f173990554"),
  "sancocho-de-pollo": photo("photo-1547592180-85f173990554"),
  "frijoles-con-arroz": photo("photo-1512621776951-a57141f2eefd"),
  "aguacate-relleno": photo("photo-1546069901-ba9599a7e63c"),
  "pure-de-papa": photo("photo-1512621776951-a57141f2eefd"),
  "guiso-de-lentejas": photo("photo-1547592180-85f173990554"),
};
