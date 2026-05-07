import { useState, useRef, useEffect } from "react";

/**
 * Optimized LazyImage component with blur-up effect
 * Features:
 * - Lazy loading (loads only when visible)
 * - Blur-up placeholder effect
 * - Error handling with fallback
 * - Responsive image support via srcSet
 * - Preload support for critical images
 */
export default function LazyImage({ 
  src, 
  alt = "", 
  fallback = null,
  className = "", 
  objectFit = "cover",
  srcSet = null,
  sizes = null,
  priority = false, // Skip lazy loading for critical images
  onLoad = null,
  onError = null,
  ...props 
}) {
  const [loaded, setLoaded] = useState(priority); // Pre-loaded if priority
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const [blur, setBlur] = useState(true);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // For priority images, load immediately
    if (priority) {
      img.src = src;
      if (srcSet) img.srcSet = srcSet;
      return;
    }

    // Otherwise, use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loaded && !error) {
          img.src = src;
          if (srcSet) img.srcSet = srcSet;
          observer.unobserve(img);
        }
      },
      { 
        threshold: 0.01,
        rootMargin: "50px" // Start loading 50px before visible
      }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [src, srcSet, loaded, error, priority]);

  const handleLoad = () => {
    setLoaded(true);
    setBlur(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  if (error && fallback) {
    return fallback;
  }

  return (
    <img
      ref={imgRef}
      alt={alt}
      sizes={sizes}
      className={`${className} transition-all duration-300 ${blur && !error ? "blur-sm" : "blur-none"}`}
      style={{
        objectFit,
        opacity: loaded ? 1 : 0.7,
      }}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}
