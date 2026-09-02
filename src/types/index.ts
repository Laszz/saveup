export type TransactionType = 'income' | 'expense' | 'saving' | 'withdrawal';
export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  isDefault: boolean;
}

export interface Goal {
  id: string;
  name: string;
  icon?: string;
  targetAmount: number;
  targetDate?: string; // ISO
  createdAt: string;
  completedAt?: string;
  // derived, not stored
  currentAmount?: number;
  progress?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId?: string;
  goalId?: string;
  note?: string;
  date: string; // ISO date string
  createdAt: string;
}

export type ThemePref = 'light' | 'dark' | 'system';
export type LangPref = 'id' | 'en';
export interface Settings {
  currency: string;
  language?: LangPref;
  reminderEnabled: boolean;
  reminderTime?: string; // HH:mm
  hasSeenOnboarding?: boolean;
  theme?: ThemePref;
}

export interface Balance {
  totalIncome: number;
  totalExpense: number;
  totalSaving: number;
  totalWithdrawal: number;
  balance: number;
}

export interface StreakInfo {
  currentStreak: number;
  lastSavingDate?: string;
}
