import React from "react";

type Props = {
  imageSrc: string;
  alt: string;
  /** Bold heading shown on the photo */
  title?: string;
  /** Small line under the title */
  blurb?: string;
  /** Optional pill in the corner, e.g. "Since 1995" */
  chip?: string;
  className?: string;
  /** If you want a fixed size (otherwise it fills its container) */
  width?: number;
  height?: number;
};

const CampusShowcaseCard: React.FC<Props> = ({
  imageSrc,
  alt,
  title = "Sree Sai",
  blurb,
  chip,
  className = "",
  width,
  height,
}) => {
  const boxStyle =
    width && height ? ({ width, height } as React.CSSProperties) : undefined;

  return (
    <div
      className={[
        "group relative",
        // gradient frame
        "rounded-3xl p-1 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-emerald-500/20",
        "ring-1 ring-black/5 shadow-[0_12px_48px_-12px_rgba(2,6,23,0.25)]",
        className,
      ].join(" ")}
      style={boxStyle}
    >
      {/* decorative backplates for depth */}
      <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-tr from-blue-100 via-white to-emerald-100 rotate-[-2.5deg] blur-[1px]" />
      <div className="pointer-events-none absolute -inset-6 -z-20 rounded-[2.5rem] bg-gradient-to-tr from-indigo-100 via-white to-blue-100 rotate-2 blur-[2px]" />

      {/* photo surface */}
      <figure
        className={[
          "relative rounded-[1.4rem] overflow-hidden bg-white",
          // subtle tilt + lift
          "transition-transform duration-500 group-hover:-rotate-[0.7deg] group-hover:scale-[1.01]",
        ].join(" ")}
      >
        {/* badge */}
        {chip && (
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs text-blue-700 shadow-sm backdrop-blur">
            {chip}
          </span>
        )}

        {/* image */}
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        {/* bottom gradient + caption */}
        <figcaption
          className={[
            "pointer-events-none absolute inset-x-0 bottom-0",
            "p-5 sm:p-6",
            "bg-gradient-to-t from-black/55 via-black/35 to-transparent",
            "text-white",
            // reveal a touch more on hover
            "transition-all duration-500 translate-y-0 group-hover:translate-y-0",
          ].join(" ")}
        >
          <div className="max-w-[85%]">
            <div className="text-xl sm:text-2xl font-bold drop-shadow">{title}</div>
            {blurb && (
              <p className="mt-1 text-sm sm:text-[15px] leading-snug text-white/90">
                {blurb}
              </p>
            )}
          </div>
        </figcaption>
      </figure>
    </div>
  );
};

export default CampusShowcaseCard;
