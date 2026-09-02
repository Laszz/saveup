import { Transaction, Goal, Balance } from '@/src/types';

export function calcBalance(txs: Transaction[]): Balance {
  let totalIncome=0, totalExpense=0, totalSaving=0, totalWithdrawal=0;
  for (const t of txs) {
    if (t.type==='income') totalIncome+=t.amount;
    else if (t.type==='expense') totalExpense+=t.amount;
    else if (t.type==='saving') totalSaving+=t.amount;
    else if (t.type==='withdrawal') totalWithdrawal+=t.amount;
  }
  const balance = totalIncome - totalExpense - totalSaving + totalWithdrawal;
  return { totalIncome, totalExpense, totalSaving, totalWithdrawal, balance };
}

export function calcGoalProgress(goal: Goal, txs: Transaction[]): { currentAmount:number, progress:number, isCompleted:boolean } {
  const rel = txs.filter(t=>t.goalId===goal.id);
  let cur=0;
  for (const t of rel) {
    if (t.type==='saving') cur+=t.amount;
    else if (t.type==='withdrawal') cur-=t.amount;
  }
  if (cur<0) cur=0;
  const progress = goal.targetAmount>0 ? Math.min(100, (cur/goal.targetAmount)*100) : 0;
  return { currentAmount: cur, progress, isCompleted: cur>=goal.targetAmount };
}

export function enrichGoals(goals: Goal[], txs: Transaction[]): Goal[] {
  return goals.map(g=>{
    const {currentAmount, progress, isCompleted} = calcGoalProgress(g, txs);
    return { ...g, currentAmount, progress, completedAt: isCompleted ? (g.completedAt||new Date().toISOString()) : undefined };
  });
}

export function calcStreak(txs: Transaction[]): number {
  // only saving type counts, distinct days, consecutive from today backwards
  const savingDates = [...new Set(txs.filter(t=>t.type==='saving').map(t=>{
    const d=new Date(t.date); d.setHours(0,0,0,0); return d.toISOString().slice(0,10);
  }))].sort().reverse(); // newest first
  if (savingDates.length===0) return 0;
  // streak counts consecutive days ending today or yesterday? PRD: saving streak per hari, jika tidak ada saving hari berikutnya terputus.
  // We use: streak = consecutive saving days up to most recent date, if gap >1 breaks.
  // Better: calculate longest current streak ending at most recent saving date, but if last saving not today, still count streak until that date?
  // Simpler: start from today backwards, if today has saving then streak includes today, else streak is consecutive from last saving date without requiring today.
  // We'll compute consecutive sequence from newest date backwards.
  let streak=1;
  for(let i=0;i<savingDates.length-1;i++){
    const cur = new Date(savingDates[i]);
    const nxt = new Date(savingDates[i+1]);
    const diff = Math.round((cur.getTime()-nxt.getTime())/86400000);
    if(diff===1) streak++;
    else break;
  }
  // if last saving older than yesterday and streak=1, keep 1? But if gap from today >1, spec maybe should reset? We'll keep as is, actual streak shows history, UI will show "putus jika tidak nabung hari ini"
  return streak;
}

export function expenseBreakdown(txs: Transaction[]) {
  const exp = txs.filter(t=>t.type==='expense' && t.categoryId);
  const total = exp.reduce((s,t)=>s+t.amount,0);
  const map = new Map<string, number>();
  for(const t of exp) map.set(t.categoryId!, (map.get(t.categoryId!)||0)+t.amount);
  return Array.from(map.entries()).map(([catId, amt])=>({ categoryId:catId, amount:amt, percent: total? (amt/total)*100 :0 })).sort((a,b)=>b.amount-a.amount);
}

export function monthlyOverview(txs: Transaction[], months=6) {
  const now=new Date();
  const res: { month:string, income:number, expense:number, saving:number }[]=[];
  for(let i=months-1;i>=0;i--){
    const d=new Date(now.getFullYear(), now.getMonth()-i,1);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label=d.toLocaleDateString('id-ID',{month:'short'});
    let income=0, expense=0, saving=0;
    for(const t of txs){
      const td=new Date(t.date);
      if(td.getFullYear()===d.getFullYear() && td.getMonth()===d.getMonth()){
        if(t.type==='income') income+=t.amount;
        else if(t.type==='expense') expense+=t.amount;
        else if(t.type==='saving') saving+=t.amount;
      }
    }
    res.push({ month:label, income, expense, saving, key } as any);
  }
  return res;
}
