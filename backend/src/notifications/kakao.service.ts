import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoAlimtalkService {
  private readonly logger = new Logger(KakaoAlimtalkService.name);
  private sdk: any = null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('COOLSMS_API_KEY');
    if (!apiKey) {
      this.logger.warn('COOLSMS_API_KEY not set — KakaoAlimtalk notifications disabled');
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const coolsms = require('coolsms-node-sdk');
      const CoolSMS = coolsms.default ?? coolsms;
      this.sdk = new CoolSMS(
        apiKey,
        this.config.get<string>('COOLSMS_API_SECRET'),
      );
    } catch (err) {
      this.logger.error(`Failed to init CoolSMS SDK: ${(err as Error).message}`);
    }
  }

  async sendAlimtalk(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ) {
    if (!this.sdk) return;
    const pfId = this.config.get<string>('KAKAO_PFID');
    const from = this.config.get<string>('COOLSMS_FROM');
    try {
      await this.sdk.sendOne({
        to,
        from,
        kakaoOptions: {
          pfId,
          templateId,
          variables,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to send alimtalk to ${to}: ${(err as Error).message}`);
    }
  }

  async sendDeadlineReminder(to: string, projectTitle: string, daysLeft: number) {
    await this.sendAlimtalk(to, 'DEADLINE_REMINDER', {
      projectTitle,
      daysLeft: String(daysLeft),
    });
  }

  async sendUnpaidReminder(to: string, projectTitle: string) {
    await this.sendAlimtalk(to, 'UNPAID_REMINDER', { projectTitle });
  }

  async sendQuoteViewed(to: string, quoteNo: string) {
    await this.sendAlimtalk(to, 'QUOTE_VIEWED', { quoteNo });
  }

  async sendQuoteResponse(to: string, quoteNo: string, accepted: boolean) {
    await this.sendAlimtalk(to, accepted ? 'QUOTE_ACCEPTED' : 'QUOTE_REJECTED', { quoteNo });
  }

  async sendContractSigned(to: string, contractNo: string, signerName: string) {
    await this.sendAlimtalk(to, 'CONTRACT_SIGNED', { contractNo, signerName });
  }
}
