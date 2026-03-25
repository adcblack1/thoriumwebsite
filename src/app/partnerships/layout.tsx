import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Partnerships - Thorium Valley',
    description: 'Reach 50,000+ AI professionals with Thorium Valley newsletter sponsorships.',
};

export default function PartnershipsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
