import { useState, useEffect, useContext } from "react";
import {
  Users,
  Plus,
  UserPlus,
  Search,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Groups = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Add member state
  const [addMemberGroupId, setAddMemberGroupId] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addMemberMsg, setAddMemberMsg] = useState({ type: "", text: "" });
  const [addingMemberId, setAddingMemberId] = useState(null);

  // Expanded group for member list
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  // Delete group state
  const [deletingGroupId, setDeletingGroupId] = useState(null);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get("/groups");
      setGroups(data);
    } catch (error) {
      console.error("Failed to fetch groups", error);
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
      await api.post("/groups", { name: newGroupName });
      setNewGroupName("");
      setIsCreateModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Failed to create group", error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await api.delete(`/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
      setDeletingGroupId(null);
    } catch (error) {
      console.error("Failed to delete group", error);
      alert(error.response?.data?.message || "Failed to delete group");
      setDeletingGroupId(null);
    }
  };

  const handleSearchUsers = async (emailQuery) => {
    setMemberEmail(emailQuery);
    setAddMemberMsg({ type: "", text: "" });

    if (emailQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data } = await api.get(
        `/auth/users/search?email=${encodeURIComponent(emailQuery)}`,
      );
      const currentGroup = groups.find((g) => g._id === addMemberGroupId);
      const currentMemberIds =
        currentGroup?.members?.map((m) => m._id || m) || [];
      const filtered = data.filter((u) => !currentMemberIds.includes(u._id));
      setSearchResults(filtered);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (targetUser) => {
    setAddingMemberId(targetUser._id);
    setAddMemberMsg({ type: "", text: "" });
    try {
      const { data } = await api.put(`/groups/${addMemberGroupId}/members`, {
        email: targetUser.email,
      });
      setGroups((prev) =>
        prev.map((g) => (g._id === addMemberGroupId ? data : g)),
      );
      setAddMemberMsg({
        type: "success",
        text: `${targetUser.name} added successfully!`,
      });
      setSearchResults((prev) => prev.filter((u) => u._id !== targetUser._id));
      setMemberEmail("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add member";
      setAddMemberMsg({ type: "error", text: msg });
    } finally {
      setAddingMemberId(null);
    }
  };

  const closeAddMemberModal = () => {
    setAddMemberGroupId(null);
    setMemberEmail("");
    setSearchResults([]);
    setAddMemberMsg({ type: "", text: "" });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Users className="h-8 w-8 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading groups...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center sticky top-4 z-20 py-4 px-4 rounded-2xl border border-border/45 bg-card/40 backdrop-blur-2xl shadow-[0_10px_30px_hsl(var(--glass-shadow))]">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground text-sm">
            Manage your expense splitting groups.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="neon"
          className="gap-2 shadow-lg"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Group</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <Card className="col-span-full py-16 border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-center gap-4">
              <div className="bg-muted p-6 rounded-full">
                <Users size={32} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">No groups yet</CardTitle>
                <CardDescription className="max-w-xs mx-auto">
                  Create a group to start splitting expenses with your friends,
                  family, or trip mates.
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} variant="neon">
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Card
              key={group._id}
              className="overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 border-border/20 bg-card backdrop-blur-none flex flex-col group/card-item"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 bg-card">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold leading-tight text-foreground">
                    {group.name}
                  </CardTitle>
                  <CardDescription>
                    {group.members.length} Members
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAddMemberGroupId(group._id)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    title="Add Member"
                  >
                    <UserPlus size={18} />
                  </Button>
                  {group.owner === user?._id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingGroupId(group._id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete Group"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2.5">
                    {group.members.slice(0, 4).map((m, i) => (
                      <Avatar
                        key={i}
                        className="h-8 w-8 border-2 border-card ring-0"
                        title={m.name || "User"}
                      >
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold uppercase">
                          {(m.name || "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {group.members.length > 4 && (
                      <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                  <Button variant="link" asChild className="text-xs h-auto p-0">
                    <Link to={`/expenses?groupId=${group._id}`}>
                      View Expenses
                    </Link>
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex flex-col gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedGroupId(
                      expandedGroupId === group._id ? null : group._id,
                    )
                  }
                  className="w-full h-8 text-xs text-muted-foreground hover:bg-muted"
                >
                  {expandedGroupId === group._id ? (
                    <ChevronUp size={14} className="mr-1" />
                  ) : (
                    <ChevronDown size={14} className="mr-1" />
                  )}
                  {expandedGroupId === group._id
                    ? "Hide Members"
                    : "Show Members"}
                </Button>

                {expandedGroupId === group._id && (
                  <div className="w-full space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {group.members.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-md bg-muted/30 border border-border/30"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] uppercase">
                            {(m.name || "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {m.name || "Unknown"}
                            {m._id === user?._id && (
                              <Badge
                                variant="secondary"
                                className="ml-1 text-[9px] px-1 h-3.5 bg-primary/10 text-primary border-none"
                              >
                                you
                              </Badge>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {m.email || ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Delete Group Confirmation Modal */}
      <Dialog
        open={!!deletingGroupId}
        onOpenChange={(open) => !open && setDeletingGroupId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 size={20} />
              Delete Group
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {groups.find((g) => g._id === deletingGroupId)?.name}
              </strong>
              ? This action will permanently delete all related expenses and
              settlements. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingGroupId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                deletingGroupId && handleDeleteGroup(deletingGroupId)
              }
            >
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Add a name for your group to start tracking expenses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Goa Trip, Shared Apartment"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Group</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog
        open={!!addMemberGroupId}
        onOpenChange={(open) => !open && closeAddMemberModal()}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={20} className="text-primary" />
              Add Member
            </DialogTitle>
            <DialogDescription>
              Invite registered users to{" "}
              <span className="font-semibold text-foreground">
                {groups.find((g) => g._id === addMemberGroupId)?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="emailSearch">Search by Email</Label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="emailSearch"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Enter email address..."
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            {addMemberMsg.text && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md text-xs animate-in zoom-in-95 duration-200 ${
                  addMemberMsg.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {addMemberMsg.type === "success" ? (
                  <CheckCircle size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {addMemberMsg.text}
              </div>
            )}

            <div className="space-y-2">
              {searching && (
                <div className="text-center py-4">
                  <span className="text-xs text-muted-foreground animate-pulse">
                    Searching users...
                  </span>
                </div>
              )}

              {!searching &&
                memberEmail.length >= 2 &&
                searchResults.length === 0 && (
                  <div className="text-center py-6 border rounded-lg border-dashed">
                    <Mail
                      size={20}
                      className="text-muted-foreground mx-auto mb-2 opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      No users found matching "{memberEmail}"
                    </p>
                  </div>
                )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Search Results
                  </Label>
                  {searchResults.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-accent/30"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                            {u.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none">
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddMember(u)}
                        disabled={addingMemberId === u._id}
                        className="h-8 px-3"
                      >
                        {addingMemberId === u._id ? "..." : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-2" />

            <div className="space-y-3">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider underline underline-offset-4">
                Current Members
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-1">
                {groups
                  .find((g) => g._id === addMemberGroupId)
                  ?.members.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-md bg-muted/20 border border-border/10"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px] uppercase">
                          {(m.name || "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate leading-none">
                          {m.name || "Unknown"}
                          {m._id === user?._id && (
                            <span className="text-primary text-[9px] ml-1 font-normal opacity-70">
                              (you)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="ghost" onClick={closeAddMemberModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
