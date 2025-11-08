import { Injectable } from '@angular/core';
// pdfjs-dist is loaded dynamically to avoid increasing the initial bundle size


@Injectable({
  providedIn: 'root'
})
export class PdfExtractorService {

  constructor() { }

  /**
   * Extrait tout le texte d'un fichier PDF
   * @param file Fichier PDF uploadé
   * @returns Promise<string> Texte extrait
   */
  async extractTextFromPdf(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Import pdfjs-dist dynamically to avoid bundling it in the initial chunk
      const pdfjsLib: any = await import('pdfjs-dist');
      // Ensure worker is set (use CDN fallback)
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('Erreur extraction PDF:', error);
      throw new Error('Impossible d\'extraire le texte du PDF');
    }
  }
}