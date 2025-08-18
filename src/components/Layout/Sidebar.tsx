import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Monitor, 
  FileCode, 
  Tag, 
  BarChart3, 
  Settings,
  PlayCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Screens', href: '/screens', icon: Monitor },
    { name: 'Test Scripts', href: '/test-scripts', icon: FileCode },
    { name: 'Tags', href: '/tags', icon: Tag },
    { name: 'Test Results', href: '/results', icon: BarChart3 },
  ];

  return (
    <div className={`bg-slate-900 text-white transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-20'
    } min-h-screen fixed left-0 top-0 z-30`}>
      <div className="flex items-center justify-center h-16 bg-slate-800">
        <PlayCircle className="w-8 h-8 text-blue-400" />
        {isOpen && <span className="ml-3 text-xl font-bold">Test Automation</span>}
      </div>
      
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;