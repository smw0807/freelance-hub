export const STATUS_ITEMS = [
  { label: '문의', value: 'INQUIRY' },
  { label: '협의중', value: 'NEGOTIATING' },
  { label: '진행중', value: 'IN_PROGRESS' },
  { label: '납품', value: 'DELIVERED' },
  { label: '완료', value: 'COMPLETED' },
  { label: '취소', value: 'CANCELLED' },
];

/** 신규 프로젝트 생성 시 선택 가능한 초기 상태 */
export const STATUS_ITEMS_CREATE = STATUS_ITEMS.slice(0, 3);
