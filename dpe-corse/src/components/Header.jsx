import { motion } from "framer-motion";
import { Zap, BarChart3, Map, GitCompare, LayoutDashboard } from "lucide-react";

// Light switch toggle component
const LightSwitch = ({ isOn, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      className="relative w-14 h-8 rounded-full bg-surface-200 dark:bg-surface-700 p-1 cursor-pointer"
      whileTap={{ scale: 0.95 }}
    >
      {/* Track */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          backgroundColor: isOn ? "#1e293b" : "#f1f5f9",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Switch knob */}
      <motion.div
        className="relative w-6 h-6 rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: isOn ? 24 : 0,
          backgroundColor: isOn ? "#fbbf24" : "#ffffff",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {/* Sun/Moon icon */}
        <motion.svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          animate={{
            rotate: isOn ? 0 : 180,
          }}
          transition={{ duration: 0.3 }}
          fill="none"
          stroke={isOn ? "#1e293b" : "#fbbf24"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOn ? (
            // Moon
            <path
              fill={isOn ? "#1e293b" : "none"}
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            />
          ) : (
            // Sun
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83M12 8a4 4 0 100 8 4 4 0 000-8z" />
          )}
        </motion.svg>
      </motion.div>

      {/* Glow effect when dark */}
      {isOn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-1 rounded-full bg-yellow-400/20 blur-md -z-10"
        />
      )}
    </motion.button>
  );
};

const navItems = [
  { id: "distribution", label: "Distribution", icon: BarChart3 },
  { id: "map", label: "Carte", icon: Map },
  { id: "comparison", label: "Comparaison", icon: GitCompare },
  { id: "overview", label: "Synthèse", icon: LayoutDashboard },
];

export const Header = ({
  darkMode,
  setDarkMode,
  activeView,
  setActiveView,
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        sticky top-0 z-50
        bg-white/70 dark:bg-surface-900/70 backdrop-blur-xl
        border-b border-surface-200/50 dark:border-surface-700/50
        px-6 py-3
      "
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="
              w-10 h-10
              rounded-xl
              bg-gradient-to-br from-corsica-500 to-corsica-700
              flex items-center justify-center
              shadow-lg shadow-corsica-500/25
            "
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-surface-900 dark:text-white">
              DPE <span className="text-gradient">Corse</span>
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-surface-100/80 dark:bg-surface-800/80">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView(item.id)}
                className={`
                  relative
                  flex items-center gap-2
                  px-3 py-2 rounded-lg
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "text-white"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="
                      absolute inset-0
                      bg-gradient-to-r from-corsica-500 to-corsica-600
                      rounded-lg
                      shadow-md shadow-corsica-500/30
                    "
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </span>
              </motion.button>
            );
          })}
        </nav>

        {/* Dark mode toggle - Light switch */}
        <LightSwitch isOn={darkMode} onToggle={() => setDarkMode(!darkMode)} />
      </div>
    </motion.header>
  );
};

export default Header;
