import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  BeakerIcon,
  MapIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Geological Maps', href: '/maps', icon: MapIcon },
  { name: '3D Models', href: '/models', icon: CubeIcon },
  { name: 'Geochemical Analysis', href: '/geochemical', icon: BeakerIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-blue-400">GeoVision AI</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">G</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">GeoMiner User</p>
            <p className="text-xs text-gray-400">Premium Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 