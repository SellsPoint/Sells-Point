export const SEARCH_FILTER_KEYS = [
  "q", "loc", "category", "subcategory", "min", "max", "cond", "since",
  "lat", "lng", "radius",
];

export function getSearchFilterKey(params) {
  return SEARCH_FILTER_KEYS
    .map((key) => `${key}=${params.getAll(key).join(",")}`)
    .join("&");
}

export function isInternalFilterReflection(expectedKey, incomingKey) {
  return Boolean(expectedKey) && expectedKey === incomingKey;
}

export function getSearchFilterStateKey(state) {
  const nearby = state.nearby || {};
  return JSON.stringify({
    category: state.category || "",
    subcategory: state.subcategory || "",
    minPrice: state.minPrice == null ? null : Number(state.minPrice),
    maxPrice: state.maxPrice == null ? null : Number(state.maxPrice),
    conditions: [...(state.conditions || [])].sort(),
    dateFilter: state.dateFilter || "all",
    latitude: nearby.latitude == null ? null : Number(nearby.latitude),
    longitude: nearby.longitude == null ? null : Number(nearby.longitude),
    radiusKm: Number(state.radiusKm || 25),
  });
}
