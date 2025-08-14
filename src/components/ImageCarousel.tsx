// src/components/ImageCarousel.tsx
import React, { useEffect, useRef, useState } from 'react';

type Slide = { src: string; alt?: string };

interface Props {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number; // ms
  className?: string; // give height from parent, e.g. "h-[78vh]"
  showArrows?: boolean;
  showDots?: boolean;
}

const clamp = (n: number, len: number) => ((n % len) + len) % len;

const ImageCarousel: React.FC<Props> = ({
  slides,
  autoPlay = true,
  interval = 5000,
  className = '',
  showArrows = false,
  showDots = true,
}) => {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);
  const hoverRef = useRef(false);
  const touchStartX = useRef<number | null>(null);

  const next = () => setIndex(i => clamp(i + 1, slides.length));
  const prev = () => setIndex(i => clamp(i - 1, slides.length));

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    timer.current = window.setInterval(() => { if (!hoverRef.current) next(); }, interval);
    return () => { if (timer.current) window.clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, autoPlay, slides.length]);

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = e => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = e => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
    touchStartX.current = null;
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={i} className="relative min-w-full h-full">
            <img src={s.src} alt={s.alt || `slide-${i}`} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {showArrows && slides.length > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 text-white px-3 py-2"
          >‹</button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 text-white px-3 py-2"
          >›</button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
export { ImageCarousel };
