import React, { useEffect, useState } from "react";
import { getFallbackImage, makeResponsiveVariants } from "@/lib/imageUtils";

// cache manifest fetch across instances
let manifestPromise: Promise<Set<string>> | null = null;
function loadOptimizedManifest(): Promise<Set<string>> {
  if (!manifestPromise) {
    manifestPromise = fetch('/optimized/manifest.json')
      .then((r) => {
        if (!r.ok) return new Set<string>();
        return r.json();
      })
      .then((json) => new Set(Array.isArray(json?.bases) ? json.bases : []))
      .catch(() => new Set<string>());
  }
  return manifestPromise;
}
const placeholderData = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23efebe9'/%3E%3C/svg%3E";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  debug?: boolean;
  fallbackQuery?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  srcSet,
  sizes,
  className,
  width,
  height,
  debug,
  fallbackQuery,
  ...rest
}) => {
  // avoid passing internal-only props (like `debug` and `fallbackQuery`) to the native <img>
  const imgRest = rest as any;
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);
  // currentSrc holds the actual `src` used on the <img> element so we can switch
  // between the original, an Unsplash fallback, and the placeholder without
  // continuously rebuilding values in render.
  const [currentSrc, setCurrentSrc] = useState<string>(src ? String(src) : placeholderData);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [candidates, setCandidates] = useState<string[]>([]);

  // module-level failure tracking to avoid retry storms and noisy logs
  // keyed by the original src (or the fallback query for unsplash attempts)
  // and to disable unsplash for queries that repeatedly fail.
  const failureCounts = (OptimizedImage as any)._failureCounts ||= new Map<string, number>();
  const unsplashDisabled = (OptimizedImage as any)._unsplashDisabled ||= new Set<string>();

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setTriedFallback(false);
    setCandidateIndex(0);
    // build candidate source list to handle backend-hosted relative URLs in dev
    const base = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.NEXT_PUBLIC_API_URL || '';
    const originalSrc = src ? String(src) : '';
    const candidateList: string[] = [];
    if (originalSrc) {
      candidateList.push(originalSrc);
      // If original is absolute, add a sanitized variant (strip query/hash) to improve manifest matching and retries
      try {
        const u = new URL(originalSrc, typeof window !== 'undefined' ? window.location.href : undefined);
        const sanitized = `${u.origin}${u.pathname}`;
        if (sanitized !== originalSrc) candidateList.push(sanitized);
      } catch (e) {
        // not a valid absolute URL, ignore
      }
      if (originalSrc.startsWith('/')) {
        if (base) {
          candidateList.push(`${base.replace(/\/$/, '')}${originalSrc}`);
        }
        try {
          const loc = typeof window !== 'undefined' ? window.location : null;
          if (loc) {
            // try same origin absolute path
            candidateList.push(`${loc.protocol}//${loc.host}${originalSrc}`);
            // common dev backend port fallback
            if (!loc.port || loc.port !== '8000') {
              candidateList.push(`${loc.protocol}//${loc.hostname}:8000${originalSrc}`);
            }
            // also try base-prefixed absolute form if env base is present
            if (base && !originalSrc.startsWith(base)) {
              candidateList.push(`${base.replace(/\/$/, '')}${originalSrc}`);
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
    // always ensure at least a placeholder candidate
    if (candidateList.length === 0) candidateList.push(placeholderData);
    setCandidates(candidateList);
    setCurrentSrc(candidateList[0] || placeholderData);

    if (!src) {
      setLoaded(true);
      return;
    }

    let mounted = true;
    const img = new Image();
    if (srcSet) img.srcset = srcSet;
    const original = String(src);
    img.src = candidates && candidates.length ? candidates[candidateIndex] || original : original;
    img.decoding = "async" as const;
    img.onload = () => setLoaded(true);
    img.onerror = () => {
      const key = img.src || original;
      const prev = failureCounts.get(key) || 0;
      failureCounts.set(key, prev + 1);
      if (debug) console.warn("OptimizedImage failed to load (preload):", key);
      else console.debug && console.debug("OptimizedImage failed to load (preload):", key);
      // Try next candidate source (if any) before marking errored
      if (candidates && candidateIndex + 1 < candidates.length) {
        const nextIndex = candidateIndex + 1;
        setCandidateIndex(nextIndex);
        const next = candidates[nextIndex];
        if (next) {
          // trigger a new preload attempt
          const img2 = new Image();
          if (srcSet) img2.srcset = srcSet;
          img2.src = next;
          img2.decoding = "async" as const;
          img2.onload = () => {
            if (!mounted) return;
            setLoaded(true);
            setCurrentSrc(next);
          };
          img2.onerror = () => {
            // allow onError on <img> to handle further fallbacks
            setErrored(true);
          };
          return;
        }
      }
      setErrored(true);
      // Let onError on the <img> drive visual state and fallback selection.
    };
    return () => {
      mounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, srcSet]);

  // final source is driven by `currentSrc` state which we update on errors/fallbacks
  let finalSrc = currentSrc || placeholderData;

  // build responsive variants for picture element only if we know optimized files exist
  const [variants, setVariants] = useState<{ avif: string; webp: string; jpg: string } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setVariants(null);
      return;
    }
    const url = String(src);
    const name = url.split('/').pop() || url;
    let base = name.replace(/\.[^.]+$/, '');
    // strip Vite-style hash suffix if present (e.g. name-ABC123xy)
    const hashStrip = base.replace(/-[A-Za-z0-9]{6,}$/, '');
    if (hashStrip !== base) base = hashStrip;
    loadOptimizedManifest().then((set) => {
      if (cancelled) return;
      if (set.has(base)) {
        const v = makeResponsiveVariants(String(src));
        setVariants(v);
        if (process.env.NODE_ENV !== 'production') console.debug('[OptimizedImage] using optimized variants for', base, v);
      } else {
        setVariants(null);
        if (process.env.NODE_ENV !== 'production') console.debug('[OptimizedImage] no optimized variants for', base);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className={`relative w-full h-full ${className || ""}`}>
      <div
        className="absolute inset-0 bg-muted/60 flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: loaded ? 0 : 1 }}
        aria-hidden
      >
        <div className="w-full h-full bg-gradient-to-b from-muted/60 to-muted animate-pulse" />
      </div>

      <picture>
        {variants && variants.avif && (
          <source type="image/avif" srcSet={variants.avif} sizes={sizes} />
        )}
        {variants && variants.webp && (
          <source type="image/webp" srcSet={variants.webp} sizes={sizes} />
        )}
        <img
          src={finalSrc}
          srcSet={variants ? variants.jpg : srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            const original = src ? String(src) : finalSrc;
            if (!triedFallback) {
              setTriedFallback(true);
              const q = fallbackQuery || (alt ? alt.split(" ").slice(0, 3).join(",") : "resort,nature");
              // avoid trying Unsplash for queries that were disabled or have failed repeatedly
              const failCount = failureCounts.get(original) || 0;
              if (!unsplashDisabled.has(q) && failCount < 2) {
                const unsplash = `https://source.unsplash.com/1600x900/?${encodeURIComponent(String(q))}`;
                if (debug) console.warn("OptimizedImage attempting Unsplash fallback for:", q, unsplash);
                else console.debug && console.debug("OptimizedImage attempting Unsplash fallback for:", q);
                setCurrentSrc(unsplash);
                // do not mark errored yet; wait for unsplash attempt
                return;
              } else {
                unsplashDisabled.add(q);
              }
            }

            if (debug) console.warn("OptimizedImage onError event for:", finalSrc);
            else console.debug && console.debug("OptimizedImage onError event for:", finalSrc);

            // final fallback to placeholder
            setCurrentSrc(placeholderData);
            setErrored(true);
            setLoaded(true);
          }}
          {...imgRest}
          className={`w-full h-full object-cover block transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </picture>

      {/* Debug overlay when requested via prop (large, visible) */}
      {debug && (
        <div
          data-debug
          className="absolute left-2 top-2 bg-black/80 text-white text-xs p-2 rounded shadow-lg z-50 max-w-[280px]"
          style={{ fontSize: 11 }}
        >
          <div className="font-medium mb-1">{alt}</div>
          <div className="truncate">src: <span className="font-mono">{finalSrc}</span></div>
          <div className="truncate">variants: <span className="font-mono">{variants ? 'yes' : 'no'}</span></div>
          <div className="mt-1">status: <strong>{errored ? 'errored' : loaded ? 'loaded' : 'pending'}</strong></div>
          {variants && (
            <div className="mt-1 text-xxs break-words">avif: {variants.avif}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
