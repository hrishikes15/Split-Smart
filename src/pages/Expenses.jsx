import { useState, useEffect, useContext } from 'react';
import { DollarSign, Plus, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Expenses = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialGroupId = queryParams.get('groupId');

  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId || '');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');

  // Load groups so user can pick which group to see/add expenses to
  useEffect(() => {
    const fetchGroups = async () => {
      try {
         const { data } = await api.get('/groups');
         setGroups(data);
         if (!selectedGroupId && data.length > 0) {
           setSelectedGroupId(data[0]._id);
         }
      } catch (err) {
         console.error('Error fetching groups', err);
      }
    };
    fetchGroups();
  }, [selectedGroupId]);

  // Load expenses for selected group
  const fetchExpenses = async () => {
    if (!selectedGroupId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/groups/${selectedGroupId}/expenses`);
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedGroupId]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    // For equal split, divide amongst all group members
    const group = groups.find(g => g._id === selectedGroupId);
    if (!group) return;

    const numMembers = group.members.length;
    let computedSplits = [];
    
    // Convert to cents to avoid floating point issues
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    if (splitType === 'equal') {
       const splitAmount = Math.floor(amountInPaise / numMembers);
       // handle remainder on the first person
       const remainder = amountInPaise - (splitAmount * numMembers);
       
       computedSplits = group.members.map((member, index) => ({
          user: member._id,
          amount: index === 0 ? splitAmount + remainder : splitAmount
       }));
    } else {
       alert("Custom splits not fully implemented in UI. Defaulting to equal.");
       return;
    }

    try {
       await api.post(`/groups/${selectedGroupId}/expenses`, {
         title,
         amount: amountInPaise,
         paidBy: paidBy || user._id, 
         splitType: 'equal', 
         splits: computedSplits
       });
       
       setIsModalOpen(false);
       setTitle('');
       setAmount('');
       fetchExpenses();
    } catch (err) {
       console.error(err.response?.data?.message || err.message);
    }
  };

  const formatMoney = (valInPaise) => {
    return (valInPaise / 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Expenses</h1>
           {groups.length > 0 && (
             <select 
               className="input-field max-w-xs" 
               value={selectedGroupId} 
               onChange={(e) => setSelectedGroupId(e.target.value)}
             >
               {groups.map(g => (
                 <option key={g._id} value={g._id}>{g.name}</option>
               ))}
             </select>
           )}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
          disabled={groups.length === 0}
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="card-container min-h-[400px]">
        {loading ? (
           <div className="text-gray-400">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-800 p-6 rounded-full inline-block mb-4">
              <DollarSign size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No expenses recorded</h3>
            <p className="text-gray-400 max-w-sm">When you or someone else adds an expense, it will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
             {expenses.map(exp => (
               <div key={exp._id} className="p-4 bg-dark rounded border border-gray-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-lg">{exp.title}</h4>
                    <p className="text-sm text-gray-400">
                      Paid by <span className="text-primary">{exp.paidBy?._id === user._id ? 'You' : exp.paidBy?.name}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-xl">₹{formatMoney(exp.amount)}</p>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-container w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add Expense</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Expense Title</label>
                <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Dinner at XYZ" className="input-field" required />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Amount (₹)</label>
                <input type="number" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="input-field" required />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Paid By</label>
                <select className="input-field" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                   <option value={user._id}>You</option>
                   {groups.find(g => g._id === selectedGroupId)?.members.map(m => {
                     if (m._id !== user._id) {
                       return <option key={m._id} value={m._id}>{m.name}</option>
                     }
                     return null;
                   })}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Split Method</label>
                <select className="input-field" value={splitType} onChange={(e)=>setSplitType(e.target.value)}>
                   <option value="equal">Equally</option>
                   <option value="custom" disabled>Custom (Coming Soon)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary w-full mt-2">Save Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
