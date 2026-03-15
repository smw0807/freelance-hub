import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const user = this.config.get<string>('SMTP_USER');
    if (!user) {
      this.logger.warn('SMTP_USER not set — email notifications disabled');
      return;
    }
    const rawHost = this.config.get<string>('SMTP_HOST') ?? '';
    // SMTP_HOST에 '@'가 포함되거나 비어있으면 smtp.gmail.com으로 강제
    const host =
      !rawHost || rawHost.includes('@') ? 'smtp.gmail.com' : rawHost;
    const port = Number(this.config.get<number>('SMTP_PORT') ?? 587);

    if (rawHost && rawHost.includes('@')) {
      this.logger.warn(
        `SMTP_HOST("${rawHost}")에 @ 문자가 포함되어 있습니다. smtp.gmail.com으로 대체합니다.`,
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user,
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({
        from: `FreelanceHub <${this.config.get('SMTP_USER')}>`,
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
    }
  }

  async sendDeadlineReminder(
    userEmail: string,
    userName: string,
    projectTitle: string,
    projectId: string,
    daysLeft: number,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    await this.send(
      userEmail,
      `[FreelanceHub] 프로젝트 마감 D-${daysLeft} 알림`,
      `<p>${userName}님, <strong>${projectTitle}</strong> 프로젝트 마감까지 <strong>${daysLeft}일</strong> 남았습니다.</p>
       <p><a href="${frontendUrl}/projects/${projectId}">프로젝트 확인하기 →</a></p>`,
    );
  }

  async sendUnpaidReminder(
    userEmail: string,
    userName: string,
    projectTitle: string,
    projectId: string,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    await this.send(
      userEmail,
      `[FreelanceHub] 미수금 알림 — ${projectTitle}`,
      `<p>${userName}님, <strong>${projectTitle}</strong> 프로젝트 잔금이 아직 미수령 상태입니다.</p>
       <p><a href="${frontendUrl}/projects/${projectId}">프로젝트 확인하기 →</a></p>`,
    );
  }

  async sendQuoteViewed(
    userEmail: string,
    userName: string,
    quoteNo: string,
    quoteId: string,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    await this.send(
      userEmail,
      `[FreelanceHub] 견적서 열람 알림 — ${quoteNo}`,
      `<p>${userName}님, <strong>${quoteNo}</strong> 견적서를 클라이언트가 열람했습니다.</p>
       <p><a href="${frontendUrl}/quotes/${quoteId}">견적서 확인하기 →</a></p>`,
    );
  }

  async sendQuoteResponse(
    userEmail: string,
    userName: string,
    quoteNo: string,
    quoteId: string,
    accepted: boolean,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const action = accepted ? '수락' : '거절';
    await this.send(
      userEmail,
      `[FreelanceHub] 견적서 ${action} 알림 — ${quoteNo}`,
      `<p>${userName}님, <strong>${quoteNo}</strong> 견적서가 클라이언트에 의해 <strong>${action}</strong>되었습니다.</p>
       <p><a href="${frontendUrl}/quotes/${quoteId}">견적서 확인하기 →</a></p>`,
    );
  }

  async sendContractSigned(
    userEmail: string,
    userName: string,
    contractNo: string,
    contractId: string,
    signerName: string,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    await this.send(
      userEmail,
      `[FreelanceHub] 계약서 서명 완료 — ${contractNo}`,
      `<p>${userName}님, <strong>${contractNo}</strong> 계약서에 <strong>${signerName}</strong>님이 서명했습니다.</p>
       <p><a href="${frontendUrl}/contracts/${contractId}">계약서 확인하기 →</a></p>`,
    );
  }
}
