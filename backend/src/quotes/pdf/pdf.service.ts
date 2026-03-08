import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePdf(html: string): Promise<Buffer> {
    this.logger.log('Launching Chromium for PDF generation');
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle' });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true,
      });
      this.logger.log('PDF generation complete');
      return Buffer.from(pdf);
    } catch (err) {
      this.logger.error(`PDF generation failed: ${(err as Error).message}`, (err as Error).stack);
      throw err;
    } finally {
      await browser.close();
    }
  }
}
