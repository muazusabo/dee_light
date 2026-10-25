'use client';
import { ButtonLink, PageHeading } from '@/components/ui';
import { useAuth } from '@/features/auth-provider';
export default function Account() {
  const { user } = useAuth();
  return (<><PageHeading title={`Hello, ${user?.name.split(' ')[0] ?? ''}`} description={user?.email} /><div className="flex flex-wrap gap-3"><ButtonLink href="/account/orders">My orders</ButtonLink><ButtonLink href="/account/profile" variant="secondary">Edit profile</ButtonLink><ButtonLink href="/search" variant="secondary">Keep shopping</ButtonLink></div></>);
}
