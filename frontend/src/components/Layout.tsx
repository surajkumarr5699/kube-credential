import { Link, useLocation } from 'react-router-dom';
import { FileCheck, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Kube Credential
              </span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/issuance"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/issuance')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileCheck className="h-5 w-5 mr-2" />
                Issue Credential
              </Link>
              <Link
                to="/verify"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/verify')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                Verify Credential
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
