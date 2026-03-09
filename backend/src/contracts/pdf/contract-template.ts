import { Contract } from '@prisma/client';

export function generateContractHtml(
  contract: Contract & { project?: any },
): string {
  const startDate = contract.startDate
    ? new Date(contract.startDate).toLocaleDateString('ko-KR')
    : '-';
  const endDate = contract.endDate
    ? new Date(contract.endDate).toLocaleDateString('ko-KR')
    : '-';

  const contentHtml = (contract.content || '')
    .split('\n')
    .map((line) => (line.trim() ? `<p>${line}</p>` : '<br>'))
    .join('');

  const signatureBlock = contract.signerName
    ? `
  <div class="signature-section">
    <h3>서명</h3>
    <table>
      <tr>
        <th>서명자</th>
        <td>${contract.signerName}</td>
      </tr>
      <tr>
        <th>서명일시</th>
        <td>${contract.signedAt ? new Date(contract.signedAt).toLocaleString('ko-KR') : '-'}</td>
      </tr>
    </table>
  </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Noto Sans KR', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
    h1 { font-size: 28px; text-align: center; margin-bottom: 4px; }
    .contract-no { text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 24px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .meta-table th { background: #f3f4f6; padding: 8px 12px; text-align: left; border: 1px solid #e5e7eb; width: 120px; }
    .meta-table td { padding: 8px 12px; border: 1px solid #e5e7eb; }
    .content-section { margin-bottom: 24px; }
    .content-section h2 { font-size: 16px; border-bottom: 2px solid #333; padding-bottom: 4px; margin-bottom: 12px; }
    .content-section p { margin: 4px 0; }
    .signature-section { margin-top: 40px; }
    .signature-section h3 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f3f4f6; padding: 8px 12px; text-align: left; border: 1px solid #e5e7eb; width: 120px; }
    td { padding: 8px 12px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <h1>용 역 계 약 서</h1>
  <div class="contract-no">계약번호: ${contract.contractNo}</div>

  <table class="meta-table">
    <tr>
      <th>계약 제목</th>
      <td>${contract.title}</td>
    </tr>
    <tr>
      <th>프로젝트</th>
      <td>${contract.project?.title ?? '-'}</td>
    </tr>
    <tr>
      <th>계약 금액</th>
      <td>${contract.totalAmount.toLocaleString()}원</td>
    </tr>
    <tr>
      <th>계약 기간</th>
      <td>${startDate} ~ ${endDate}</td>
    </tr>
    <tr>
      <th>작성일</th>
      <td>${new Date(contract.createdAt).toLocaleDateString('ko-KR')}</td>
    </tr>
  </table>

  <div class="content-section">
    <h2>계약 조항</h2>
    ${contentHtml}
  </div>

  ${contract.memo ? `<p style="color:#666;font-size:13px;border-top:1px solid #eee;padding-top:12px">메모: ${contract.memo}</p>` : ''}

  ${signatureBlock}
</body>
</html>`;
}
