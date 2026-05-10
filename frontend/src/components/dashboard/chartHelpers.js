export const CHART_ITEM_LIMIT = 8;

export function truncateLabel(label, maxLength = 22) {
  const text = String(label || "");

  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

export function topChartRows(rows, valueKey, limit = CHART_ITEM_LIMIT) {
  return [...rows]
    .sort((first, second) => Number(second[valueKey] || 0) - Number(first[valueKey] || 0))
    .slice(0, limit);
}

export function chartHeightForRows(rows, { min = 280, max = 350, single = 220, rowHeight = 42 } = {}) {
  if (rows.length <= 1) {
    return single;
  }

  return Math.min(max, Math.max(min, rows.length * rowHeight));
}
