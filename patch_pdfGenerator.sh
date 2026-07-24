#!/bin/bash
cat << 'INNER_EOF' >> src/utils/pdfGenerator.ts

export async function shareElementAsPDF(elementId: string, filename: string, title?: string, text?: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`shareElementAsPDF: Element with ID "${elementId}" not found.`);
    return false;
  }
  let html2pdf = (window as any).html2pdf;
  if (!html2pdf) {
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          html2pdf = (window as any).html2pdf;
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load html2pdf.js'));
        document.head.appendChild(script);
      });
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  if (!html2pdf) return false;

  try {
    const originalStyles = element.getAttribute('style') || '';
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#0f172a';
    element.style.borderRadius = '0px';
    element.style.boxShadow = 'none';

    const opt: Html2PdfOptions = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (elementId.includes('thermal') || elementId.includes('modal') || element.offsetWidth < 400) {
      opt.jsPDF = { unit: 'mm', format: [80, 200], orientation: 'portrait' };
      opt.margin = 5;
    }

    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
    element.setAttribute('style', originalStyles);

    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: title || 'Invoice',
        text: text || 'Here is your invoice.',
        files: [file]
      });
      return true;
    } else {
      // Fallback: download
      return await downloadElementAsPDF(elementId, filename);
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    return false;
  }
}
INNER_EOF
