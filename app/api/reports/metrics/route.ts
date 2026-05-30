import { NextRequest, NextResponse } from 'next/server';
import {
  buildVoiceReport,
  normalizeReportFilters,
} from '@/src/services/reports/reporting-service.mjs';
import {
  STAFF_ACCESS_COOKIE,
  STAFF_ACCESS_HEADER,
  isAuthorizedStaffToken,
} from '@/lib/staff-auth';

export const dynamic = 'force-dynamic';

const validRanges = new Set(['7d', '30d', 'all']);

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

  const filters = normalizeReportFilters({
    range,
    program: params.get('program') || undefined,
    owner: params.get('owner') || undefined,
    status: params.get('status') || undefined,
    risk: params.get('risk') || undefined,
    timeZone: params.get('timeZone') || undefined,
    requestedBy: params.get('requestedBy') || 'staff-dashboard',
  });
  const report = buildVoiceReport(filters);

  return NextResponse.json(report, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Report-Schema-Version': report.metadata.schemaVersion,
      'X-Report-Row-Count': String(report.metadata.rowCount),
    },
  });
}
