// ── Enum Types ──────────────────────────────────────────────────────────────

export type UserPlan = 'FREE' | 'PRO';

export type Platform =
  | 'KMONG'
  | 'SOOMGO'
  | 'ELANCER'
  | 'WANTEDGIGS'
  | 'DIRECT'
  | 'OTHER';

export type ProjectStatus =
  | 'INQUIRY'
  | 'NEGOTIATING'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type QuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type IncomeType = 'DEPOSIT' | 'BALANCE' | 'FULL' | 'EXTRA';

export type ContractStatus = 'DRAFT' | 'SENT' | 'SIGNED' | 'COMPLETED' | 'CANCELLED';
export type ContractType = 'DEVELOPMENT' | 'DESIGN' | 'MAINTENANCE';

// ── Model Interfaces ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  plan: UserPlan;
  planExpiredAt?: string;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  platform: Platform;
  businessNo?: string;
  isBlacklisted: boolean;
  rating?: number;
  memo?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  projectId: string;
  title: string;
  isDone: boolean;
  order: number;
  createdAt: string;
}

export interface TimeLog {
  id: string;
  projectId: string;
  description?: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  clientId?: string;
  title: string;
  status: ProjectStatus;
  contractAmount: number;
  depositAmount: number;
  depositPaidAt?: string;
  balanceAmount: number;
  balancePaidAt?: string;
  includeVat: boolean;
  platform: Platform;
  platformFeeRate: number;
  startedAt?: string;
  deadlineAt?: string;
  deliveredAt?: string;
  tags: string[];
  memo?: string;
  createdAt: string;
  client?: Pick<Client, 'id' | 'name'>;
  checklistItems: ChecklistItem[];
  timeLogs: TimeLog[];
}

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Quote {
  id: string;
  projectId: string;
  quoteNo: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  totalAmount: number;
  shareToken?: string;
  expiresAt?: string;
  viewedAt?: string;
  memo?: string;
  createdAt: string;
  project?: Pick<Project, 'id' | 'title'>;
}

export interface Contract {
  id: string;
  userId: string;
  projectId: string;
  contractNo: string;
  type: ContractType;
  status: ContractStatus;
  title: string;
  content: string;
  totalAmount: number;
  startDate?: string;
  endDate?: string;
  shareToken?: string;
  expiresAt?: string;
  viewedAt?: string;
  signedAt?: string;
  signerName?: string;
  memo?: string;
  createdAt: string;
  project?: Pick<Project, 'id' | 'title'>;
}

export interface Income {
  id: string;
  projectId: string;
  userId: string;
  incomeType: IncomeType;
  amount: number;
  isWithholdingTax: boolean;
  netAmount: number;
  paidAt: string;
  memo?: string;
  createdAt: string;
  project?: Pick<Project, 'id' | 'title'>;
}

// ── API Response Types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface ClientStats {
  totalProjects: number;
  completedProjects: number;
  totalRevenue: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
}

export interface PlatformBreakdown {
  platform: string;
  label: string;
  total: number;
}

export interface DashboardData {
  summary: {
    thisMonthRevenue: number;
    prevMonthRevenue: number;
    thisYearRevenue: number;
    unpaidTotal: number;
  };
  upcomingDeadlines: Array<
    Pick<Project, 'id' | 'title' | 'deadlineAt'> & {
      client?: Pick<Client, 'name'>;
    }
  >;
  unpaidProjects: Array<
    Pick<Project, 'id' | 'title' | 'balanceAmount'> & {
      client?: Pick<Client, 'name'>;
    }
  >;
  monthlyTrend: MonthlyTrend[];
}

export interface IncomeSummary {
  thisMonth: number;
  thisYear: number;
  monthlyBreakdown: { month: number; total: number }[];
  platformBreakdown: PlatformBreakdown[];
}

export interface TaxReport {
  year: number;
  totalRevenue: number;
  withholdingTaxTotal: number;
  estimatedIncomeTax: number;
}
