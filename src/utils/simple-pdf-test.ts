import { PDFDocument } from 'pdf-lib';

export class SimplePDFTest {
  async compressPDF(file: File): Promise<Blob> {
    try {
      console.log('1. Starting compression test');
      
      // Read file
      console.log('2. Reading file buffer');
      const arrayBuffer = await file.arrayBuffer();
      console.log('3. Buffer size:', arrayBuffer.byteLength);
      
      // Load PDF
      console.log('4. Loading PDF document');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      console.log('5. PDF loaded, pages:', pdfDoc.getPageCount());
      
      // Save (compress)
      console.log('6. Saving PDF');
      const pdfBytes = await pdfDoc.save();
      console.log('7. PDF saved, new size:', pdfBytes.length);
      
      // Create blob
      console.log('8. Creating blob');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      console.log('9. Blob created, size:', blob.size);
      console.log('10. Compression test completed successfully');
      
      return blob;
    } catch (error) {
      console.error('Error in compressPDF:', error);
      throw error;
    }
  }

  async mergePDFs(files: File[]): Promise<Blob> {
    try {
      console.log('1. Starting merge test with files:', files.length);
      
      const mergedPdf = await PDFDocument.create();
      console.log('2. Created new PDF document');
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`3.${i+1}. Processing file:`, file.name);
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach(page => mergedPdf.addPage(page));
        console.log(`4.${i+1}. Added ${pages.length} pages from ${file.name}`);
      }
      
      console.log('5. Saving merged PDF');
      const pdfBytes = await mergedPdf.save();
      console.log('6. Merge complete, size:', pdfBytes.length);
      console.log('7. Merge test completed successfully');
      
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error in mergePDFs:', error);
      throw error;
    }
  }
}

export const simplePDFTest = new SimplePDFTest();