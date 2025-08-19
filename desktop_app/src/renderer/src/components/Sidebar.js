import React from 'react';
import { Chrome, Play, FileText, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isOpen, currentPath, onNavigate }) => {
  const menuItems = [
    {
      id: 'execution',
      label: 'Chạy Test',
      icon: Play,
      path: '/',
      description: 'Chọn và thực thi kịch bản test'
    },
    {
      id: 'results',
      label: 'Kết quả Test',
      icon: FileText,
      path: '/results',
      description: 'Xem lịch sử và chi tiết kết quả'
    }
  ];

  return (
    <div className={clsx(
      'bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col',
      isOpen ? 'w-72' : 'w-16'
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Chrome className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="ml-3">
              <h2 className="text-white font-bold text-lg">Recorder Manager</h2>
              <p className="text-gray-400 text-xs">Test Automation Tool</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={clsx(
                    'w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group',
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <Icon className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )} />
                  
                  {isOpen && (
                    <>
                      <div className="ml-3 flex-1 text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className={clsx(
                          'text-xs mt-0.5',
                          isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-400'
                        )}>
                          {item.description}
                        </div>
                      </div>
                      
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-blue-200" />
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer info */}
      {isOpen && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Chrome Recorder Manager</div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;