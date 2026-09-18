import { NextRequest, NextResponse } from 'next/server';
import {
  buildVoiceReport,
  exportVoiceReportCsv,
} from '@/src/services/reports/reporting-service.mjs';
import { getStaffUser } from '@/lib/staff-auth';

export const dynamic = 'force-dynamic';

const validRanges = new Set(['7d', '30d', 'all']);

export async function GET(request: NextRequest) {
  const user = await getStaffUser();
  if (!user || user.mustChangePassword) {
    return NextResponse.json(
      { message: 'Staff authentication required.' },
      { status: 401 },
    );
  }

  const params = request.nextUrl.searchParams;
  const range = params.get('range') || '30d';

  if (!validRanges.has(range)) {
    return NextResponse.json(
      {
        message: 'Unsupported reporting range.',
        supportedRanges: Array.from(validRanges),
      },
      { status: 400 },
    );
  }

  const report = buildVoiceReport({
    range,
    program: params.get('program') || undefined,
    owner: params.get('owner') || undefined,
    status: params.get('status') || undefined,
    risk: params.get('risk') || undefined,
    timeZone: params.get('timeZone') || undefined,
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
