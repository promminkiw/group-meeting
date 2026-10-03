export type Pagination = {
  page: number;
  pageSize: number;
  totalPages: number;
  offset: number;
  limit: number;
};

export function paginate(total: number, page: number, pageSize: number): Pagination {
  const safeTotal = Math.max(0, Math.floor(total));
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize));
  const clamped = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  return {
    page: clamped,
    pageSize,
    totalPages,
    offset: (clamped - 1) * pageSize,
    limit: pageSize,
  };
}
