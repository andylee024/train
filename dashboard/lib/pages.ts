/** Concatenate limit/offset pages until a short page arrives. */
export async function readAllPages<T>(
  fetchPage: (offset: number, limit: number) => Promise<T[]>,
  limit = 1000,
): Promise<T[]> {
  if (limit < 1) throw new Error("Page size must be at least 1.");
  const rows: T[] = [];
  for (let offset = 0; ; offset += limit) {
    const page = await fetchPage(offset, limit);
    if (!Array.isArray(page)) throw new Error("Expected a page of rows.");
    rows.push(...page);
    if (page.length < limit) break;
  }
  return rows;
}
