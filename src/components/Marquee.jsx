export default function Marquee({ items, className = "" }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max gap-8">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold">
            {item}
            <span className="text-brand-400">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
