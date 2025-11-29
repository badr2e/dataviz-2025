import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import Header from './components/Header';
import Footer from './components/Footer';
import DPEDistribution from './components/charts/DPEDistribution';
import CorsicaMap from './components/charts/CorsicaMap';
import ComparisonChart from './components/charts/ComparisonChart';
import OverviewChart from './components/charts/OverviewChart';
import { useDemoData } from './hooks/useData';

// Loading screen component
const LoadingScreen = ({ progress }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gradient-to-br from-corsica-50 to-surface-100 flex items-center justify-center z-50"
  >
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="mx-auto mb-6"
      >
        <Loader2 className="w-12 h-12 text-corsica-500" />
      </motion.div>
      <h2 className="text-2xl font-bold text-surface-900 mb-2">
        DPE Corse
      </h2>
      <p className="text-surface-500 mb-4">Chargement des données DPE...</p>
      <div className="w-64 h-2 bg-surface-200 rounded-full overflow-hidden mx-auto">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(progress?.loaded / progress?.total) * 100 || 0}%` }}
          className="h-full bg-corsica-500 rounded-full"
        />
      </div>
      <p className="text-sm text-surface-400 mt-2">
        {progress?.loaded || 0} / {progress?.total || 5} fichiers
      </p>
    </div>
  </motion.div>
);

// Error screen component
const ErrorScreen = ({ error, onRetry }) => (
  <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">
        Erreur de chargement
      </h2>
      <p className="text-surface-500 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-corsica-500 text-white rounded-xl font-medium hover:bg-corsica-600 transition-colors"
      >
        Réessayer
      </button>
    </div>
  </div>
);

// Main App component
function App() {
  const [activeView, setActiveView] = useState('distribution');
  const [darkMode, setDarkMode] = useState(false);

  // Use demo data (pre-computed from analysis)
  const { data, loading, error } = useDemoData();

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Show loading screen
  if (loading) {
    return <LoadingScreen progress={{ loaded: 3, total: 5 }} />;
  }

  // Show error screen
  if (error) {
    return <ErrorScreen error={error} onRetry={() => window.location.reload()} />;
  }

  // Render active view
  const renderView = () => {
    const viewProps = { data };

    switch (activeView) {
      case 'distribution':
        return <DPEDistribution {...viewProps} />;
      case 'map':
        return <CorsicaMap {...viewProps} />;
      case 'comparison':
        return <ComparisonChart {...viewProps} />;
      case 'overview':
        return <OverviewChart {...viewProps} />;
      default:
        return <DPEDistribution {...viewProps} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-surface-50 via-white to-corsica-50/30 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-corsica-200/30 dark:bg-corsica-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      {/* Header with Navigation */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
