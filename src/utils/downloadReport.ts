// src/utils/downloadReport.ts

interface DownloadReportParams {
    results: string;
    prefix: string;
}

export function downloadReportTxt({ results, prefix }: DownloadReportParams): void {
  if (!results) return;

  // Czyścimy tekst z linii przerywanych i poziomych:
  // /={3,}/g wykrywa 3 lub więcej znaków "=" pod rząd
  // /-{3,}/g wykrywa 3 lub więcej znaków "-" pod rząd
  const cleanedResults = results
      .replace(/={3,}/g, '')
      .replace(/-{3,}/g, '');

    // Create a file blob with the plain text terminal content
    const blob = new Blob([cleanedResults], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Determine the file name dynamically based on the construct name prefix
    const filePrefix = prefix.trim() === '' ? 'Oligo' : prefix.trim();
    const fileName = `${filePrefix}_primerize.txt`;

    // Create a temporary hidden anchor element to trigger the browser download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // Append, trigger click, and cleanly purge from DOM
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
