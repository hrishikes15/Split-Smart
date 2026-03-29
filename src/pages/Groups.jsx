import { useState, useEffect, useContext } from 'react';
import { Users, Plus, X, UserPlus, Search, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Groups = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  // Add member state
  const [addMemberGroupId, setAddMemberGroupId] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addMemberMsg, setAddMemberMsg] = useState({ type: '', text: '' });
  const [addingMemberId, setAddingMemberId] = useState(null);

  // Expanded group for member list
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  
  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    try {
      await api.post('/groups', { name: newGroupName });
      setNewGroupName('');
      setIsCreateModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Failed to create group', error);
    }
  };

  // Search users by email
  const handleSearchUsers = async (emailQuery) => {
    setMemberEmail(emailQuery);
    setAddMemberMsg({ type: '', text: '' });
    
    if (emailQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data } = await api.get(`/auth/users/search?email=${encodeURIComponent(emailQuery)}`);
      // Filter out users who are already members of the current group
      const currentGroup = groups.find(g => g._id === addMemberGroupId);
      const currentMemberIds = currentGroup?.members?.map(m => m._id || m) || [];
      const filtered = data.filter(u => !currentMemberIds.includes(u._id));
      setSearchResults(filtered);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  // Add a member to a group
  const handleAddMember = async (targetUser) => {
    setAddingMemberId(targetUser._id);
    setAddMemberMsg({ type: '', text: '' });
    try {
      const { data } = await api.put(`/groups/${addMemberGroupId}/members`, {
        email: targetUser.email,
      });
      // Update the group in our local state
      setGroups(prev => prev.map(g => g._id === addMemberGroupId ? data : g));
      setAddMemberMsg({ type: 'success', text: `${targetUser.name} added successfully!` });
      setSearchResults(prev => prev.filter(u => u._id !== targetUser._id));
      setMemberEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add member';
      setAddMemberMsg({ type: 'error', text: msg });
    } finally {
      setAddingMemberId(null);
    }
  };

  const openAddMemberModal = (groupId) => {
    setAddMemberGroupId(groupId);
    setMemberEmail('');
    setSearchResults([]);
    setAddMemberMsg({ type: '', text: '' });
  };

  const closeAddMemberModal = () => {
    setAddMemberGroupId(null);
    setMemberEmail('');
    setSearchResults([]);
    setAddMemberMsg({ type: '', text: '' });
  };

  if (loading) return <div className="text-white">Loading groups...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Groups</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full card-container flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-800 p-6 rounded-full inline-block mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No groups yet</h3>
            <p className="text-gray-400 max-w-sm mb-6">Create a group to start splitting expenses with your friends, family, or trip mates.</p>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">Create Your First Group</button>
          </div>
        ) : (
          groups.map(group => (
             <div key={group._id} className="card-container hover:border-gray-700 transition duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{group.name}</h3>
                  <button
                    onClick={() => openAddMemberModal(group._id)}
                    className="text-primary hover:text-primaryHover transition duration-200 p-1 rounded hover:bg-primary/10"
                    title="Add Member"
                  >
                    <UserPlus size={18} />
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-4">{group.members.length} Members</p>

                {/* Member avatars */}
                <div className="flex justify-between items-center mb-3">
                   <div className="flex -space-x-2">
                     {group.members.slice(0,3).map((m, i) => (
                       <div key={i} className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white border-2 border-card uppercase" title={m.name || 'User'}>
                         {(m.name || '?').charAt(0)}
                       </div>
                     ))}
                     {group.members.length > 3 && (
                       <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white border-2 border-card">
                         +{group.members.length - 3}
                       </div>
                     )}
                   </div>
                   <Link to={`/expenses?groupId=${group._id}`} className="text-primary hover:text-primaryHover text-sm font-medium">View Group</Link>
                </div>

                {/* Toggle member list */}
                <button 
                  onClick={() => setExpandedGroupId(expandedGroupId === group._id ? null : group._id)} 
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition duration-200 w-full justify-center pt-2 border-t border-gray-800"
                >
                  {expandedGroupId === group._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {expandedGroupId === group._id ? 'Hide Members' : 'Show Members'}
                </button>

                {expandedGroupId === group._id && (
                  <div className="mt-3 space-y-2">
                    {group.members.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-dark/50">
                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary uppercase flex-shrink-0">
                          {(m.name || '?').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {m.name || 'Unknown'} 
                            {m._id === user?._id && <span className="text-primary text-xs ml-1">(you)</span>}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{m.email || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-container w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Group</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">Group Name</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Goa Trip" 
                  className="input-field" 
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full mt-2">Create</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberGroupId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-container w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus size={20} className="text-primary" />
                Add Member
              </h2>
              <button onClick={closeAddMemberModal} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Search by email to add a registered user to <strong className="text-white">{groups.find(g => g._id === addMemberGroupId)?.name}</strong>.
            </p>

            {/* Search Input */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => handleSearchUsers(e.target.value)}
                placeholder="Type an email address..."
                className="input-field pl-10"
                autoFocus
              />
            </div>

            {/* Feedback message */}
            {addMemberMsg.text && (
              <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
                addMemberMsg.type === 'success' 
                  ? 'bg-success/10 text-success border border-success/20' 
                  : 'bg-danger/10 text-danger border border-danger/20'
              }`}>
                {addMemberMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {addMemberMsg.text}
              </div>
            )}

            {/* Search Results */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searching && (
                <div className="text-center text-gray-400 text-sm py-4">Searching...</div>
              )}
              
              {!searching && memberEmail.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-6">
                  <Mail size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No users found matching "{memberEmail}"</p>
                  <p className="text-gray-600 text-xs mt-1">Make sure they've registered on SplitSmart.</p>
                </div>
              )}

              {searchResults.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark border border-gray-800 hover:border-gray-700 transition duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary uppercase flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(u)}
                    disabled={addingMemberId === u._id}
                    className="bg-primary hover:bg-primaryHover text-white text-xs font-medium py-1.5 px-3 rounded transition duration-200 disabled:opacity-50 flex items-center gap-1"
                  >
                    {addingMemberId === u._id ? (
                      'Adding...'
                    ) : (
                      <><Plus size={14} /> Add</>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Current members section */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Current Members</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {groups.find(g => g._id === addMemberGroupId)?.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-dark/50">
                    <div className="h-7 w-7 rounded-full bg-success/20 flex items-center justify-center text-xs font-bold text-success uppercase flex-shrink-0">
                      {(m.name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">
                        {m.name || 'Unknown'}
                        {m._id === user?._id && <span className="text-primary text-xs ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{m.email || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
