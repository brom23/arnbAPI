export const getPagination = (query: any) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
};