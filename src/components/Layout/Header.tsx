import React from 'react';
import { Menu, Key, LogOut, Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TestAutomationAPI } from '../../utils/api';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { logout, apiKey } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-6">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg">
          <Key className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 font-mono">{apiKey}</span>
          <button
            onClick={copyApiKey}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
            title="Copy API Key"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;