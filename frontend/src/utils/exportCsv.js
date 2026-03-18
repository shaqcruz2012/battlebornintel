/**
 * Download an array of objects as a CSV file.
 * @param {Array<Object>} data - Row data
 * @param {Array<{label: string, accessor: function}>} columns - Column definitions
 * @param {string} filename - Output filename (should end with .csv)
 */
export function downloadCsv(data, columns, filename) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = c.accessor(row);
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
