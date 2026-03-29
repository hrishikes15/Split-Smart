import { useState, useEffect, useContext } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const StatCard = ({ title, amount, icon, color }) => (
  <div className="card-container flex items-center gap-4 hover:border-gray-700 transition duration-200">
    <div className={`p-4 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white">{amount}</h3>
    </div>
  </div>
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
           
           expRes.data.forEach(e => totalExp += e.amount);
           
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      
      {loading ? (
        <div className="text-gray-400">Loading your summary...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Group Expenses" 
            amount={format(metrics.totalExpenses)} 
            icon={<DollarSign size={24} className="text-primary" />} 
            color="bg-primary/10" 
          />
          <StatCard 
            title="You Owe" 
            amount={format(metrics.totalOwed)} 
            icon={<TrendingDown size={24} className="text-danger" />} 
            color="bg-danger/10" 
          />
          <StatCard 
            title="You are Owed" 
            amount={format(metrics.totalReceive)} 
            icon={<TrendingUp size={24} className="text-success" />} 
            color="bg-success/10" 
          />
          <StatCard 
            title="Active Groups" 
            amount={"View"} 
            icon={<CheckCircle size={24} className="text-gray-400" />} 
            color="bg-gray-800" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 card-container">
          <h2 className="text-xl font-bold text-white mb-4">Understanding SplitSmart</h2>
          <div className="text-gray-400 py-4 leading-relaxed space-y-4">
            <p>Welcome to SplitSmart! This app uses a <strong className="text-white">greedy algorithm</strong> to optimize debt settlements. Instead of everyone paying back exact individual receipts, we calculate net balances.</p>
            <p>When you click on <strong className="text-white">Settlements</strong>, you will see the absolute minimum number of transactions needed for everyone to be fully paid back!</p>
          </div>
        </div>
        <div className="card-container">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
             <Link to="/expenses" className="btn-primary w-full text-left flex justify-between items-center block">
               Add Expense <DollarSign size={16} />
             </Link>
             <Link to="/groups" className="w-full text-left flex justify-between items-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-200 block">
               Manage Groups
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
