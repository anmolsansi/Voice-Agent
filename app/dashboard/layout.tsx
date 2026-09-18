import { getStaffUser } from '@/lib/staff-auth';
import { redirect } from 'next/navigation';
import { StaffShell } from '@/components/staff-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getStaffUser();
  if (!user) redirect('/staff/login');
  if (user.mustChangePassword) redirect('/staff/password');
  return <StaffShell>{children}</StaffShell>;
}
