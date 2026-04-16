import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CareerChartProps {
  role: string;
}

// Simulated data generator based on role
const getRoleData = (role: string) => {
  const baseData = [
    { name: 'Year 1', salary: 40000, demand: 60 },
    { name: 'Year 2', salary: 55000, demand: 70 },
    { name: 'Year 3', salary: 75000, demand: 85 },
    { name: 'Year 4', salary: 95000, demand: 90 },
    { name: 'Year 5', salary: 120000, demand: 95 },
  ];

  // Slightly randomize or adjust based on role string hash for demo variety
  const multiplier = role.length % 2 === 0 ? 1.1 : 0.9;
  
  return baseData.map(d => ({
    ...d,
    salary: Math.round(d.salary * multiplier),
  }));
};

const CareerChart: React.FC<CareerChartProps> = ({ role }) => {
  const data = getRoleData(role);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">
        Projected Growth: <span className="text-indigo-600">{role}</span>
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="salary" 
              stroke="#4f46e5" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSalary)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center italic">
        *Market estimation based on current trends. Actual figures may vary.
      </p>
    </div>
  );
};

export default CareerChart;
