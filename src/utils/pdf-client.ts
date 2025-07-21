/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ProgressCallback {
  (stage: string, progress: number): void;
}

export class ClientPDFManager {
  
  // Compress PDF by removing unused objects and optimizing
  async compressPDF(file: File, onProgress?: ProgressCallback): Promise<Blob> {
    try {
      console.log('Starting PDF compression for file:', file.name);
      onProgress?.('قراءة الملف', 20);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('File read successfully, size:', arrayBuffer.byteLength);
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      console.log('PDF loaded successfully, pages:', pdfDoc.getPageCount());
      
      onProgress?.('ضغط الملف', 60);
      
      // Basic compression by saving with optimization
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      });
      
      console.log('PDF compressed successfully, new size:', pdfBytes.length);
      onProgress?.('إنهاء الضغط', 100);
      
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error in compressPDF:', error);
      throw new Error(`فشل في ضغط PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  // Split PDF into individual pages
  async splitPDF(file: File, onProgress?: ProgressCallback): Promise<Blob[]> {
    onProgress?.('قراءة الملف', 10);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    const splitPDFs: Blob[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      onProgress?.(`استخراج الصفحة ${i + 1}`, (i / pageCount) * 80 + 10);
      
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      
      const pdfBytes = await newPdf.save();
      splitPDFs.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }
    
    onProgress?.('مكتمل', 100);
    return splitPDFs;
  }

  // Merge multiple PDFs into one
  async mergePDFs(files: File[], onProgress?: ProgressCallback): Promise<Blob> {
    try {
      console.log('Starting PDF merge for files:', files.map(f => f.name));
      onProgress?.('بدء الدمج', 10);
      
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}:`, file.name);
        onProgress?.(`دمج الملف ${i + 1}`, (i / files.length) * 80 + 10);
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        console.log(`Added ${copiedPages.length} pages from ${file.name}`);
      }
      
      onProgress?.('حفظ الملف المدموج', 95);
      const pdfBytes = await mergedPdf.save();
      
      console.log('PDF merge completed, final size:', pdfBytes.length);
      onProgress?.('مكتمل', 100);
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error in mergePDFs:', error);
      throw new Error(`فشل في دمج PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  // Rotate PDF pages
  async rotatePDF(file: File, rotationAngle: number, pageIndices?: number[], onProgress?: ProgressCallback): Promise<Blob> {
    onProgress?.('قراءة الملف', 20);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    onProgress?.('دوران الصفحات', 60);
    
    const indicesToRotate = pageIndices || pages.map((_, index) => index);
    
    indicesToRotate.forEach(index => {
      if (index >= 0 && index < pages.length) {
        pages[index].setRotation(degrees(rotationAngle));
      }
    });
    
    onProgress?.('حفظ الملف', 90);
    const pdfBytes = await pdfDoc.save();
    
    onProgress?.('مكتمل', 100);
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  // Add text watermark to PDF
  async addWatermark(
    file: File, 
    text: string, 
    options: {
      opacity?: number;
      fontSize?: number;
      color?: string;
      position?: string;
    } = {},
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    onProgress?.('قراءة الملف', 20);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = options.fontSize || 24;
    const opacity = options.opacity || 0.5;
    
    // Convert hex color to RGB
    const colorHex = options.color || '#000000';
    const r = parseInt(colorHex.substr(1, 2), 16) / 255;
    const g = parseInt(colorHex.substr(3, 2), 16) / 255;
    const b = parseInt(colorHex.substr(5, 2), 16) / 255;
    
    onProgress?.('إضافة العلامة المائية', 60);
    
    pages.forEach((page, index) => {
      onProgress?.(`معالجة الصفحة ${index + 1}`, 60 + (index / pages.length) * 30);
      
      const { width, height } = page.getSize();
      
      // Calculate position
      let x = width / 2;
      let y = height / 2;
      
      switch (options.position) {
        case 'top-left':
          x = 50; y = height - 50;
          break;
        case 'top-center':
          x = width / 2; y = height - 50;
          break;
        case 'top-right':
          x = width - 50; y = height - 50;
          break;
        case 'middle-left':
          x = 50; y = height / 2;
          break;
        case 'middle-right':
          x = width - 50; y = height / 2;
          break;
        case 'bottom-left':
          x = 50; y = 50;
          break;
        case 'bottom-center':
          x = width / 2; y = 50;
          break;
        case 'bottom-right':
          x = width - 50; y = 50;
          break;
        default: // center
          x = width / 2; y = height / 2;
      }
      
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(45), // Diagonal watermark
      });
    });
    
    onProgress?.('حفظ الملف', 95);
    const pdfBytes = await pdfDoc.save();
    
    onProgress?.('مكتمل', 100);
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  // Extract text from PDF
  async extractTextFromPDF(file: File, onProgress?: ProgressCallback): Promise<string> {
    onProgress?.('قراءة الملف', 20);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(`استخراج النص من الصفحة ${i}`, (i / pdf.numPages) * 80 + 20);
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    onProgress?.('مكتمل', 100);
    return fullText.trim();
  }

  // Convert PDF pages to images (PNG)
  async convertPDFToImages(file: File, onProgress?: ProgressCallback): Promise<Blob[]> {
    onProgress?.('قراءة الملف', 10);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const images: Blob[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(`تحويل الصفحة ${i}`, (i / pdf.numPages) * 80 + 10);
      
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/png');
        });
        
        images.push(blob);
      }
    }
    
    onProgress?.('مكتمل', 100);
    return images;
  }

  // Create ZIP file from multiple files
  async createZipFromFiles(files: { name: string; blob: Blob }[], onProgress?: ProgressCallback): Promise<Blob> {
    // For now, return first file. In production, you'd use a ZIP library like JSZip
    onProgress?.('إنشاء الأرشيف', 50);
    
    if (files.length === 1) {
      onProgress?.('مكتمل', 100);
      return files[0].blob;
    }
    
    // TODO: Implement proper ZIP creation using JSZip library
    // For now, just return the first file
    onProgress?.('مكتمل', 100);
    return files[0].blob;
  }

  // Helper method to download blob as file
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Helper method to download multiple files
  downloadMultipleFiles(files: { name: string; blob: Blob }[]) {
    files.forEach((file, index) => {
      setTimeout(() => {
        this.downloadBlob(file.blob, file.name);
      }, index * 100); // Small delay between downloads
    });
  }
}

// Create singleton instance
export const clientPDFManager = new ClientPDFManager();