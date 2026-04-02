import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { Button } from "../components/ui/button";

const PostLoginLanding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/");
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-shell relative w-full max-w-4xl rounded-3xl p-8 md:p-12 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl"
          animate={{ x: [0, 24, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, -16, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 text-center space-y-6">
          <motion.p
            className="text-xs md:text-sm uppercase tracking-[0.32em] text-muted-foreground font-semibold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Logged In Successfully
          </motion.p>

          <motion.h1
            className="text-4xl md:text-6xl font-black tracking-tight"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, delay: 0.1 }}
          >
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-sm md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            Preparing your dashboard and syncing your latest balances.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-2.5 w-2.5 rounded-full bg-primary"
                animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: dot * 0.12,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          <motion.div
            className="pt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Button
              variant="neon"
              onClick={() => navigate("/")}
              className="min-w-44"
            >
              Continue Now
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PostLoginLanding;
