import type {
  Platform,
  ProjectStatus,
  QuoteStatus,
  IncomeType,
} from '~/types/models';

type BadgeColor =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'secondary';

export const platformLabel: Record<Platform, string> = {
  KMONG: '크몽',
  SOOMGO: '숨고',
  ELANCER: '이랜서',
  WANTEDGIGS: '원티드 긱스',
  DIRECT: '직접 계약',
  OTHER: '기타',
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  INQUIRY: '문의',
  NEGOTIATING: '협의중',
  IN_PROGRESS: '진행중',
  DELIVERED: '납품',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export const projectStatusColor: Record<ProjectStatus, BadgeColor> = {
  INQUIRY: 'info',
  NEGOTIATING: 'warning',
  IN_PROGRESS: 'primary',
  DELIVERED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  DRAFT: '초안',
  SENT: '발송',
  ACCEPTED: '수락',
  REJECTED: '거절',
  EXPIRED: '만료',
};

export const quoteStatusColor: Record<QuoteStatus, BadgeColor> = {
  DRAFT: 'info',
  SENT: 'primary',
  ACCEPTED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
};

export const incomeTypeLabel: Record<IncomeType, string> = {
  FULL: '전액',
  DEPOSIT: '선금',
  BALANCE: '잔금',
  EXTRA: '추가',
};

export const incomeTypeColor: Record<IncomeType, BadgeColor> = {
  FULL: 'primary',
  DEPOSIT: 'info',
  BALANCE: 'success',
  EXTRA: 'neutral',
};
