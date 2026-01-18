
import { MachineData } from './types';

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

const generateMonthlyValues = (base: number, variance: number, seed: number, days: number) => {
  return Array.from({ length: days }, (_, i) => {
    const random = Math.sin(i + seed + days) * variance;
    const value = Math.min(100, Math.max(70, base + random));
    return parseFloat(value.toFixed(1));
  });
};

const calcAvg = (arr: number[]) => parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));

export const getInitialMachineryData = (month: number, year: number): MachineData[] => {
  const days = getDaysInMonth(month, year);
  const monthLabel = MONTHS[month].substring(0, 3);
  const dates = Array.from({ length: days }, (_, i) => `${i + 1} ${monthLabel}`);

  const configs = [
    { id: 'dt', name: 'DT', fullName: 'Dump Truck', color: '#2563eb', base: 88, var: 8 },
    { id: 'wt', name: 'WT', fullName: 'Water Truck', color: '#059669', base: 97, var: 2 },
    { id: 'dz', name: 'DZ', fullName: 'Dozer', color: '#d97706', base: 85, var: 12 },
    { id: 'ex', name: 'EX', fullName: 'Excavator', color: '#dc2626', base: 98, var: 1 },
    { id: 'gr', name: 'GR', fullName: 'Grader', color: '#7c3aed', base: 96, var: 3 }
  ];

  return configs.map((cfg, seed) => {
    const values = generateMonthlyValues(cfg.base, cfg.var, seed + 1, days);
    return {
      id: cfg.id,
      name: cfg.name,
      fullName: cfg.fullName,
      color: cfg.color,
      avg: calcAvg(values),
      data: dates.map((d, i) => ({ date: d, value: values[i] }))
    };
  });
};

export const INITIAL_MACHINERY = getInitialMachineryData(0, 2025); // Jan 2025
