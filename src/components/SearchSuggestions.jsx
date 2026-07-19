"use client";

export default function SearchSuggestions({ id, suggestions, activeIndex, onSelect }) {
  if (!suggestions.length) return null;
  return (
    <div id={id} role="listbox" className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-neutral md:left-40">
      {suggestions.map((suggestion, index) => (
        <button
          id={`${id}-option-${index}`}
          key={`${suggestion.type}-${suggestion.value}`}
          type="button"
          role="option"
          aria-selected={activeIndex === index}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(suggestion)}
          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm text-ink-700 ${activeIndex === index ? "bg-brand-50" : "hover:bg-ink-50"}`}
        >
          <span className="truncate">{suggestion.label}</span>
          <span className="ml-3 text-xs capitalize text-ink-400">{suggestion.type}</span>
        </button>
      ))}
    </div>
  );
}
