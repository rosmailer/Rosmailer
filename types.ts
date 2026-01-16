export type Role = 'CEO' | 'COO' | 'CMO' | 'CPO';

export interface TeamMember {
  id: string;
  name: string;
  roleTitle: string;
  type: Role;
  focus: string;
  responsibilities: string[];
  kpis: string[];
  backup: string;
  color: string;
  email?: string;
  phone?: string;
}

export interface PlaybookStep {
  step: number;
  title: string;
  owner: string;
  actions: string[];
  exitCriteria: string;
}

export interface StrategyItem {
  title: string;
  description: string;
  iconName: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  amountPaid: number;
  notes: string;
  customData: Record<string, string>;
}

export interface Course {
  id: string;
  name: string;
  status: 'Planning' | 'Marketing' | 'Active' | 'Completed';
  registrants: number;
  maxCapacity: number;
  revenue: number;
  owner: string;
  startDate: string; // ISO Date string YYYY-MM-DD
  durationWeeks: number; // Duration in weeks
  students: Student[];
  studentColumns: string[]; // Names of dynamic columns
}

export interface FinancialRecord {
  name: string; // Month name
  revenue: number;
  profit: number;
}

export interface Task {
  id: string;
  description: string;
  assigneeId: string;
  status: 'Pending' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  assignedDate?: string; // Date the task was given
}

export interface PaymentLink {
  id: string;
  title: string;
  url: string;
}
