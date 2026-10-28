export const dailyTips: string[] = [
  "Guarda las frutas y verduras por separado: algunas liberan etileno y aceleran el madurado.",
  "Congela lo que no vas a usar en 2-3 días. ¡Se salva y se aprovecha después!",
  "El plátano muy maduro es perfecto para hacer pan o batidos.",
  "Guarda las hojas verdes con una toalla seca para que duren más.",
  "Aprovecha las sobras: conviértelas en un rico calentado.",
  "Los huevos duran más en la nevera, no en la puerta.",
  "El pan se puede congelar en rebanadas y tostar directo.",
  "Las hierbas aromáticas duran más en agua, como si fueran flores.",
  "Revisa tu nevera una vez por semana con una 'cacería de vencimientos'.",
  "El caldo casero congela genial en cubetas de hielo.",
  "Los restos de verduras sirven para un caldo rico y rápido.",
  "Compra con lista y revisa lo que ya tienes antes de ir al mercado.",
  "El tomate sabe mejor fuera de la nevera, guárdalo a temperatura ambiente.",
  "Las papas y cebollas prefieren un lugar oscuro, fresco y ventilado, lejos una de otra.",
  "Aprovecha primero lo que vence pronto: ponlo a la vista.",
];

export function getTipForToday(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return dailyTips[dayOfYear % dailyTips.length];
}
