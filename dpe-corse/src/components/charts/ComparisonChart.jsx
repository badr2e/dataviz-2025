import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Building2,
  Home,
  Building,
  Info,
  HelpCircle,
  X,
  MousePointerClick,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/Card";
import { DPE_CLASSES } from "../../utils/colors";

// Category colors and icons
const CATEGORY_CONFIG = {
  existant: {
    icon: Home,
    color: "#0ea5e9",
    lightColor: "rgba(14, 165, 233, 0.1)",
    shortName: "Existant",
  },
  neuf: {
    icon: Building2,
    color: "#22c55e",
    lightColor: "rgba(34, 197, 94, 0.1)",
    shortName: "Neuf",
  },
  tertiaire: {
    icon: Building,
    color: "#f59e0b",
    lightColor: "rgba(245, 158, 11, 0.1)",
    shortName: "Tertiaire",
  },
};

// Introduction section
const IntroSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gradient-to-r from-corsica-50 to-blue-50 dark:from-corsica-900/30 dark:to-blue-900/30 rounded-2xl p-6 border border-corsica-100 dark:border-corsica-800/50"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-corsica-100 dark:bg-corsica-900/50 rounded-xl flex-shrink-0">
        <Info className="w-6 h-6 text-corsica-600 dark:text-corsica-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
          Comparaison par type de bâtiment
        </h2>
        <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
          Les performances énergétiques varient fortement selon le type de
          bâtiment. Les <strong>logements neufs</strong> bénéficient des
          dernières normes (RE2020), tandis que les{" "}
          <strong>logements existants</strong> reflètent l'état du parc ancien
          (RT Existant). Le <strong>secteur tertiaire</strong> (bureaux,
          commerces) présente des besoins énergétiques spécifiques plus élevés.
        </p>
      </div>
    </div>
  </motion.div>
);

