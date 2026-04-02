import { useState, useEffect, useContext } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, ArrowRight, Users, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const StatCard = ({ title, amount, icon, color, description }) => (
  <Card className="overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 border-border/20 bg-card/40 backdrop-blur-3xl group">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-md ${color} bg-opacity-10`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold tracking-tight">{amount}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    totalExpenses: 0,
    totalOwed: 0,
    totalReceive: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const { data: groups } = await api.get('/groups');
        
        let totalExp = 0;
        let totalOwe = 0;
        let totalRec = 0;

        await Promise.all(groups.map(async (g) => {
           const [expRes, balRes] = await Promise.all([
             api.get(`/groups/${g._id}/expenses`),
             api.get(`/groups/${g._id}/balances`)
           ]);
           
           expRes.data.forEach((e) => totalExp += e.amount);
           
           const myBalance = balRes.data[user._id] || 0;
           if (myBalance < 0) totalOwe += Math.abs(myBalance);
           else if (myBalance > 0) totalRec += myBalance;
        }));

        setMetrics({
          totalExpenses: totalExp,
          totalOwed: totalOwe,
          totalReceive: totalRec
        });
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const format = (cents) => '₹' + (cents / 100).toFixed(2);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter">Dashboard</h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Financial Intelligence Overview</p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Group Expenses" 
            amount={format(metrics.totalExpenses)} 
            icon={<DollarSign size={18} className="text-primary" />} 
            color="text-primary" 
            description="Across all your active groups"
          />
          <StatCard 
            title="You Owe" 
            amount={format(metrics.totalOwed)} 
            icon={<TrendingDown size={18} className="text-destructive" />} 
            color="text-destructive" 
            description="Net amount you need to pay back"
          />
          <StatCard 
            title="You are Owed" 
            amount={format(metrics.totalReceive)} 
            icon={<TrendingUp size={18} className="text-emerald-500" />} 
            color="text-emerald-500" 
            description="Net amount to be received"
          />
          <Link to="/groups">
            <Card className="overflow-hidden transition-all hover:shadow-lg border-border/50 hover:bg-accent cursor-pointer h-full group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Groups</CardTitle>
                <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                  <CheckCircle size={18} className="text-muted-foreground group-hover:text-primary" />
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-2xl font-bold tracking-tight">View All</div>
                <ArrowRight size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/20 bg-card/40 backdrop-blur-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Handshake size={200} />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Understanding SplitSmart</CardTitle>
            <CardDescription className="font-medium text-muted-foreground/60">Our unique approach to settling debts.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground/80 leading-relaxed space-y-4 pt-0 relative z-10">
            <p>Welcome to SplitSmart! This app uses a <strong className="text-foreground">greedy algorithm</strong> to optimize debt settlements. Instead of everyone paying back exact individual receipts, we calculate net balances.</p>
            <p>When you click on <strong className="text-foreground font-medium underline underline-offset-4 decoration-primary/30">Settlements</strong>, you will see the absolute minimum number of transactions needed for everyone to be fully paid back!</p>
          </CardContent>
        </Card>

        <Card className="border-border/20 bg-card/40 backdrop-blur-3xl shadow-2xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Quick Actions</CardTitle>
            <CardDescription className="font-medium">Common tasks you might want to do.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
             <Button asChild className="w-full justify-start gap-3 h-12 rounded-xl" variant="neon">
               <Link to="/expenses">
                 <DollarSign size={18} />
                 <span className="font-bold">Add Expense</span>
               </Link>
             </Button>
             <Button asChild className="w-full justify-start gap-3 h-12 rounded-xl text-neutral-400 hover:text-foreground" variant="outline">
               <Link to="/groups">
                 <Users size={18} />
                 <span className="font-bold">Manage Groups</span>
               </Link>
             </Button>
             <Button asChild className="w-full justify-start gap-3 h-12 rounded-xl text-neutral-400 hover:text-foreground" variant="outline">
               <Link to="/settlements">
                 <Handshake size={18} />
                 <span className="font-bold">View Settlements</span>
               </Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
