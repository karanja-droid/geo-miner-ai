import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import {
  ChartBarIcon,
  MapIcon,
  CubeIcon,
  BeakerIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const stats = [
    { name: 'Active Projects', value: '12', change: '+2', changeType: 'positive' },
    { name: 'Completed Analyses', value: '89', change: '+12', changeType: 'positive' },
    { name: 'AI Models Trained', value: '7', change: '+1', changeType: 'positive' },
    { name: 'Data Points', value: '2.4M', change: '+180K', changeType: 'positive' },
  ];

  const recentProjects = [
    { id: 1, name: 'Copper Mine Analysis', status: 'In Progress', progress: 75 },
    { id: 2, name: 'Gold Deposit Mapping', status: 'Completed', progress: 100 },
    { id: 3, name: 'Lithium Exploration', status: 'Planning', progress: 25 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your geological projects.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.name}</div>
                <div className={`text-xs mt-2 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Quick Actions" subtitle="Start a new analysis or project">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <MapIcon className="w-6 h-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">New Map</div>
                  <div className="text-sm text-gray-600">Create geological map</div>
                </div>
              </button>
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BeakerIcon className="w-6 h-6 text-green-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Geochemical</div>
                  <div className="text-sm text-gray-600">Analyze samples</div>
                </div>
              </button>
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <CubeIcon className="w-6 h-6 text-purple-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">3D Model</div>
                  <div className="text-sm text-gray-600">Build 3D visualization</div>
                </div>
              </button>
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ChartBarIcon className="w-6 h-6 text-orange-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">AI Analysis</div>
                  <div className="text-sm text-gray-600">Run AI predictions</div>
                </div>
              </button>
            </div>
          </Card>

          <Card title="Recent Projects" subtitle="Your latest geological projects">
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.status}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card title="Recent Activity" subtitle="Latest updates from your projects">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">AI model training completed for Copper Mine Analysis</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">New geological data uploaded to Gold Deposit Mapping</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Lithium Exploration project planning phase started</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard; 