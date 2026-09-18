import { redirect } from 'next/navigation';
import { getStaffUser } from '@/lib/staff-auth';
import { StaffPasswordForm } from '@/components/staff-password-form';
export default async function PasswordPage() {
  if (!(await getStaffUser())) redirect('/staff/login');
  return <main className="mx-auto max-w-md space-y-6 p-8 text-white"><h1 className="text-2xl">Change your password</h1><StaffPasswordForm /></main>;
}
