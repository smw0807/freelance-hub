import { Quote } from '@prisma/client';

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export function generateQuoteHtml(quote: Quote & { project?: any }): string {
  const items = (quote.items as unknown as QuoteItem[]) || [];
  const rows = items
    .map(
      (item) => `
    <tr>
      <td>${item.description}</td>
      <td style="text-align:right">${item.quantity}</td>
      <td style="text-align:right">${item.unitPrice.toLocaleString()}원</td>
      <td style="text-align:right">${item.amount.toLocaleString()}원</td>
    </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Noto Sans KR', Arial, sans-serif; padding: 40px; color: #333; }
    h1 { font-size: 28px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #e5e7eb; }
    td { padding: 10px; border: 1px solid #e5e7eb; }
    .totals { text-align: right; }
    .totals tr td { border: none; padding: 4px 10px; }
    .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #333 !important; }
    .quote-no { font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>견 적 서</h1>
  <div class="quote-no">견적번호: ${quote.quoteNo}</div>
  <div class="meta">발행일: ${new Date(quote.createdAt).toLocaleDateString('ko-KR')}</div>

  <table>
    <thead>
      <tr>
        <th>항목</th>
        <th style="text-align:right">수량</th>
        <th style="text-align:right">단가</th>
        <th style="text-align:right">금액</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="4" style="text-align:center">항목 없음</td></tr>'}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>공급가액</td><td>${quote.subtotal.toLocaleString()}원</td></tr>
    <tr><td>부가세(10%)</td><td>${quote.vatAmount.toLocaleString()}원</td></tr>
    <tr><td>할인</td><td>-${quote.discountAmount.toLocaleString()}원</td></tr>
    <tr class="total-row"><td>합계</td><td>${quote.totalAmount.toLocaleString()}원</td></tr>
  </table>

  ${quote.memo ? `<p style="color:#666;font-size:13px">메모: ${quote.memo}</p>` : ''}
</body>
</html>`;
}
