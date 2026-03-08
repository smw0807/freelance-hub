import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { ShareQuoteDto } from './dto/share-quote.dto';
import { PdfService } from './pdf/pdf.service';
import { generateQuoteHtml } from './pdf/quote-template';
import { randomBytes } from 'crypto';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  private async generateQuoteNo(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quote.count({
      where: { project: { userId } },
    });
    return `Q-${year}${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(userId: string) {
    return this.prisma.quote.findMany({
      where: { project: { userId } },
      include: { project: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, project: { userId } },
      include: { project: { select: { id: true, title: true, client: true } } },
    });
    if (!quote) throw new NotFoundException('견적서를 찾을 수 없습니다.');
    return quote;
  }

  async create(userId: string, dto: CreateQuoteDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, userId },
    });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const quoteNo = await this.generateQuoteNo(userId);
    const { items, ...rest } = dto;
    return this.prisma.quote.create({
      data: {
        ...rest,
        quoteNo,
        items: items ? (items as any) : [],
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateQuoteDto) {
    await this.findOne(userId, id);
    const { items, ...rest } = dto;
    return this.prisma.quote.update({
      where: { id },
      data: {
        ...rest,
        ...(items !== undefined ? { items: items as any } : {}),
      },
    });
  }

  async share(userId: string, id: string, dto: ShareQuoteDto) {
    await this.findOne(userId, id);
    const shareToken = randomBytes(24).toString('hex');
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    this.logger.log(`Quote shared: id=${id} expiresAt=${expiresAt.toISOString()}`);
    return this.prisma.quote.update({
      where: { id },
      data: { shareToken, expiresAt, status: 'SENT' },
    });
  }

  async getPublicByToken(token: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { shareToken: token },
      include: { project: { select: { title: true, client: true } } },
    });
    if (!quote) {
      this.logger.warn(`Public quote not found: token=${token.slice(0, 8)}...`);
      throw new NotFoundException('견적서를 찾을 수 없습니다.');
    }
    if (quote.expiresAt && quote.expiresAt < new Date()) {
      this.logger.warn(`Public quote expired: id=${quote.id}`);
      await this.prisma.quote.update({
        where: { id: quote.id },
        data: { status: 'EXPIRED' },
      });
      throw new ForbiddenException('견적서가 만료되었습니다.');
    }
    await this.prisma.quote.update({
      where: { id: quote.id },
      data: { viewedAt: new Date() },
    });
    return quote;
  }

  async acceptPublic(token: string) {
    const quote = await this.getPublicByToken(token);
    return this.prisma.quote.update({
      where: { id: quote.id },
      data: { status: 'ACCEPTED' },
    });
  }

  async rejectPublic(token: string) {
    const quote = await this.getPublicByToken(token);
    return this.prisma.quote.update({
      where: { id: quote.id },
      data: { status: 'REJECTED' },
    });
  }

  async generatePdf(userId: string, id: string): Promise<Buffer> {
    this.logger.log(`Generating PDF for quote id=${id}`);
    const start = Date.now();
    const quote = await this.findOne(userId, id);
    const html = generateQuoteHtml(quote as any);
    const buffer = await this.pdfService.generatePdf(html);
    this.logger.log(`PDF generated for quote id=${id} size=${buffer.length}b +${Date.now() - start}ms`);
    return buffer;
  }
}
