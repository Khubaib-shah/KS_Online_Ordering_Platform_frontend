import { useState, useEffect, useMemo } from 'react';import { Button } from '@/components/ui/Button';

import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Cpu,
  Database,
  Network,
  RefreshCw,
  Terminal,
  Play,
  Pause,
  Trash2,
  Globe,
  Search
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';;
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { DataTable } from '@/components/data-table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { StatCard } from '@/components/dashboard/StatCard';
import { SimplePageHeader } from '@/components/dashboard/SimplePageHeader';
import { BaseCard } from '@components/ui/BaseCard';
import { Input } from '@components/ui/Input';


interface LogItem {
  id: string;
  timestamp: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

const REGIONS = [
  { id: 'asia-east', name: 'Asia East (Taiwan)', latency: '42ms', load: 38, status: 'nominal', ip: '104.199.124.9' },
  { id: 'us-central', name: 'US Central (Iowa)', latency: '98ms', load: 52, status: 'nominal', ip: '35.206.112.5' },
  { id: 'europe-west', name: 'Europe West (Frankfurt)', latency: '124ms', load: 45, status: 'nominal', ip: '34.89.200.1' },
];

const INITIAL_MICROSERVICES = [
  { id: 'srv-auth', name: 'Authentication & Session API', path: '/api/v1/auth', status: 'online', ping: '12ms', cpu: '1.4%', memory: '240MB' },
  { id: 'srv-order', name: 'Real-time Ordering Pipeline', path: '/api/v1/orders', status: 'online', ping: '18ms', cpu: '5.2%', memory: '512MB' },
  { id: 'srv-catalog', name: 'Menu & Multi-Tenant Catalog', path: '/api/v1/catalog', status: 'online', ping: '15ms', cpu: '2.1%', memory: '380MB' },
  { id: 'srv-sms', name: 'Twilio SMS Notification Gateway', path: '/api/v1/notifications', status: 'warning', ping: '185ms', cpu: '0.8%', memory: '128MB' },
  { id: 'srv-db', name: 'Durable Spanner Database Proxy', path: '/db/replica-pool', status: 'online', ping: '5ms', cpu: '12.4%', memory: '1.2GB' },
];

const HISTORICAL_LOAD_DATA = [
  { time: '13:00', 'CPU US': 45, 'CPU Asia': 32, 'CPU Europe': 40 },
  { time: '13:10', 'CPU US': 48, 'CPU Asia': 35, 'CPU Europe': 42 },
  { time: '13:20', 'CPU US': 55, 'CPU Asia': 38, 'CPU Europe': 44 },
  { time: '13:30', 'CPU US': 52, 'CPU Asia': 54, 'CPU Europe': 46 },
  { time: '13:40', 'CPU US': 60, 'CPU Asia': 41, 'CPU Europe': 45 },
  { time: '13:50', 'CPU US': 58, 'CPU Asia': 43, 'CPU Europe': 48 },
  { time: '14:00', 'CPU US': 52, 'CPU Asia': 38, 'CPU Europe': 45 },
];

const LOG_MESSAGES = [
  { service: 'AUTH-API', level: 'INFO', message: 'JWT Access token issued successfully for user-indolj-owner' },
  { service: 'ORDER-PIPE', level: 'INFO', message: 'Order #19385 status changed to DELIVERED in 14.5 minutes' },
  { service: 'DB-PROXY', level: 'INFO', message: 'Read request optimized: 4 indexes cached in local memory block' },
  { service: 'SMS-GW', level: 'WARN', message: 'Twilio API returned 202 accepted with delayed delivery status' },
  { service: 'CATALOG-SRV', level: 'INFO', message: 'Re-compiled static menu schema cache for tenant "mamma-mia"' },
  { service: 'INFRA', level: 'INFO', message: 'Garbage Collection cleared 512MB dormant websocket sockets' },
  { service: 'AUTH-API', level: 'WARN', message: 'Rate limit threshold (100 req/min) approached by tenant IP 182.44.12.9' },
  { service: 'ORDER-PIPE', level: 'ERROR', message: 'Socket connection dropped for tenant "burger-craft" (Auto-reconnected)' },
  { service: 'DB-PROXY', level: 'INFO', message: 'Transaction isolation level Serialized set on tenant session pool' },
];

export function SuperClusterView() {
  const { addToast } = useUIStore();;
  const [services, setServices] = useState(INITIAL_MICROSERVICES);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLogLive, setIsLogLive] = useState(true);
  const [logFilter, setLogFilter] = useState<'all' | 'INFO' | 'WARN' | 'ERROR'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [restartingId, setRestartingId] = useState<string | null>(null);

