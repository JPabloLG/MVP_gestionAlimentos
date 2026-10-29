function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const demoPhotos = {
  manzanas: svgToDataUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#FDEDE7'/><circle cx='50' cy='58' r='32' fill='#EF6B4A'/><path d='M50 26c-4 0-8 4-8 10' stroke='#3FA878' stroke-width='6' fill='none' stroke-linecap='round'/><ellipse cx='38' cy='42' rx='10' ry='6' fill='#ffffff' opacity='0.35'/></svg>`
  ),
  leche: svgToDataUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#EAF2FA'/><path d='M35 20h30l5 15v45a5 5 0 0 1-5 5H35a5 5 0 0 1-5-5V35z' fill='#7C9FBF'/><path d='M35 20l5-8h20l5 8z' fill='#5E86AD'/><rect x='32' y='50' width='36' height='18' fill='#ffffff'/></svg>`
  ),
  aguacate: svgToDataUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#EFF7EC'/><ellipse cx='50' cy='55' rx='26' ry='34' fill='#5B8A3A'/><ellipse cx='50' cy='58' rx='17' ry='23' fill='#D9E9A3'/><circle cx='50' cy='58' r='9' fill='#7A4B2E'/></svg>`
  ),
};
