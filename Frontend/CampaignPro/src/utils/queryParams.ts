export function toQueryParams(params: Record<string, unknown>): URLSearchParams {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => usp.append(key, String(item)));
    } else {
      usp.append(key, String(value));
    }
  });
  return usp;
}
