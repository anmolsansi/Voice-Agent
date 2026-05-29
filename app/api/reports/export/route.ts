import { NextRequest, NextResponse } from 'next/server';
import {
  buildVoiceReport,
  exportVoiceReportCsv,
} from '@/src/services/reports/reporting-service.mjs';
import {
  STAFF_ACCESS_COOKIE,
  STAFF_ACCESS_HEADER,
  isAuthorizedStaffToken,
} from '@/lib/staff-auth';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const token =
    request.cookies.get(STAFF_ACCESS_COOKIE)?.value ||
    request.headers.get(STAFF_ACCESS_HEADER);

  if (!isAuthorizedStaffToken(token)) {
    return NextResponse.json(
      { message: 'Staff authentication required.' },
      { status: 401 },
    );
  }

  const params = request.nextUrl.searchParams;
  const report = buildVoiceReport({
    range: params.get('range') || undefined,
    program: params.get('program') || undefined,
    owner: params.get('owner') || undefined,
    status: params.get('status') || undefined,
    requestedBy: params.get('requestedBy') || 'staff-dashboard',
  });
  const csv = exportVoiceReportCsv(report);
  const generatedDate = report.metadata.generatedAt.slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="voice-report-${generatedDate}.csv"`,
      'Cache-Control': 'no-store',
      'X-Report-Schema-Version': report.metadata.schemaVersion,
      'X-Report-Row-Count': String(report.metadata.rowCount),
    },
  });
}
