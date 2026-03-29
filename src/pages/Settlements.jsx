import { useState, useEffect, useContext } from 'react';
import { Handshake } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Settlements = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
         const { data } = await api.get('/groups');
         setGroups(data);
         if (data.length > 0) {
           setSelectedGroupId(data[0]._id);
         }
      } catch (err) {
         console.error('Error fetching groups', err);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedGroupId) return;
      setLoading(true);
      try {
        const [balRes, setRes] = await Promise.all([
          api.get(`/groups/${selectedGroupId}/balances`),
          api.get(`/groups/${selectedGroupId}/settlements`)
        ]);
        setBalances(balRes.data);
        setSettlements(setRes.data);
      } catch (err) {
        console.error('Error fetching settlements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGroupId]);

  const formatMoney = (valInPaise) => {
    return (valInPaise / 100).toFixed(2);
  };

  const myBalance = balances ? balances[user._id] : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Settlements</h1>
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
      </div>

      {loading ? (
        <div className="text-gray-400">Loading settlement data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-container border-b-4 border-b-danger">
              <h2 className="text-xl font-bold text-white mb-4">You Owe</h2>
              <div className="text-center py-4">
                {myBalance < 0 ? (
                  <p className="text-3xl font-bold text-danger mb-2">₹{formatMoney(Math.abs(myBalance))}</p>
                ) : (
                  <p className="text-gray-400">You don't owe anyone. Great job!</p>
                )}
              </div>
            </div>

            <div className="card-container border-b-4 border-b-success">
              <h2 className="text-xl font-bold text-white mb-4">Owed to You</h2>
              <div className="text-center py-4">
                {myBalance > 0 ? (
                  <p className="text-3xl font-bold text-success mb-2">₹{formatMoney(myBalance)}</p>
                ) : (
                  <p className="text-gray-400">Nobody owes you right now.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="card-container mt-6 min-h-[300px]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               <Handshake className="text-primary" /> Suggested Optimal Settlements
            </h2>
            
            {settlements.length === 0 ? (
               <div className="text-gray-400 text-center py-8">
                 <p>All settled up! No transactions needed.</p>
               </div>
            ) : (
               <div className="space-y-4 mt-6">
                 {settlements.map((s, idx) => (
                   <div key={idx} className="bg-dark p-4 rounded border border-gray-800 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">
                          {s.from._id === user._id ? 'You' : s.from.name.charAt(0)}
                        </div>
                        <span className="text-gray-400 mx-2">pays</span>
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                           {s.to._id === user._id ? 'You' : s.to.name.charAt(0)}
                        </div>
                     </div>
                     <div className="font-bold text-xl text-white">
                        ₹{formatMoney(s.amount)}
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Settlements;
