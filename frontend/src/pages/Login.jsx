import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AlertCircle } from "lucide-react";
import { BackgroundPaths } from "../components/ui/background-paths";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
      navigate("/welcome");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="absolute inset-0 z-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
            S
          </div>
          <h1 className="text-3xl font-black tracking-tighter">SplitSmart</h1>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
            Sign in to your dashboard
          </p>
        </div>

        <Card className="border-border/60 shadow-2xl bg-card/55 backdrop-blur-3xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 animate-in shake-in duration-300">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-11 bg-white/5 border-white/10"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs font-medium text-neutral-500"
                    type="button"
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 bg-white/5 border-white/10"
                />
              </div>
              <Button
                type="submit"
                variant="neon"
                className="w-full h-12 font-bold tracking-tight mt-6 rounded-xl shadow-lg ring-offset-2 ring-primary transition-all"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-border/30 pt-6">
            <div className="text-center text-sm text-muted-foreground font-medium">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline underline-offset-4 font-bold"
              >
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
