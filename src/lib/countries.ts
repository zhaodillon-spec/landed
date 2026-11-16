export function countryMatches(
  country: { name: string; code: string; region?: string; aliases?: string[] },
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [country.name, country.code, country.region ?? "", ...(country.aliases ?? [])]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}
