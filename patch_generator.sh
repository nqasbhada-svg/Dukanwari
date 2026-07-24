cat << 'INNER_EOF' > src/utils/pdfGenerator.ts
import html2pdf from 'html2pdf.js';

interface Html2PdfOptions {
  margin: number;
  filename: string;
  image: { type: string; quality: number };
  html2canvas: { scale: number; useCORS: boolean; letterRendering: boolean };
  jsPDF: { unit: string; format: string | number[]; orientation: string };
}

function withOklchPatch<T>(fn: () => Promise<T>): Promise<T> {
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (el, pseudoElt) {
    const style = originalGetComputedStyle(el, pseudoElt);
    return new Proxy(style, {
      get(target, prop) {
        const val = target[prop as any];
        if (typeof val === 'string' && val.includes('oklch')) {
          // crude approximation just to avoid crashing
          // we can just strip it or replace with a safe rgb
          return val.replace(/oklch\([^)]+\)/g, 'rgb(128, 128, 128)');
        }
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      }
    });
  };

  return fn().finally(() => {
    window.getComputedStyle = originalGetComputedStyle;
  });
}

export async function downloadElementAsPDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  return withOklchPatch(async () => {
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

      if (elementId.includes('thermal')) {
        opt.jsPDF = { unit: 'mm', format: [80, 200], orientation: 'portrait' };
        opt.margin = 5;
      }

      await html2pdf().set(opt).from(element).save();
      element.setAttribute('style', originalStyles);
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  });
}

export async function shareElementAsPDF(elementId: string, filename: string, title?: string, text?: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  return withOklchPatch(async () => {
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
      
      if (elementId.includes('thermal')) {
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
        await html2pdf().set(opt).from(element).save();
        return false;
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      return false;
    }
  });
}
INNER_EOF
