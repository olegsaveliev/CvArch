import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ApplicationStats, AppStatus } from '../types';

interface DashboardProps {
  stats: ApplicationStats[];
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const total = stats.reduce((acc, curr) => acc + curr.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-ink p-3 shadow-sketch">
          <p className="font-hand font-bold text-lg">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-12 border-b-2 border-ink pb-6 flex items-end justify-between">
        <div>
           <h2 className="font-serif text-6xl text-ink mb-1">My <span className="italic text-gray-600">Stats</span></h2>
           <p className="text-pencil font-hand text-xl ml-2">Progress tracking</p>
        </div>
        <div className="hidden md:block">
           <svg className="w-16 h-16 text-gray-300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
             <path d="M10,90 Q50,10 90,90" strokeDasharray="5,5" />
             <circle cx="10" cy="90" r="3" fill="currentColor" />
             <circle cx="90" cy="90" r="3" fill="currentColor" />
           </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {stats.map((stat, idx) => (
          <div key={stat.status} className="bg-white p-6 border-2 border-ink shadow-sketch relative overflow-hidden group hover:-translate-y-1 transition-transform">
            {/* Sketchy corner mark */}
            <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-ink bg-gray-100"></div>
            
            <div className="relative z-10">
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2 font-sans">{stat.status}</p>
              <h3 className="text-6xl font-hand font-bold text-ink">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        {/* Chart Section - Styled like a drawing on paper */}
        <div className="w-full md:w-2/3 bg-white border-2 border-ink shadow-sketch p-8 h-[450px] relative min-h-[320px] min-w-[300px]">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 bg-paper px-4 border border-gray-300 transform -rotate-1 shadow-sm">
              <span className="font-hand font-bold text-lg">Success Distribution</span>
           </div>
          <ResponsiveContainer width="100%" height="100%" style={{ minHeight: 300, minWidth: 280 }}>
            <PieChart>
              <Pie
                data={stats}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                paddingAngle={5}
                dataKey="count"
                nameKey="status"
                stroke="#1a1a1a"
                strokeWidth={2}
              >
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#1a1a1a' : index === 1 ? '#e5e5e5' : '#ffffff'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="font-hand text-lg text-ink ml-2">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Action List - Styled like a blackboard or dark sketchpad */}
        <div className="w-full md:w-1/3 bg-ink text-white p-8 h-[450px] flex flex-col justify-between border-2 border-ink shadow-sketch">
           <div>
             <h3 className="font-serif text-3xl italic mb-8 border-b border-gray-600 pb-2">Recent Logs</h3>
             <ul className="space-y-6">
                <li className="flex items-center justify-between group cursor-pointer">
                   <span className="text-lg font-hand text-gray-300 group-hover:text-white transition-colors">MacPaw (Senior React)</span>
                   <span className="text-xs bg-white text-ink px-2 py-1 font-bold font-sans">APPLIED</span>
                </li>
                <li className="flex items-center justify-between group cursor-pointer">
                   <span className="text-lg font-hand text-gray-300 group-hover:text-white transition-colors">SoftServe (Node)</span>
                   <span className="text-xs border border-white text-white px-2 py-1 font-sans">VIEWED</span>
                </li>
             </ul>
           </div>
           
           <div className="border-t border-gray-700 pt-6">
             <div className="text-6xl font-hand mb-2">{((stats.find(s => s.status === AppStatus.APPROVED)?.count || 0) / (total || 1) * 100).toFixed(0)}%</div>
             <p className="text-sm uppercase tracking-widest text-gray-500 font-sans">Response Rate</p>
           </div>
        </div>
      </div>
    </div>
  );
};