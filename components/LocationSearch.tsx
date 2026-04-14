"use client";

import { useEffect, useRef, useState } from "react";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type Location = { name: string; lat: number; lng: number };

type Props = {
  onSelect: (location: Location | null) => void;
};

const inputClass =
  "w-full border border-edge bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink";

export default function LocationSearch({ onSelect }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<NominatimResult[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        { headers: { "User-Agent": "colour-game/1.0" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(result: NominatimResult) {
    const name = result.display_name;
    setSelected(name);
    setQuery("");
    setResults([]);
    onSelect({ name, lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
  }

  function handleClear() {
    setSelected(null);
    setResults([]);
    onSelect(null);
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between border border-edge px-4 py-3">
        <span className="truncate text-sm text-ink">{selected.split(",")[0]}</span>
        <button
          type="button"
          onClick={handleClear}
          className="ml-3 shrink-0 text-lg text-muted hover:text-ink"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a city or place..."
        className={inputClass}
      />
      {results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 border border-t-0 border-edge bg-cream">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full truncate px-4 py-2 text-left text-sm text-ink hover:bg-edge"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
