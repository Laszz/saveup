import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getDb, getAllGoals, getAllTransactions, getAllCategories, getSettings, setSetting, genId } from '@/src/database/db';
import { Goal, Transaction, Category, Settings, Balance } from '@/src/types';
import { calcBalance, enrichGoals } from '@/src/services/calc';
import * as SQLite from 'expo-sqlite';

type AppContextType = {
  ready: boolean;
  goals: Goal[];
  transactions: Transaction[];
  categories: Category[];
  settings: Settings;
  balance: Balance;
  refresh: () => Promise<void>;
  addTransaction: (t: Omit<Transaction,'id'|'createdAt'>) => Promise<void>;
  updateTransaction: (id:string, patch: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id:string) => Promise<void>;
  addGoal: (g: Omit<Goal,'id'|'createdAt'|'completedAt'>) => Promise<void>;
  updateGoal: (id:string, patch: Partial<Goal>) => Promise<void>;
  deleteGoal: (id:string) => Promise<void>;
  addSaving: (goalId:string, amount:number, note?:string, date?:string) => Promise<void>;
  withdrawSaving: (goalId:string, amount:number, note?:string, date?:string) => Promise<void>;
  setSettings: (patch: Partial<Settings>) => Promise<void>;
};

const Ctx = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettingsState] = useState<Settings>({ currency:'IDR', language:'id', reminderEnabled:false, reminderTime:'20:00', hasSeenOnboarding:false, theme:'system' });
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try{
      const database = db || await getDb();
      if (!db) setDb(database);
      const [gRows, tRows, cRows, s] = await Promise.all([
        getAllGoals(database),
        getAllTransactions(database),
        getAllCategories(database),
        getSettings(database),
      ]);
      const txs: Transaction[] = tRows.map((r:any)=>({ id:r.id, type:r.type, amount:r.amount, categoryId:r.categoryId||undefined, goalId:r.goalId||undefined, note:r.note||undefined, date:r.date, createdAt:r.createdAt }));
      const rawGoals: Goal[] = gRows.map((r:any)=>({ id:r.id, name:r.name, icon:r.icon||undefined, targetAmount:r.targetAmount, targetDate:r.targetDate||undefined, createdAt:r.createdAt, completedAt:r.completedAt||undefined }));
      const enriched = enrichGoals(rawGoals, txs);
      setGoals(enriched);
      setTransactions(txs);
      setCategories(cRows.map((r:any)=>({ id:r.id, name:r.name, type:r.type, icon:r.icon||undefined, isDefault:!!r.isDefault })));
      setSettingsState(s as Settings);
    }catch(e){
      console.log('DB refresh error', e);
    } finally {
      setReady(true);
    }
  }, [db]);

  useEffect(()=>{ refresh().catch(e=>{ console.log('init error', e); setReady(true); }); }, []);

  // ponytail: re-schedule daily reminder after Force Stop / reboot — no UI, just 1 alarm
  useEffect(()=>{
    if(!ready) return;
    if(!settings.reminderEnabled) return;
    if(Platform.OS==='web') return;
    const t=settings.reminderTime||'20:00';
    if(!/^([01]\d|2[0-3]):([0-5]\d)$/.test(t)) return;
    (async()=>{
      try{
        const perm=await Notifications.getPermissionsAsync();
        if(perm.status!=='granted') return;
        const { scheduleDailyReminder } = await import('@/src/services/reminder');
        const [h,m]=t.split(':').map(Number);
        await scheduleDailyReminder(h, m);
      }catch{}
    })();
  },[ready, settings.reminderEnabled, settings.reminderTime]);

  const addTransaction = async (t: Omit<Transaction,'id'|'createdAt'>) => {
    const database = db || await getDb();
    const id=genId();
    const now=new Date().toISOString();
    await database.runAsync('INSERT INTO transactions (id,type,amount,categoryId,goalId,note,date,createdAt) VALUES (?,?,?,?,?,?,?,?)',[id,t.type,t.amount,t.categoryId||null,t.goalId||null,t.note||null,t.date,now]);
    await refresh();
  };
  const updateTransaction = async (id:string, patch: Partial<Transaction>) => {
    const database = db || await getDb();
    const fields:string[]=[]; const vals:any[]=[];
    if(patch.type!==undefined){fields.push('type=?'); vals.push(patch.type);}
    if(patch.amount!==undefined){fields.push('amount=?'); vals.push(patch.amount);}
    if(patch.categoryId!==undefined){fields.push('categoryId=?'); vals.push(patch.categoryId||null);}
    if(patch.goalId!==undefined){fields.push('goalId=?'); vals.push(patch.goalId||null);}
    if(patch.note!==undefined){fields.push('note=?'); vals.push(patch.note||null);}
    if(patch.date!==undefined){fields.push('date=?'); vals.push(patch.date);}
    if(fields.length===0) return;
    vals.push(id);
    await database.runAsync(`UPDATE transactions SET ${fields.join(',')} WHERE id=?`, vals);
    await refresh();
  };
  const deleteTransaction = async (id:string)=>{
    const database = db || await getDb();
    await database.runAsync('DELETE FROM transactions WHERE id=?',[id]);
    await refresh();
  };
  const addGoal = async (g: Omit<Goal,'id'|'createdAt'|'completedAt'>)=>{
    const database = db || await getDb();
    const id=genId(); const now=new Date().toISOString();
    await database.runAsync('INSERT INTO goals (id,name,icon,targetAmount,targetDate,createdAt) VALUES (?,?,?,?,?,?)',[id,g.name,g.icon||null,g.targetAmount,g.targetDate||null,now]);
    await refresh();
  };
  const updateGoal = async (id:string, patch: Partial<Goal>)=>{
    const database = db || await getDb();
    const fields:string[]=[]; const vals:any[]=[];
    if(patch.name!==undefined){fields.push('name=?'); vals.push(patch.name);}
    if(patch.icon!==undefined){fields.push('icon=?'); vals.push(patch.icon||null);}
    if(patch.targetAmount!==undefined){fields.push('targetAmount=?'); vals.push(patch.targetAmount);}
    if(patch.targetDate!==undefined){fields.push('targetDate=?'); vals.push(patch.targetDate||null);}
    if(patch.completedAt!==undefined){fields.push('completedAt=?'); vals.push(patch.completedAt||null);}
    if(fields.length===0) return;
    vals.push(id);
    await database.runAsync(`UPDATE goals SET ${fields.join(',')} WHERE id=?`, vals);
    await refresh();
  };
  const deleteGoal = async (id:string)=>{
    const database = db || await getDb();
    await database.runAsync('DELETE FROM transactions WHERE goalId=?',[id]);
    await database.runAsync('DELETE FROM goals WHERE id=?',[id]);
    await refresh();
  };
  const addSaving = async (goalId:string, amount:number, note?:string, date?:string)=>{
    await addTransaction({ type:'saving', amount, goalId, note, date: date||new Date().toISOString() });
  };
  const withdrawSaving = async (goalId:string, amount:number, note?:string, date?:string)=>{
    // validation: cannot exceed currentAmount
    const g = goals.find(x=>x.id===goalId);
    const cur = g?.currentAmount||0;
    if(amount>cur) throw new Error('Nominal melebihi tabungan tersedia');
    await addTransaction({ type:'withdrawal', amount, goalId, note, date: date||new Date().toISOString() });
  };
  const setSettings = async (patch: Partial<Settings>)=>{
    const database = db || await getDb();
    if(patch.currency!==undefined) await setSetting(database,'currency',patch.currency);
    if(patch.language!==undefined) await setSetting(database,'language',patch.language);
    if(patch.reminderEnabled!==undefined) await setSetting(database,'reminderEnabled', patch.reminderEnabled?'1':'0');
    if(patch.reminderTime!==undefined) await setSetting(database,'reminderTime',patch.reminderTime);
    if(patch.hasSeenOnboarding!==undefined) await setSetting(database,'hasSeenOnboarding', patch.hasSeenOnboarding?'1':'0');
    if(patch.theme!==undefined) await setSetting(database,'theme', patch.theme);
    await refresh();
  };

  const balance = calcBalance(transactions);

  return <Ctx.Provider value={{ ready, goals, transactions, categories, settings, balance, refresh, addTransaction, updateTransaction, deleteTransaction, addGoal, updateGoal, deleteGoal, addSaving, withdrawSaving, setSettings }}>{children}</Ctx.Provider>;
}

export function useApp(){ const v=useContext(Ctx); if(!v) throw new Error('useApp outside provider'); return v; }
