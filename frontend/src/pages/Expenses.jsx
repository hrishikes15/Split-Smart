import { useState, useEffect, useContext } from "react";
import {
  DollarSign,
  Plus,
  X,
  ListFilter,
  Calendar,
  User,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "react-router-dom";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Expenses = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialGroupId = queryParams.get("groupId");

  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId || "");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("equal");

  // Load groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await api.get("/groups");
        setGroups(data);
        if (!selectedGroupId && data.length > 0) {
          setSelectedGroupId(data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching groups", err);
      }
    };
    fetchGroups();
  }, [selectedGroupId]);

  // Load expenses
  const fetchExpenses = async () => {
    if (!selectedGroupId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/groups/${selectedGroupId}/expenses`);
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses", err);
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

    const group = groups.find((g) => g._id === selectedGroupId);
    if (!group) return;

    const numMembers = group.members.length;
    let computedSplits = [];
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    if (splitType === "equal") {
      const splitAmount = Math.floor(amountInPaise / numMembers);
      const remainder = amountInPaise - splitAmount * numMembers;

      computedSplits = group.members.map((member, index) => ({
        user: member._id,
        amount: index === 0 ? splitAmount + remainder : splitAmount,
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
        splitType: "equal",
        splits: computedSplits,
      });

      setIsModalOpen(false);
      setTitle("");
      setAmount("");
      fetchExpenses();
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
    }
  };

  const formatMoney = (valInPaise) => {
    return (valInPaise / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-4 z-20 py-4 px-4 rounded-2xl border border-border/45 bg-card/40 backdrop-blur-2xl shadow-[0_10px_30px_hsl(var(--glass-shadow))]">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Showing expenses for
            </span>
            {groups.length > 0 && (
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger className="h-8 w-fit min-w-[120px] border border-border/45 bg-card/50 hover:bg-card/70 font-medium text-xs py-0 px-3">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g._id} value={g._id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="neon"
          className="gap-2 shadow-lg"
          disabled={groups.length === 0}
        >
          <Plus size={18} /> New Expense
        </Button>
      </div>

      <Card className="border-border/20 bg-card/40 backdrop-blur-3xl overflow-hidden shadow-2xl shadow-primary/5">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center bg-muted/5 animate-pulse">
              <span className="text-sm text-muted-foreground">
                Loading expenses...
              </span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="bg-muted p-6 rounded-full opacity-50">
                <DollarSign size={32} className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">No expenses recorded</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Expenses added to this group will appear here in a
                  chronological list.
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                size="sm"
                disabled={groups.length === 0}
              >
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[40%]">Expense Title</TableHead>
                  <TableHead>Who paid</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow
                    key={exp._id}
                    className="border-border/10 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{exp.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-primary opacity-70" />
                        <span className="text-sm">
                          {exp.paidBy?._id === user._id ? (
                            <Badge
                              variant="outline"
                              className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5 font-normal"
                            >
                              You paid
                            </Badge>
                          ) : (
                            exp.paidBy?.name || "Unknown"
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs font-mono">
                      {formatDate(exp.createdAt || new Date())}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {formatMoney(exp.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              Add New Expense
            </DialogTitle>
            <DialogDescription>
              Record an expense for{" "}
              <span className="font-semibold text-foreground">
                {groups.find((g) => g._id === selectedGroupId)?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Expense Description</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dinner, Movie, Uber, etc."
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (INR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-70 text-sm">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paid By</Label>
                <Select value={paidBy || user._id} onValueChange={setPaidBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Paid By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={user._id}>You</SelectItem>
                    {groups
                      .find((g) => g._id === selectedGroupId)
                      ?.members.map((m) => {
                        if (m._id !== user._id) {
                          return (
                            <SelectItem key={m._id} value={m._id}>
                              {m.name}
                            </SelectItem>
                          );
                        }
                        return null;
                      })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Split Method</Label>
                <Select value={splitType} onValueChange={setSplitType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Split Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equally</SelectItem>
                    <SelectItem value="custom" disabled>
                      Custom (Coming Soon)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="neon" className="flex-1 font-bold">
                Save Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
