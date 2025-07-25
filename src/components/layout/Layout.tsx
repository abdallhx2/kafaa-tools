import { ReactNode } from 'react';
import { Analytics } from "@vercel/analytics/react"
interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout = ({ children, className = '' }: LayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-background ${className}`} dir="rtl">
      <Analytics />
      <div className="container mx-auto px-4 ">
        {children}
      </div>
    </div>
  );
};

export default Layout;
