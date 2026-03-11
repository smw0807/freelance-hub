import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter }).$extends({
    query: {
      // Automatically exclude soft-deleted clients from all read queries
      client: {
        findMany({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        findFirst({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        count({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private readonly _db: ExtendedPrismaClient;

  constructor(configService: ConfigService) {
    this._db = createPrismaClient(configService.get<string>('DATABASE_URL')!);
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this._db.$connect();
    this.logger.log('Database connected');
  }

  get user() {
    return this._db.user;
  }
  get client() {
    return this._db.client;
  }
  get project() {
    return this._db.project;
  }
  get checklistItem() {
    return this._db.checklistItem;
  }
  get quote() {
    return this._db.quote;
  }
  get income() {
    return this._db.income;
  }
  get timeLog() {
    return this._db.timeLog;
  }
  get contract() {
    return this._db.contract;
  }
}
