import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Browser } from 'playwright';

const MAX_CONCURRENT = 2;
const TIMEOUT_MS = 30_000;

@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browser: Browser | null = null;
  private browserLaunchPromise: Promise<Browser> | null = null;
  private activeCount = 0;
  private readonly queue: Array<() => void> = [];

  private getBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) {
      return Promise.resolve(this.browser);
    }
    if (!this.browserLaunchPromise) {
      this.browserLaunchPromise = import('playwright')
        .then(({ chromium }) =>
          chromium.launch({
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
            ],
            timeout: TIMEOUT_MS,
          }),
        )
        .then((browser) => {
          browser.on('disconnected', () => {
            this.browser = null;
            this.browserLaunchPromise = null;
            this.logger.warn('Chromium browser disconnected, will relaunch on next request');
          });
          this.browser = browser;
          return browser;
        })
        .catch((err) => {
          this.browserLaunchPromise = null;
          throw err;
        });
    }
    return this.browserLaunchPromise;
  }

  private acquireSlot(): Promise<void> {
    if (this.activeCount < MAX_CONCURRENT) {
      this.activeCount++;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.queue.push(() => {
        this.activeCount++;
        resolve();
      });
    });
  }

  private releaseSlot(): void {
    this.activeCount--;
    const next = this.queue.shift();
    if (next) next();
  }

  async generatePdf(html: string): Promise<Buffer> {
    await this.acquireSlot();
    this.logger.log(`PDF 생성 시작 (활성: ${this.activeCount}/${MAX_CONCURRENT})`);
    const start = Date.now();
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      try {
        await page.setContent(html, { waitUntil: 'load', timeout: TIMEOUT_MS });
        const pdf = await page.pdf({
          format: 'A4',
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
          printBackground: true,
          timeout: TIMEOUT_MS,
        });
        this.logger.log(`PDF 생성 완료 +${Date.now() - start}ms`);
        return Buffer.from(pdf);
      } finally {
        await page.close().catch(() => {});
      }
    } catch (err) {
      this.logger.error(`PDF 생성 실패: ${(err as Error).message}`, (err as Error).stack);
      throw err;
    } finally {
      this.releaseSlot();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}
