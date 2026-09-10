/**
 * Shared pagination helpers used by every list endpoint in the API.
 *
 * Query params accepted on any paginated route:
 *   ?page=1        (1-indexed, default 1)
 *   ?pageSize=20   (default depends on the route, see call sites; capped at maxPageSize)
 *
 * getPagination() normalizes those into a safe { page, pageSize, limit, offset }
 * object. buildPaginatedResult() then wraps the rows + a COUNT(*) total into the
 * consistent envelope the frontend expects:
 *
 *   { data: [...], pagination: { page, pageSize, total, totalPages, hasNextPage, hasPrevPage } }
 */
export function getPagination(req, { defaultPageSize = 20, maxPageSize = 200 } = {}) {
  let page = parseInt(req.query.page, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  let pageSize = parseInt(req.query.pageSize, 10);
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = defaultPageSize;
  pageSize = Math.min(pageSize, maxPageSize);

  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  return { page, pageSize, limit, offset };
}

export function buildPaginatedResult(rows, total, { page, pageSize }) {
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Runs a COUNT(*) query built from the same WHERE clause/params as the main
 * list query, so callers don't have to hand-write a parallel count query.
 * `countSql` should be the full `SELECT COUNT(*) ... FROM ... WHERE ...` string
 * (without ORDER BY/LIMIT/OFFSET).
 */
export async function countRows(query, countSql, params) {
  const { rows } = await query(countSql, params);
  return Number(rows[0]?.count ?? 0);
}
