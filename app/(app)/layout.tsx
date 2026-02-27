import { headers } from 'next/headers';
import { getAppConfig } from '@/lib/utils';
import type { Metadata } from 'next';

// This dynamically generates the browser tab title and favicon (logo)
export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const config = await getAppConfig(hdrs);

  return {
    title: `${config.companyName} | ${config.pageTitle}`,
    description: config.pageDescription,
    icons: {
      icon: [
        { url: config.favlogo }
      ],
      apple: [
        { url: config.favlogo }
      ],
    },
  };
}

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const hdrs = await headers();
  // We can still fetch these if you want to render the logo inside the actual page header later!
  const { companyName, logo, logoDark } = await getAppConfig(hdrs);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 hidden w-full flex-row justify-between p-6 md:flex"></header>
      {children}
    </>
  );
}