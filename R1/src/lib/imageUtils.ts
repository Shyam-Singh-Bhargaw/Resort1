export function getFallbackImage(dishName?: string | null): string {
  const name = dishName ? String(dishName).trim() : "satvik";
  const query = encodeURIComponent(`${name},satvik,vegetarian`);
  // Use Unsplash featured endpoint to return a relevant image
  return `https://source.unsplash.com/featured/?${query}`;
}

export function makeResponsiveSrcSet(src: string): string {
  try {
    // If src looks like an internal asset import (contains /assets/), map to public/optimized
    const url = String(src);
    if (url.includes('/assets/') || url.startsWith('src/assets') || url.startsWith('/src/')) {
      // derive base name and strip Vite-style content hash suffix (e.g. name-ABC123xy.jpg)
      const base = url.split('/').pop() || url;
      let name = base.replace(/\.[^.]+$/, '');
      const hashStrip = name.replace(/-[A-Za-z0-9]{6,}$/, '');
      if (hashStrip !== name) name = hashStrip;
      // prefer avif then webp then jpeg
      const parts: string[] = [];
      [400, 800, 1200].forEach((w) => {
        const avif = `/optimized/${name}-${w}.avif`;
        const webp = `/optimized/${name}-${w}.webp`;
        const jpg = `/optimized/${name}-${w}.jpg`;
        // choose available formats in order (we cannot check FS at runtime in browser)
        // but the build script will produce avif/webp; include both so browser picks supported.
        parts.push(`${avif} ${w}w`);
        parts.push(`${webp} ${w}w`);
        parts.push(`${jpg} ${w}w`);
      });
      return parts.join(', ');
    }
  } catch (e) {
    // fallback
  }
  // generic fallback: repeat src
  return `${src} 400w, ${src} 800w, ${src} 1200w`;
}

export function makeResponsiveVariants(src: string) {
  const url = String(src || '');
  const name = url.split('/').pop() || url;
  let base = name.replace(/\.[^.]+$/, '');
  // strip Vite-style hash suffix if present
  const hashStrip = base.replace(/-[A-Za-z0-9]{6,}$/, '');
  if (hashStrip !== base) base = hashStrip;
  const variants: { avif: string; webp: string; jpg: string } = { avif: '', webp: '', jpg: '' };
  const partsAvif: string[] = [];
  const partsWebp: string[] = [];
  const partsJpg: string[] = [];
  [400, 800, 1200].forEach((w) => {
    partsAvif.push(`/optimized/${base}-${w}.avif ${w}w`);
    partsWebp.push(`/optimized/${base}-${w}.webp ${w}w`);
    partsJpg.push(`/optimized/${base}-${w}.jpg ${w}w`);
  });
  variants.avif = partsAvif.join(', ');
  variants.webp = partsWebp.join(', ');
  variants.jpg = partsJpg.join(', ');
  return variants;
}