  // Initialize and simulate logs stream
  useEffect(() => {
    // Generate initial 8 logs
    const initialLogs: LogItem[] = [];
    for (let i = 0; i < 8; i++) {
      const randomMsg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      initialLogs.unshift({
        id: `log-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - (8 - i) * 120000).toLocaleTimeString(),
        ...randomMsg
      } as LogItem);
    }
    setLogs(initialLogs);

    // Set interval for streaming logs
    const interval = setInterval(() => {
      if (!isLogLive) return;

      const randomMsg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      setLogs(prev => {
        const next = [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            ...randomMsg
          } as LogItem,
          ...prev
        ];
        return next.slice(0, 50); // Keep last 50 logs
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isLogLive]);

  const handleRestartService = (id: string, name: string) => {
    setRestartingId(id);
    addToast(`Initiating rolling reboot for ${name}...`, 'info');

    // Set service to offline during reboot
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'warning', ping: 'Rebooting...' } : s));

    setTimeout(() => {
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'online', ping: '11ms', cpu: '0.9%' } : s));
      setRestartingId(null);
      addToast(`Microservice ${name} fully restored & running on production port!`, 'success');

      // Inject restart log
      setLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          service: 'INFRA',
          level: 'INFO',
          message: `Rolling reboot of ${name} completed. Health Check status: 200 OK`
        },
        ...prev
      ]);
    }, 2500);
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: 'System Service',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'path',
      header: 'Internal Address',
      cell: ({ row }) => (
        <span className="font-mono text-slate-500 text-[11px]">{row.original.path}</span>
      )
    },
    {
      accessorKey: 'ping',
      header: 'Response Speed',
      cell: ({ row }) => (
        <span className="font-mono text-slate-700">{row.original.ping}</span>
      )
    },
    {
      accessorKey: 'cpu',
      header: 'Processor Usage',
      cell: ({ row }) => (
        <span className="font-mono text-slate-700">{row.original.cpu}</span>
      )
    },
    {
      accessorKey: 'memory',
      header: 'Memory Used',
      cell: ({ row }) => (
        <span className="font-mono text-slate-700">{row.original.memory}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const srv = row.original;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${srv.status === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'
            }`}>
            {srv.status}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-right pr-2">Action</div>,
      cell: ({ row }) => {
        const srv = row.original;
        return (
          <div className="text-right pr-2">
            <Button variant="custom" size="none"               onClick={() => handleRestartService(srv.id, srv.name)}
              disabled={restartingId !== null}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {restartingId === srv.id ? 'Restarting...' : 'Restart Service'}
            </Button>
          </div>
        );
      }
    }
  ], [restartingId]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesLevel = logFilter === 'all' || log.level === logFilter;
      const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [logs, logFilter, searchTerm]);

  return (
    <div className="space-y-6 w-full px-4 md:px-6 py-2 text-left font-sans animate-fade-in">

      {/* Page Welcome Title replaced with SimplePageHeader */}
      <SimplePageHeader
        title="Server & System Activity"
        description="Live view of server speeds, country-wide connections, system work load, and server action history."
        categoryTag="Core System Settings"
        icon={Activity}
        statusBadge={{
          text: "All server systems running smoothly",
          pulseColor: "bg-emerald-500"
        }}
        actions={
          <Button variant="custom" size="none"             onClick={() => {
              addToast('Refreshing store system memory...', 'info');
              setTimeout(() => addToast('System memory successfully refreshed!', 'success'), 1200);
            }}
            className="flex items-center gap-2 px-4.5 h-10 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
            <span>Refresh System Data</span>
          </Button>
        }
      />

      {/* Cluster Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
        <StatCard
          data={{
            id: 'server-speed',
            title: 'Average Server Speed',
            value: '42.5 ms',
            format: 'number',
            trend: { direction: 'up', percent: 99, label: 'Very Fast' },
            variant: 'white'
          }}
          actionIcon={<Globe size={16} />}
        />

        <StatCard
          data={{
            id: 'active-connections',
            title: 'Active Live Connections',
            value: '847 active',
            format: 'number',
            trend: { direction: 'up', percent: 12, label: 'live connections' },
            variant: 'white'
          }}
          actionIcon={<Network size={16} />}
        />

        <StatCard
          data={{
            id: 'system-bandwidth',
            title: 'System Bandwidth',
            value: '14.8 TB',
            format: 'number',
            trend: { direction: 'up', percent: 100, label: 'Unlimited usage' },
            variant: 'white'
          }}
          actionIcon={<Cpu size={16} />}
        />

        <StatCard
          data={{
            id: 'database-storage',
            title: 'Database Storage',
            value: '1.2 / 10 TB',
            format: 'number',
            trend: { direction: 'down', percent: 12, label: 'storage used' },
            variant: 'white'
          }}
          actionIcon={<Database size={16} />}
        />
      </div>

      {/* Main Grid: Region Health and Metrics Line Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Region load curve line chart */}
        <BaseCard
          title="System Speed & Activity"
          description="Server load and traffic over the last hour."
          className="lg:col-span-2 flex flex-col justify-between"
          contentClassName="mt-4"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_LOAD_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAsia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '10px' }} />
                <Area type="monotone" dataKey="CPU US" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorUS)" />
                <Area type="monotone" dataKey="CPU Asia" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorAsia)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BaseCard>

        {/* Global Latency regional logs */}
        <BaseCard
          title="Server Locations"
          description="Locations of our servers around the world."
          className="flex flex-col justify-between"
          contentClassName="mt-4 space-y-3"
        >
          {REGIONS.map(reg => (
            <div key={reg.id} className="border border-slate-100 p-3.5 rounded-xl bg-slate-50 flex items-center justify-between select-none">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-800 text-xs block">{reg.name}</span>
                <span className="text-[10px] text-slate-400 font-mono block">{reg.ip}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-slate-900 block">{reg.latency}</span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 block mt-0.5">
                  ● {reg.load}% Active
                </span>
              </div>
            </div>
          ))}
        </BaseCard>
      </div>

      {/* Microservices Status Ledger */}
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={services}
          emptyMessage="No active services found."
        />
      </div>

      {/* Live System Logs Telemetry Console */}
      <BaseCard
        title={
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-indigo-600" />
            <span>System Action History Console</span>
          </div>
        }
        description="Live log of background actions happening across your restaurants."
        noPadding
      >
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 select-none">
          {/* Left: Log Controls */}
          <div className="flex items-center gap-2.5">
            <Button variant="custom" size="none"               onClick={() => setIsLogLive(!isLogLive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${isLogLive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
            >
              {isLogLive ? <Pause size={11} className="animate-pulse" /> : <Play size={11} />}
              {isLogLive ? 'LIVE LOGS ON' : 'LOGS STREAM PAUSED'}
            </Button>

            <Button variant="custom" size="none"               onClick={() => {
                setLogs([]);
                addToast('Console cleared.', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 transition-all cursor-pointer"
            >
              <Trash2 size={11} />
              Clear Logs
            </Button>
          </div>

          {/* Right: Filter & Search */}
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-44">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase">
              {(['all', 'INFO', 'WARN', 'ERROR'] as const).map(lvl => (
                <Button variant="custom" size="none"                   key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${logFilter === lvl
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {lvl}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Console Log Area */}
        <div className="bg-slate-950 font-mono text-[11px] text-slate-300 p-5.5 h-64 overflow-y-auto space-y-1.5 scrollbar-thin select-text">
          <AnimatePresence initial={false}>
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-3 leading-relaxed hover:bg-slate-900/40 p-0.5 rounded"
              >
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                <span className={`shrink-0 font-bold ${log.level === 'ERROR' ? 'text-rose-500' :
                  log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                  [{log.level}]
                </span>
                <span className="text-indigo-400 shrink-0 font-bold">[{log.service}]</span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredLogs.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-500 italic">
              No system logs found under this filter.
            </div>
          )}
        </div>
      </BaseCard>

    </div>
  );
}
