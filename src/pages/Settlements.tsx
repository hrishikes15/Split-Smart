import { useState, useEffect, useContext } from "react";
import { Handshake, ArrowRight, User, Info, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const Settlements = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [balances, setBalances] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await api.get("/groups");
        setGroups(data);
        if (data.length > 0) {
          setSelectedGroupId(data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching groups", err);
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
          api.get(`/groups/${selectedGroupId}/settlements`),
        ]);
        setBalances(balRes.data);
        setSettlements(setRes.data);
      } catch (err) {
        console.error("Error fetching settlements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGroupId]);

  const formatMoney = (valInPaise: number) => {
    return (valInPaise / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const myBalance = balances ? balances[user._id] : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-4 z-20 py-4 px-4 rounded-2xl border border-border/45 bg-card/40 backdrop-blur-2xl shadow-[0_10px_30px_hsl(var(--glass-shadow))]">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Settlements
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Group
            </span>
            {groups.length > 0 && (
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger className="h-8 w-fit min-w-[140px] border border-border/45 bg-card/50 hover:bg-card/70 font-bold text-xs py-0 px-3 transition-all">
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-32 animate-pulse bg-muted/20" />
          <Card className="h-32 animate-pulse bg-muted/20" />
          <Card className="col-span-full h-64 animate-pulse bg-muted/20" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-destructive/50 overflow-hidden bg-card/40 backdrop-blur-3xl border-border/20 shadow-2xl shadow-destructive/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-destructive dark:text-red-400">
                  <ArrowRight size={12} className="rotate-180" /> You Owe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myBalance < 0 ? (
                  <div className="text-3xl font-black tracking-tighter text-destructive">
                    {formatMoney(Math.abs(myBalance))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60 font-medium italic">
                    You're all paid up!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500/50 overflow-hidden bg-card/40 backdrop-blur-3xl border-border/20 shadow-2xl shadow-emerald-500/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-emerald-500">
                  <ArrowRight size={12} /> Owed to You
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myBalance > 0 ? (
                  <div className="text-3xl font-black tracking-tighter text-emerald-500">
                    {formatMoney(myBalance)}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60 font-medium italic">
                    Nobody owes you currently.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/20 bg-card/40 backdrop-blur-3xl shadow-2xl shadow-primary/5">
            <CardHeader className="border-b border-border/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Handshake className="text-primary h-5 w-5" />
                    Suggested Optimal Settlements
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground/60">
                    Optimized transactions to clear all debts in the minimum
                    number of steps.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors"
                >
                  {settlements.length} Transactions
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {settlements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black tracking-tight text-foreground">
                      Perfectly Balanced
                    </p>
                    <p className="text-sm text-muted-foreground font-medium italic">
                      All debts are cleared within this group!
                    </p>
                  </div>
                  <Button variant="neon" asChild className="mt-4">
                    <Link to="/expenses">Add New Expense</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {settlements.map((s, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between p-4 rounded-xl border border-border/10 bg-white/5 hover:bg-white/10 transition-all hover:shadow-xl hover:shadow-primary/5"
                    >
                      <div className="flex items-center gap-3 md:gap-6 flex-1">
                        <div className="flex flex-col items-center gap-1 w-16 md:w-20">
                          <Avatar className="h-10 w-10 ring-2 ring-background border border-border shadow-sm">
                            <AvatarFallback className="bg-muted text-[10px] font-bold">
                              {s.from._id === user?._id
                                ? "YOU"
                                : s.from.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase text-center truncate w-full">
                            {s.from._id === user?._id ? "You" : s.from.name}
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 flex-1 max-w-[100px] md:max-w-none">
                          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent relative">
                            <ArrowRight
                              size={14}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary"
                            />
                          </div>
                          <span className="text-[9px] font-black tracking-widest text-primary/40 uppercase">
                            pays
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 w-16 md:w-20">
                          <Avatar className="h-10 w-10 ring-2 ring-background border border-border shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                              {s.to._id === user?._id
                                ? "YOU"
                                : s.to.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase text-center truncate w-full">
                            {s.to._id === user?._id ? "You" : s.to.name}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="text-lg md:text-xl font-black tracking-tighter text-foreground tabular-nums drop-shadow-sm">
                          {formatMoney(s.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {settlements.length > 0 && (
              <CardFooter className="bg-muted/5 border-t border-border/30 px-6 py-4 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <Info size={16} />
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed font-medium">
                  This optimized settlement plan reduces the total number of
                  payments needed. Users can pay anyone in the group as long as
                  the net balance of each user remains correct.
                </div>
              </CardFooter>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Settlements;
