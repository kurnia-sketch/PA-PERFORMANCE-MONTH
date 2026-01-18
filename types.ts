
export interface MachineKPI {
  date: string;
  value: number;
}

export interface MachineData {
  id: string;
  name: string;
  fullName: string;
  color: string;
  data: MachineKPI[];
  avg: number;
}

export interface DashboardState {
  machinery: MachineData[];
  selectedDate: string | null;
  loading: boolean;
}

export interface MonthOption {
  value: number;
  label: string;
}
