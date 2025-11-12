'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from './PageHeader';
import { PageHeaderMobile } from './PageHeaderMobile';
import { ReactNode } from 'react';

interface PageHeaderResponsiveProps {
  title: string | ReactNode;
  subtitle?: string;
  showBusinessSelector?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeaderResponsive(props: PageHeaderResponsiveProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Loading inicial
  if (isMobile === null) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="h-8"></div>
      </div>
    );
  }

  // Renderizar el header apropiado
  return isMobile ? <PageHeaderMobile {...props} /> : <PageHeader {...props} />;
}

