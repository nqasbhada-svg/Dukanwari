cat << 'INNER_EOF' > src/utils/pdfGenerator.ts
import html2pdf from 'html2pdf.js';

interface Html2PdfOptions {
  margin: number | number[];
  filename: string;
  image: { type: 'jpeg' | 'png' | 'webp'; quality: number };
  html2canvas: { scale: number; useCORS: boolean; letterRendering: boolean; windowWidth?: number };
  jsPDF: { unit: string; format: string | number[]; orientation: 'portrait' | 'landscape' };
}

function withOklchPatch<T>(fn: () => Promise<T>): Promise<T> {
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (el, pseudoElt) {
    const style = originalGetComputedStyle(el, pseudoElt);
    return new Proxy(style, {
      get(target, prop) {
        const val = target[prop as keyof CSSStyleDeclaration];
        if (typeof val === 'string' && val.includes('oklch')) {
          const propName = prop.toString().toLowerCase();
          if (propName.includes('background')) {
             return 'rgb(248, 250, 252)'; // slate-50
          }
          if (propName.includes('color')) {
             return 'rgb(15, 23, 42)'; // slate-900
          }
          if (propName.includes('border')) {
             return 'rgb(226, 232, 240)'; // slate-200
          }
          return 'rgb(248, 250, 252)';
        }
        if (typeof val === 'function') {
          return (val as Function).bind(target);
        }
        return val;
      }
    });
  };

  return fn().finally(() => {
    window.getComputedStyle = originalGetComputedStyle;
  });
}

function prepareElementForPdf(element: HTMLElement) {
  const originalStyles = element.getAttribute('style') || '';
  const originalClasses = element.className;
  
  // Basic resets for printing
  element.style.borderRadius = '0px';
  element.style.boxShadow = 'none';
  // Give it a solid white background so it doesn't become transparent
  element.style.backgroundColor = '#ffffff';
  
  return { originalStyles, originalClasses };
}

function restoreElementAfterPdf(element: HTMLElement, originalStyles: string, originalClasses: string) {
  element.setAttribute('style', originalStyles);
  element.className = originalClasses;
}

export async function downloadElementAsPDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  return withOklchPatch(async () => {
    try {
      const { originalStyles, originalClasses } = prepareElementForPdf(element);

      const opt: Html2PdfOptions = {
        margin: [10, 10, 10, 10], // top, left, bottom, right margins in mm
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true }, // higher scale for crisp text
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (elementId === 'public-invoice-thermal' || elementId.includes('thermal-receipt')) {
        opt.jsPDF = { unit: 'mm', format: [80, 200], orientation: 'portrait' };
        opt.margin = 5;
      }

      await html2pdf().set(opt as any).from(element).save();
      
      restoreElementAfterPdf(element, originalStyles, originalClasses);
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
      const { originalStyles, originalClasses } = prepareElementForPdf(element);

      const opt: Html2PdfOptions = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      if (elementId === 'public-invoice-thermal' || elementId.includes('thermal-receipt')) {
        opt.jsPDF = { unit: 'mm', format: [80, 200], orientation: 'portrait' };
        opt.margin = 5;
      }

      const pdfBlob = await html2pdf().set(opt as any).from(element).outputPdf('blob');
      
      restoreElementAfterPdf(element, originalStyles, originalClasses);

      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: title || 'Invoice',
          text: text || 'Here is your invoice.',
          files: [file]
        });
        return true;
      } else {
        await html2pdf().set(opt as any).from(element).save();
        return false;
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      return false;
    }
  });
}
INNER_EOF
