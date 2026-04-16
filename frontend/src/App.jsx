import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import Expenses from "./pages/Expenses";
import Settlements from "./pages/Settlements";
import PostLoginLanding from "./pages/PostLoginLanding";
import { Button } from "./components/ui/button";
import { GlobalBackground } from "./components/global-background";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black text-2xl animate-pulse">
        SPLITSMART...
      </div>
    );
  return user ? children : <Navigate to="/login" />;
};

const PrivateLayout = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen px-3 py-3 md:px-5 md:py-5 gap-3 md:gap-5">
      {/* Desktop Nav - GLASSMORPHISM */}
      <div className="w-full lg:w-72 glass-nav rounded-3xl p-8 flex flex-col gap-10 sticky top-0 h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2.5rem)] z-50">
        <div className="text-3xl font-black tracking-tighter text-foreground drop-shadow-sm">
          SplitSmart
        </div>
        <nav className="flex flex-col gap-3 flex-1">
          <Button
            asChild
            variant="ghost"
            className="justify-start font-bold h-12 hover:bg-primary/5 rounded-xl transition-all"
          >
            <Link to="/">Dashboard</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="justify-start font-bold h-12 hover:bg-primary/5 rounded-xl transition-all"
          >
            <Link to="/groups">Groups</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="justify-start font-bold h-12 hover:bg-primary/5 rounded-xl transition-all"
          >
            <Link to="/expenses">Expenses</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="justify-start font-bold h-12 hover:bg-primary/5 rounded-xl transition-all"
          >
            <Link to="/settlements">Settlements</Link>
          </Button>
        </nav>
        <div className="pt-8 border-t border-border/20">
          <Button
            variant="ghost"
            className="w-full font-bold h-12 text-destructive hover:bg-destructive/5 rounded-xl transition-all"
            onClick={() => {
              localStorage.removeItem("splitSmartUser");
              window.location.href = "/landing";
            }}
          >
            Logout
          </Button>
        </div>
      </div>
      <main className="glass-shell flex-1 rounded-3xl p-6 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative">
          <GlobalBackground />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/welcome"
              element={
                <PrivateRoute>
                  <PostLoginLanding />
                </PrivateRoute>
              }
            />

            {/* Private Routes with Layout */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <PrivateLayout>
                    <Dashboard />
                  </PrivateLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <PrivateLayout>
                    <Groups />
                  </PrivateLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <PrivateRoute>
                  <PrivateLayout>
                    <Expenses />
                  </PrivateLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settlements"
              element={
                <PrivateRoute>
                  <PrivateLayout>
                    <Settlements />
                  </PrivateLayout>
                </PrivateRoute>
              }
            />

            {/* Catch-all to landing if not logged in */}
            <Route path="*" element={<Navigate to="/landing" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
