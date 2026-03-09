export const CONTRACT_STATUS_ITEMS = [
  { label: '초안', value: 'DRAFT' },
  { label: '발송됨', value: 'SENT' },
  { label: '서명됨', value: 'SIGNED' },
  { label: '완료', value: 'COMPLETED' },
  { label: '취소', value: 'CANCELLED' },
] as const;

export const CONTRACT_TYPE_ITEMS = [
  { label: '개발', value: 'DEVELOPMENT' },
  { label: '디자인', value: 'DESIGN' },
  { label: '유지보수', value: 'MAINTENANCE' },
] as const;

export const contractStatusLabel: Record<string, string> = {
  DRAFT: '초안',
  SENT: '발송됨',
  SIGNED: '서명됨',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export const contractStatusColor: Record<string, string> = {
  DRAFT: 'neutral',
  SENT: 'info',
  SIGNED: 'success',
  COMPLETED: 'primary',
  CANCELLED: 'error',
};

export const contractTypeLabel: Record<string, string> = {
  DEVELOPMENT: '개발',
  DESIGN: '디자인',
  MAINTENANCE: '유지보수',
};
