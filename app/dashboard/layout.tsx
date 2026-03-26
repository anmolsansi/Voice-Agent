import { StaffShell } from '@/components/staff-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell>{children}</StaffShell>;
}