// Help modal component
const ComparisonHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-corsica-500" />
              Guide de comparaison
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
            >
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Categories */}
            <div className="flex gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              <div className="p-2 rounded-lg bg-corsica-100 dark:bg-corsica-900/50 h-fit">
                <MousePointerClick className="w-5 h-5 text-corsica-600 dark:text-corsica-400" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                  Sélection des catégories
                </h4>
                <p className="text-sm text-surface-600 dark:text-surface-300">
                  Cliquez sur les cartes de catégorie pour les{" "}
                  <strong>activer/désactiver</strong> dans le graphique. Vous
                  pouvez comparer 2 ou 3 catégories simultanément.
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="flex gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 h-fit">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                  Lecture du graphique
                </h4>
                <p className="text-sm text-surface-600 dark:text-surface-300">
                  Chaque groupe de barres représente une{" "}
                  <strong>classe DPE</strong> (A à G). La hauteur indique le{" "}
                  <strong>pourcentage</strong> de bâtiments dans cette classe
                  pour chaque catégorie.
                </p>
              </div>
            </div>

            {/* Categories explanation */}
            <div className="flex gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 h-fit">
                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                  Les 3 catégories
                </h4>
                <ul className="text-sm text-surface-600 dark:text-surface-300 space-y-1">
                  <li>
                    <strong className="text-sky-500">Existant</strong> :
                    Logements construits avant 2021
                  </li>
                  <li>
                    <strong className="text-green-500">Neuf</strong> : Logements
                    construits depuis 2021
                  </li>
                  <li>
                    <strong className="text-amber-500">Tertiaire</strong> :
                    Bureaux, commerces, bâtiments pro
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// Category card component - compact version for sidebar
const CategoryCard = ({ category, config, isSelected, onClick }) => {
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden
        p-4 rounded-xl cursor-pointer
        border-2 transition-all duration-300
        ${
          isSelected
            ? "border-corsica-500 shadow-lg shadow-corsica-500/20"
            : "border-transparent bg-white/80 dark:bg-surface-800/80 hover:border-surface-200 dark:hover:border-surface-600"
        }
      `}
      style={{
        backgroundColor: isSelected ? config.lightColor : undefined,
      }}
    >
      {/* Background decoration */}
      <div
        className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: config.color }}
      />

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: config.color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white text-sm">
              {category.name}
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {category.count.toLocaleString("fr-FR")} DPE
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-700/50">
            <div className="text-surface-500 dark:text-surface-400">
              Conso. moy.
            </div>
            <div className="font-semibold text-surface-900 dark:text-white">
              {category.avgConsumption} kWh/m²/an
            </div>
          </div>
          <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-700/50">
            <div className="text-surface-500 dark:text-surface-400">
              Classe A
            </div>
            <div className="font-semibold" style={{ color: config.color }}>
              {category.classAPercentage}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Grouped bar chart for DPE distribution comparison
const GroupedBarChart = ({ categories, categoryData }) => {
  const data = useMemo(() => {
    return DPE_CLASSES.map((dpeClass) => {
      const item = { class: dpeClass };
      categories.forEach((cat) => {
        const dist = categoryData[cat]?.distribution?.find(
          (d) => d.class === dpeClass
        );
        item[cat] = dist ? parseFloat(dist.percentage) : 0;
      });
      return item;
    });
  }, [categories, categoryData]);

  return (
    <ResponsiveContainer width="100%" height={370}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis
          dataKey="class"
          tick={{ fill: "#71717a", fontSize: 14, fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
          formatter={(value, name) => [
            `${value.toFixed(1)}%`,
            categoryData[name]?.name || name,
          ]}
        />
        <Legend formatter={(value) => categoryData[value]?.name || value} />
        {categories.includes("existant") && (
          <Bar
            dataKey="existant"
            fill={CATEGORY_CONFIG.existant.color}
            radius={[4, 4, 0, 0]}
          />
        )}
        {categories.includes("neuf") && (
          <Bar
            dataKey="neuf"
            fill={CATEGORY_CONFIG.neuf.color}
            radius={[4, 4, 0, 0]}
          />
        )}
        {categories.includes("tertiaire") && (
          <Bar
            dataKey="tertiaire"
            fill={CATEGORY_CONFIG.tertiaire.color}
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const ComparisonChart = ({ data }) => {
  const [selectedCategories, setSelectedCategories] = useState([
    "existant",
    "neuf",
    "tertiaire",
  ]);
  const [showHelp, setShowHelp] = useState(false);

  // Use data from props (from useDemoData)
  const categoryData = data?.byCategory || {};

  // Calculate totals for percentages in insights
  const totalDPE = Object.values(categoryData).reduce(
    (sum, cat) => sum + (cat.count || 0),
    0
  );

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== catId));
      }
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Calculate percentages for insights
  const existantPct =
    totalDPE > 0
      ? (((categoryData.existant?.count || 0) / totalDPE) * 100).toFixed(0)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Introduction */}
      <IntroSection />

      {/* Main content: Chart + Category cards side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart - 3 columns */}
        <Card delay={0.3} className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Distribution DPE comparée</CardTitle>
                <CardDescription>
                  Pourcentage par classe énergétique selon le type de bâtiment
                </CardDescription>
              </div>
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-corsica-500 transition-colors"
                title="Aide"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              categories={selectedCategories}
              categoryData={categoryData}
            />
          </CardContent>
        </Card>

        {/* Category cards - 1 column on the right */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-surface-500 dark:text-surface-400 px-1">
            Cliquez pour filtrer
          </div>
          {Object.entries(categoryData).map(([id, category], index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <CategoryCard
                category={category}
                config={CATEGORY_CONFIG[id]}
                isSelected={selectedCategories.includes(id)}
                onClick={() => toggleCategory(id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Help Modal */}
      <ComparisonHelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Key insights */}
      <Card delay={0.6}>
        <CardHeader>
          <CardTitle>Analyse comparative</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-4 rounded-xl border-2"
              style={{
                borderColor: CATEGORY_CONFIG.neuf.color,
                backgroundColor: CATEGORY_CONFIG.neuf.lightColor,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2
                  className="w-5 h-5"
                  style={{ color: CATEGORY_CONFIG.neuf.color }}
                />
                <h4 className="font-semibold text-surface-900 dark:text-white">
                  Logements neufs
                </h4>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-300">
                <strong className="text-green-600">
                  {categoryData.neuf?.classAPercentage || 80}% en classe A
                </strong>{" "}
                — Les constructions récentes respectent la réglementation
                thermique RE2020, avec une consommation moyenne de seulement
                <strong>
                  {" "}
                  {categoryData.neuf?.avgConsumption || 48} kWh/m²/an
                </strong>
                .
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-4 rounded-xl border-2"
              style={{
                borderColor: CATEGORY_CONFIG.existant.color,
                backgroundColor: CATEGORY_CONFIG.existant.lightColor,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Home
                  className="w-5 h-5"
                  style={{ color: CATEGORY_CONFIG.existant.color }}
                />
                <h4 className="font-semibold text-surface-900 dark:text-white">
                  Logements existants
                </h4>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-300">
                Le cœur du parc immobilier avec <strong>{existantPct}%</strong>{" "}
                des diagnostics. Distribution centrée sur les classes C-D.{" "}
                <strong>
                  {categoryData.existant?.passoirePercentage || 6.1}% de
                  passoires thermiques
                </strong>{" "}
                à rénover en priorité avant les échéances réglementaires.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="p-4 rounded-xl border-2"
              style={{
                borderColor: CATEGORY_CONFIG.tertiaire.color,
                backgroundColor: CATEGORY_CONFIG.tertiaire.lightColor,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Building
                  className="w-5 h-5"
                  style={{ color: CATEGORY_CONFIG.tertiaire.color }}
                />
                <h4 className="font-semibold text-surface-900 dark:text-white">
                  Tertiaire
                </h4>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-300">
                Distribution plus dispersée avec{" "}
                <strong>
                  {categoryData.tertiaire?.passoirePercentage || 14.4}% de
                  passoires
                </strong>
                . Consommation élevée (
                <strong>
                  {categoryData.tertiaire?.avgConsumption || 382} kWh/m²/an
                </strong>
                ) due aux besoins spécifiques (climatisation, éclairage). Fort
                potentiel d'amélioration.
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ComparisonChart;
