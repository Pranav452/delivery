'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/partners', label: 'Partners' },
    { href: '/orders', label: 'Orders' },
    { href: '/assignments', label: 'Assignments' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              DeliveryMS
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg transition-all duration-200',
                  'hover:bg-white/20',
                  pathname === link.href
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
