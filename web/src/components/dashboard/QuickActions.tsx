import { motion } from 'framer-motion';
import { AlertCircle, XCircle, Clock, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardStats } from '../../types';

interface Props {
  stats: DashboardStats | null;
}

export function QuickActions({ stats }: Props) {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Clock,
      label: 'Token即将过期',
      color: '#F59E0B',
      path: '/accounts',
      count: stats?.expiringTokens || 0,
    },
    {
      icon: XCircle,
      label: '异常邮箱',
      color: '#EF4444',
      path: '/accounts',
      count: stats?.errorAccounts || 0,
    },
    {
      icon: AlertCircle,
      label: '未使用邮箱',
      color: '#8B5CF6',
      path: '/accounts',
      count: stats?.unusedAccounts || 0,
    },
    {
      icon: Wifi,
      label: '测试代理',
      color: '#22C55E',
      path: '/proxy',
      count: stats?.totalProxies || 0,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="glass-card flex flex-col"
    >
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">快速操作</h2>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.4 + i * 0.06 }}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors group relative"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <action.icon className="h-5 w-5" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>

            {action.count === 0 ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium">正常</span>
              </div>
            ) : (
              <div
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `${action.color}20`,
                  color: action.color
                }}
              >
                {action.count}
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
