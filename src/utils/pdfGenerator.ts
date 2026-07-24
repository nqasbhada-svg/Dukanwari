/**
 * Utility to dynamically load html2pdf.js from CDN and export any element as a high-quality PDF.
 */

interface Html2PdfOptions {
  margin: number;
  filename: string;
  image: { type: string; quality: number };
  html2canvas: { scale: number; useCORS: boolean; letterRendering: boolean };
  jsPDF: { unit: string; format: string | number[]; orientation: string };
}

export async function downloadElementAsPDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`downloadElementAsPDF: Element with ID "${elementId}" not found.`);
    return false;
  }

  // Check if html2pdf is already loaded on the window
  let html2pdf = (window as any).html2pdf;

  if (!html2pdf) {
    try {
      console.log('Loading html2pdf.js from CDN...');
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.integrity = 'sha512-GsLlZN/3F2ErC5xWfZUsfRJ3Atb4gZOgGg28hVqE19s3+cahyYi12YqyZUMc8mEgQB8Wq2gORihxd9Kot8gGgA==';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          html2pdf = (window as any).html2pdf;
          resolve();
        };
        script.onerror = (err) => {
          reject(new Error('Failed to load html2pdf.js script'));
        };
        document.head.appendChild(script);
      });
    } catch (err) {
      console.error('Error loading html2pdf.js:', err);
      // Fallback: alert the user and return false
      return false;
    }
  }

  if (!html2pdf) {
    console.error('html2pdf is still undefined after attempting to load.');
    return false;
  }

  try {
    // Styling optimizations for PDF generation
    // Temporarily apply white background and print-ready styling if needed
    const originalStyles = element.getAttribute('style') || '';
    
    // Add temporary styling to make sure the background of the exported PDF is crisp white
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#0f172a'; // text-slate-900
    element.style.borderRadius = '0px';
    element.style.boxShadow = 'none';

    const opt: Html2PdfOptions = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, // High resolution scales
        useCORS: true, 
        letterRendering: true 
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // If it's a thermal receipt, format it appropriately
    if (elementId.includes('thermal') || elementId.includes('modal') || element.offsetWidth < 400) {
      opt.jsPDF = { unit: 'mm', format: [80, 200], orientation: 'portrait' };
      opt.margin = 5;
    }

    await html2pdf().set(opt).from(element).save();

    // Revert temporary styles
    element.setAttribute('style', originalStyles);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

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
      await downloadElementAsPDF(elementId, filename);
      return false; // Return false to indicate native share didn't happen
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    return false;
  }
}
