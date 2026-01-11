import { useState } from 'react';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // Agar LCP (Largest Contentful Paint) image hai toh true
}

const LazyImage = ({ src, alt, className, priority = false }: LazyImageProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Skeleton Loader - visible only while loading */}
      {imageLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}

      <motion.img
        src={hasError ? '/placeholder.jpg' : src} // Fallback image if error
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoading ? 0 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover ${className}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
};

export default LazyImage;