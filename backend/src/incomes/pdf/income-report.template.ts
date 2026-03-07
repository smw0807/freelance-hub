const INCOME_TYPE_LABEL: Record<string, string> = {
  FULL: '전액',
  DEPOSIT: '선금',
  BALANCE: '잔금',
  EXTRA: '추가',
};

export function generateIncomeReportHtml(data: {
  user: { name: string; email: string } | null;
  year: number;
  taxReport: {
    totalRevenue: number;
    withholdingTaxTotal: number;
    estimatedIncomeTax: number;
  };
  monthlyBreakdown: { month: number; total: number; withheld: number }[];
  incomes: Array<{
    paidAt: Date | string;
    project?: { title: string } | null;
    incomeType: string;
    amount: number;
    isWithholdingTax: boolean;
    netAmount: number;
    memo?: string | null;
  }>;
}): string {
  const { user, year, taxReport, monthlyBreakdown, incomes } = data;
  const fmt = (n: number) => `₩${n.toLocaleString('ko-KR')}`;
  const today = new Date().toLocaleDateString('ko-KR');

  const monthRows = monthlyBreakdown
    .map(
      (m) => `
    <tr>
      <td>${m.month}월</td>
      <td class="num">${fmt(m.total)}</td>
      <td class="num">${m.withheld ? fmt(m.withheld) : '-'}</td>
    </tr>`,
    )
    .join('');

  const incomeRows = incomes
    .map((inc) => {
      const date = new Date(inc.paidAt).toLocaleDateString('ko-KR');
      const withheld = inc.isWithholdingTax
        ? fmt(Math.round(inc.amount * 0.033))
        : '-';
      return `
    <tr>
      <td>${date}</td>
      <td>${inc.project?.title ?? '-'}</td>
      <td>${INCOME_TYPE_LABEL[inc.incomeType] ?? inc.incomeType}</td>
      <td class="num">${fmt(inc.amount)}</td>
      <td class="num">${withheld}</td>
      <td class="num">${fmt(inc.netAmount)}</td>
    </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 12px; color: #1a1a1a; padding: 20px; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .meta { font-size: 11px; color: #666; margin-bottom: 24px; }
  h2 { font-size: 14px; font-weight: 700; margin: 20px 0 8px; border-left: 3px solid #3b82f6; padding-left: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f1f5f9; font-weight: 600; padding: 7px 10px; text-align: left; border: 1px solid #e2e8f0; font-size: 11px; }
  td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 11px; }
  .num { text-align: right; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
  .card-label { font-size: 10px; color: #64748b; margin-bottom: 4px; }
  .card-value { font-size: 16px; font-weight: 700; }
  .highlight { color: #3b82f6; }
  tr:nth-child(even) td { background: #fafafa; }
</style>
</head>
<body>
  <h1>${year}년 수입 연간 리포트</h1>
  <div class="meta">
    ${user?.name ?? ''} · ${user?.email ?? ''} · 생성일: ${today}
  </div>

  <h2>요약</h2>
  <div class="summary-grid">
    <div class="card">
      <div class="card-label">총 수입</div>
      <div class="card-value">${fmt(taxReport.totalRevenue)}</div>
    </div>
    <div class="card">
      <div class="card-label">원천징수 납부액</div>
      <div class="card-value">${fmt(taxReport.withholdingTaxTotal)}</div>
    </div>
    <div class="card">
      <div class="card-label">실수령액</div>
      <div class="card-value highlight">${fmt(taxReport.totalRevenue - taxReport.withholdingTaxTotal)}</div>
    </div>
    <div class="card">
      <div class="card-label">예상 소득세</div>
      <div class="card-value">${fmt(taxReport.estimatedIncomeTax)}</div>
    </div>
  </div>

  <h2>월별 수입</h2>
  <table>
    <thead>
      <tr>
        <th>월</th>
        <th class="num">실수령액</th>
        <th class="num">원천징수</th>
      </tr>
    </thead>
    <tbody>
      ${monthRows}
    </tbody>
  </table>

  <h2>수입 내역</h2>
  <table>
    <thead>
      <tr>
        <th>지급일</th>
        <th>프로젝트</th>
        <th>유형</th>
        <th class="num">금액</th>
        <th class="num">원천징수</th>
        <th class="num">실수령</th>
      </tr>
    </thead>
    <tbody>
      ${incomeRows || '<tr><td colspan="6" style="text-align:center;color:#999">수입 내역이 없습니다.</td></tr>'}
    </tbody>
  </table>
</body>
</html>`;
}
