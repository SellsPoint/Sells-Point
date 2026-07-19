const normalized = (value) => String(value || "").trim().toLocaleLowerCase();

export function buildLocationSearchUrl({ pathname, currentSearch, query, location }) {
  const onSearch = pathname === "/search";
  const params = onSearch
    ? new URLSearchParams(String(currentSearch || "").replace(/^\?/, ""))
    : new URLSearchParams();
  const existingQuery = params.get("q") || "";
  const typedQuery = String(query || "").trim();
  const hasDistinctActiveQuery = onSearch
    && existingQuery
    && normalized(existingQuery) !== normalized(typedQuery)
    && normalized(existingQuery) !== normalized(location);

  if (!hasDistinctActiveQuery) params.delete("q");
  params.set("loc", location);
  params.delete("page");
  return `/search?${params.toString()}`;
}
