import { motion } from 'framer-motion';
import {
  BarChart3,
  Map,
  GitCompare,
  TrendingUp,
  Home,
  Building2,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { DPE_COLORS } from '../../utils/colors';

// Mini bar chart for distribution with letters below
const MiniDistribution = ({ distribution, height = 40, showLabels = false }) => {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <div className="flex gap-0.5" style={{ height }}>
        {distribution.map((d) => {
          const pct = (d.count / total) * 100;
          return (
            <div
              key={d.class}
              className="relative group flex flex-col"
              style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
            >
              <div
                className="h-full rounded-sm"
                style={{ backgroundColor: DPE_COLORS[d.class] }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {d.class}: {parseFloat(d.percentage).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex gap-0.5 mt-1">
          {distribution.map((d) => {
            const pct = (d.count / total) * 100;
            return (
              <div
                key={d.class}
                className="text-center text-xs font-medium text-surface-600 dark:text-surface-400"
                style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
              >
                {d.class}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Key stat component
const KeyStat = ({ label, value, suffix = '', color = 'corsica', icon: Icon }) => (
  <div className="flex items-center gap-3">
    {Icon && (
      <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
        <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
      </div>
    )}
    <div>
      <div className="text-2xl font-bold text-surface-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        {suffix}
      </div>
      <div className="text-sm text-surface-500 dark:text-surface-400">{label}</div>
    </div>
  </div>
);

// Section recap card
const RecapCard = ({ title, icon: Icon, color, children, delay = 0 }) => (
  <Card delay={delay}>
    <CardHeader>
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export const OverviewChart = ({ data }) => {
  if (!data) return null;

  const { totalDPE, globalDistribution, byCategory, byPeriod, topCommunes } = data;

  // Calculate key metrics
  const performants = globalDistribution
    .filter(d => ['A', 'B'].includes(d.class))
    .reduce((sum, d) => sum + d.count, 0);
  const performantsPct = ((performants / totalDPE) * 100).toFixed(1);

  const passoires = globalDistribution
    .filter(d => ['F', 'G'].includes(d.class))
    .reduce((sum, d) => sum + d.count, 0);
  const passoiresPct = ((passoires / totalDPE) * 100).toFixed(1);

  const classeC = globalDistribution.find(d => d.class === 'C');
  const classeCPct = classeC ? parseFloat(classeC.percentage).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Hero section */}
      <Card delay={0}>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-surface-900 dark:text-white mb-2"
            >
              Vue d'ensemble des DPE en Corse
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto"
            >
              Synthèse des diagnostics de performance énergétique réalisés en Corse.
              Cette vue récapitule les informations clés des différentes analyses.
            </motion.p>
          </div>

          {/* Main stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 rounded-xl bg-corsica-50 dark:bg-corsica-900/30 border border-corsica-200 dark:border-corsica-800"
            >
              <div className="text-3xl font-bold text-corsica-600 dark:text-corsica-400">
                {totalDPE.toLocaleString('fr-FR')}
              </div>
              <div className="text-sm text-corsica-700 dark:text-corsica-300">DPE analysés</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
            >
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {performantsPct}%
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Performants (A+B)</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800"
            >
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {classeCPct}%
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Classe C dominante</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
            >
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {passoiresPct}%
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Passoires (F+G)</div>
            </motion.div>
          </div>

          {/* Global distribution bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="text-sm font-medium text-surface-600 dark:text-surface-300 mb-2">
              Distribution globale
            </div>
            <MiniDistribution distribution={globalDistribution} height={32} showLabels={true} />
          </motion.div>
        </CardContent>
      </Card>

      {/* Recap sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution recap */}
        <RecapCard
          title="Distribution des classes"
          icon={BarChart3}
          color="#0ea5e9"
          delay={0.2}
        >
          <div className="space-y-4">
            <p className="text-sm text-surface-600 dark:text-surface-300">
              La majorité des logements corses se situent en <strong>classe C</strong> ({classeCPct}%),
              reflétant un parc immobilier de qualité moyenne. Les classes A et B représentent {performantsPct}%
              du parc, tandis que {passoiresPct}% sont des passoires thermiques.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {performants.toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">A + B</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {globalDistribution.filter(d => ['C', 'D', 'E'].includes(d.class)).reduce((s, d) => s + d.count, 0).toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">C + D + E</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {passoires.toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-red-700 dark:text-red-300">F + G</div>
              </div>
            </div>
          </div>
        </RecapCard>

        {/* Map recap */}
        <RecapCard
          title="Répartition géographique"
          icon={Map}
          color="#10b981"
          delay={0.3}
        >
          <div className="space-y-4">
            <p className="text-sm text-surface-600 dark:text-surface-300">
              Les DPE se concentrent principalement dans les grandes agglomérations.
              <strong> Ajaccio</strong> et <strong>Bastia</strong> représentent à elles seules
              près de 40% des diagnostics.
            </p>

            <div className="space-y-2">
              {topCommunes?.slice(0, 5).map((commune, i) => (
                <div key={commune.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-surface-400 w-4">{i + 1}</span>
                    <MapPin className="w-3 h-3 text-surface-400" />
                    <span className="text-sm text-surface-700 dark:text-surface-200">{commune.name}</span>
                  </div>
                  <span className="text-sm font-medium text-surface-900 dark:text-white">
                    {commune.count.toLocaleString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </RecapCard>

        {/* Comparison recap */}
        <RecapCard
          title="Comparaison par type"
          icon={GitCompare}
          color="#8b5cf6"
          delay={0.4}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {/* Existant */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Home className="w-4 h-4 text-blue-500 mb-1" />
                <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">Existant</div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-200">
                  {byCategory?.existant?.count?.toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-blue-500 dark:text-blue-400">
                  {byCategory?.existant?.passoirePercentage}% passoires
                </div>
              </div>

              {/* Neuf */}
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Sparkles className="w-4 h-4 text-green-500 mb-1" />
                <div className="text-xs text-green-600 dark:text-green-300 font-medium">Neuf</div>
                <div className="text-lg font-bold text-green-700 dark:text-green-200">
                  {byCategory?.neuf?.count?.toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-green-500 dark:text-green-400">
                  {byCategory?.neuf?.classAPercentage}% classe A
                </div>
              </div>

              {/* Tertiaire */}
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Building2 className="w-4 h-4 text-purple-500 mb-1" />
                <div className="text-xs text-purple-600 dark:text-purple-300 font-medium">Tertiaire</div>
                <div className="text-lg font-bold text-purple-700 dark:text-purple-200">
                  {byCategory?.tertiaire?.count?.toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-purple-500 dark:text-purple-400">
                  {byCategory?.tertiaire?.passoirePercentage}% passoires
                </div>
              </div>
            </div>

            <p className="text-sm text-surface-600 dark:text-surface-300">
              Les <strong>logements neufs</strong> affichent d'excellentes performances
              ({byCategory?.neuf?.classAPercentage}% en classe A), tandis que le <strong>tertiaire</strong> présente
              le plus fort taux de passoires ({byCategory?.tertiaire?.passoirePercentage}%).
            </p>
          </div>
        </RecapCard>

        {/* Evolution recap */}
        <RecapCard
          title="Évolution temporelle"
          icon={TrendingUp}
          color="#f59e0b"
          delay={0.5}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                <div className="text-xs text-surface-500 dark:text-surface-400 mb-1">Avant juillet 2021</div>
                <div className="text-xl font-bold text-surface-900 dark:text-white">
                  {byPeriod?.avant_2021?.count?.toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-surface-500 dark:text-surface-400">
                  ~{Math.round((byPeriod?.avant_2021?.count || 0) / 8).toLocaleString('fr-FR')}/an
                </div>
              </div>
              <div className="p-3 rounded-lg bg-corsica-50 dark:bg-corsica-900/30 border border-corsica-200 dark:border-corsica-800">
                <div className="text-xs text-corsica-600 dark:text-corsica-400 mb-1">Depuis juillet 2021</div>
                <div className="text-xl font-bold text-corsica-700 dark:text-corsica-200">
                  {byPeriod?.depuis_2021?.count?.toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-corsica-500 dark:text-corsica-400">
                  ~{Math.round((byPeriod?.depuis_2021?.count || 0) / 3.5).toLocaleString('fr-FR')}/an
                </div>
              </div>
            </div>

            <p className="text-sm text-surface-600 dark:text-surface-300">
              La réforme DPE de juillet 2021 a multiplié par <strong>7</strong> le volume annuel
              de diagnostics, passant de ~2 000 à ~15 000 DPE/an. Cette hausse reflète
              l'obligation du DPE opposable.
            </p>
          </div>
        </RecapCard>
      </div>
    </motion.div>
  );
};

export default OverviewChart;
