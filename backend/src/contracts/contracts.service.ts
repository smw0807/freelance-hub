import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ShareContractDto } from './dto/share-contract.dto';
import { PdfService } from '../quotes/pdf/pdf.service';
import { generateContractHtml } from './pdf/contract-template';
import { randomBytes } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/email.service';
import { KakaoAlimtalkService } from '../notifications/kakao.service';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private notifService: NotificationsService,
    private emailService: EmailService,
    private kakaoService: KakaoAlimtalkService,
  ) {}

  private async generateContractNo(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.contract.count({ where: { userId } });
    return `C-${year}${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(userId: string) {
    return this.prisma.contract.findMany({
      where: { userId },
      include: { project: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, userId },
      include: { project: { select: { id: true, title: true, client: true } } },
    });
    if (!contract) throw new NotFoundException('계약서를 찾을 수 없습니다.');
    return contract;
  }

  async create(userId: string, dto: CreateContractDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, userId },
    });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const contractNo = await this.generateContractNo(userId);
    return this.prisma.contract.create({
      data: {
        userId,
        contractNo,
        projectId: dto.projectId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        totalAmount: dto.totalAmount ?? 0,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        memo: dto.memo,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateContractDto) {
    await this.findOne(userId, id);
    return this.prisma.contract.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.contract.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async share(userId: string, id: string, dto: ShareContractDto) {
    await this.findOne(userId, id);
    const shareToken = randomBytes(24).toString('hex');
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    this.logger.log(`Contract shared: id=${id} expiresAt=${expiresAt.toISOString()}`);
    return this.prisma.contract.update({
      where: { id },
      data: { shareToken, expiresAt, status: 'SENT' },
    });
  }

  async getPublicByToken(token: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { shareToken: token },
      include: {
        project: { select: { title: true, client: true } },
        user: true,
      },
    });
    if (!contract) {
      this.logger.warn(`Public contract not found: token=${token.slice(0, 8)}...`);
      throw new NotFoundException('계약서를 찾을 수 없습니다.');
    }
    if (contract.expiresAt && contract.expiresAt < new Date()) {
      this.logger.warn(`Public contract expired: id=${contract.id}`);
      throw new ForbiddenException('계약서가 만료되었습니다.');
    }
    await this.prisma.contract.update({
      where: { id: contract.id },
      data: { viewedAt: new Date() },
    });
    return contract;
  }

  async signPublic(token: string, signerName: string) {
    const contract = await this.getPublicByToken(token);
    if (contract.status === 'SIGNED' || contract.status === 'COMPLETED') {
      throw new ForbiddenException('이미 서명된 계약서입니다.');
    }
    const updated = await this.prisma.contract.update({
      where: { id: contract.id },
      data: { signerName, signedAt: new Date(), status: 'SIGNED' },
    });
    const owner = (contract as any).user;
    await this.notifService.create(
      contract.userId,
      'CONTRACT_SIGNED',
      '계약서 서명 완료',
      `"${contract.contractNo}" 계약서에 ${signerName}님이 서명했습니다.`,
      `/contracts/${contract.id}`,
    );
    await this.emailService.sendContractSigned(
      owner.email,
      owner.name,
      contract.contractNo,
      contract.id,
      signerName,
    );
    if (owner.phone) {
      await this.kakaoService.sendContractSigned(owner.phone, contract.contractNo, signerName);
    }
    return updated;
  }

  async generatePdf(userId: string, id: string): Promise<Buffer> {
    this.logger.log(`Generating PDF for contract id=${id}`);
    const start = Date.now();
    const contract = await this.findOne(userId, id);
    const html = generateContractHtml(contract as any);
    const buffer = await this.pdfService.generatePdf(html);
    this.logger.log(`PDF generated for contract id=${id} size=${buffer.length}b +${Date.now() - start}ms`);
    return buffer;
  }
}
