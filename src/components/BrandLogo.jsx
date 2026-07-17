export default function BrandLogo({ compact = false, className = "" }) {
  const frameClass = compact
    ? "h-10 w-[150px] sm:h-12 sm:w-[200px]"
    : "h-12 w-[200px] sm:h-14 sm:w-[220px]";
  const imageClass = compact ? "w-[180px] sm:w-[240px]" : "w-[240px] sm:w-[265px]";

  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-lg bg-white ${frameClass} ${className}`}
    >
      <img
        src="/assets/brand/sellspoint-logo.png"
        alt="Sells Point"
        className={`absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 ${imageClass}`}
      />
    </span>
  );
}
