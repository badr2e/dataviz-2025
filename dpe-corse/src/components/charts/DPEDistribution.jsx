import { motion } from 'framer-motion';
import { Building2, Home, TrendingDown, Zap, Info, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { DPE_COLORS, DPE_LABELS } from '../../utils/colors';

// Introduction section explaining what DPE is
const WhatIsDPE = () => (
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
          Qu'est-ce que le DPE ?
        </h2>
        <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
          Le <strong>Diagnostic de Performance Énergétique (DPE)</strong> évalue la consommation
          d'énergie et l'impact environnemental d'un logement. Obligatoire pour toute vente ou
          location, il attribue une étiquette de <strong>A</strong> (très performant) à{' '}
          <strong>G</strong> (passoire thermique). Depuis 2021, les logements classés G sont
          progressivement interdits à la location, suivis des F en 2028 et E en 2034.
        </p>
      </div>
    </div>
  </motion.div>
);

// Data source section
const DataSourceSection = ({ totalDPE }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
    className="bg-gradient-to-r from-surface-50 to-surface-100 dark:from-surface-800/50 dark:to-surface-800/30 rounded-2xl p-6 border border-surface-200 dark:border-surface-700/50"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-surface-200 dark:bg-surface-700 rounded-xl flex-shrink-0">
        <Database className="w-6 h-6 text-surface-600 dark:text-surface-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
          Source des données
        </h2>
        <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
          Les données proviennent de l'<strong>ADEME</strong> (Agence de la transition écologique)
          et couvrent la période 2013-2024. Le jeu de données brut contenait <strong>92 190 DPE</strong> pour
          la Corse, répartis en 5 fichiers : logements existants, logements neufs et bâtiments tertiaires
          (avant et après juillet 2021). Après nettoyage (suppression des DPE sans classe valide A-G,
          sans coordonnées géographiques ou hors périmètre corse), <strong>{totalDPE.toLocaleString('fr-FR')} DPE</strong> ont
          été retenus pour cette analyse.
        </p>
      </div>
    </div>
  </motion.div>
);

// Horizontal bar chart - barres proportionnelles au pourcentage réel
const HorizontalBarChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item.count / total) * 100;
        return (
          <motion.div
            key={item.class}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="flex items-center gap-4"
          >
            {/* DPE Badge */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md flex-shrink-0"
              style={{
                backgroundColor: DPE_COLORS[item.class],
                color: item.class === 'A' || item.class === 'G' ? '#fff' : '#1a1a1a',
              }}
            >
              {item.class}
            </div>

            {/* Bar container */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                  {DPE_LABELS[item.class]}
                </span>
                <span className="text-sm text-surface-500 dark:text-surface-400">
                  {item.count.toLocaleString('fr-FR')} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-8 bg-surface-100 dark:bg-surface-700 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.08, ease: 'easeOut' }}
                  className="h-full rounded-lg"
                  style={{ backgroundColor: DPE_COLORS[item.class] }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export const DPEDistribution = ({ data }) => {
  // Calculate key metrics
  const totalDPE = data.globalDistribution.reduce((a, d) => a + d.count, 0);
  const passoiresCount = data.globalDistribution
    .filter((d) => d.class === 'F' || d.class === 'G')
    .reduce((a, d) => a + d.count, 0);
  const passoiresPercentage = ((passoiresCount / totalDPE) * 100).toFixed(1);

  const performantsCount = data.globalDistribution
    .filter((d) => d.class === 'A' || d.class === 'B')
    .reduce((a, d) => a + d.count, 0);
  const performantsPercentage = ((performantsCount / totalDPE) * 100).toFixed(1);

  // Most common class - calculate percentage dynamically
  const mostCommon = data.globalDistribution.reduce((a, b) =>
    a.count > b.count ? a : b
  );
  const mostCommonPercentage = ((mostCommon.count / totalDPE) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* 1. What is DPE */}
      <WhatIsDPE />

      {/* 2. Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total des DPE"
          value={totalDPE}
          subtitle="diagnostics en Corse"
          icon={Building2}
          color="corsica"
          delay={0}
        />
        <StatCard
          title="Logements performants"
          value={parseFloat(performantsPercentage)}
          suffix="%"
          decimals={1}
          subtitle={`Classes A & B (${performantsCount.toLocaleString('fr-FR')} DPE)`}
          icon={Zap}
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Passoires thermiques"
          value={parseFloat(passoiresPercentage)}
          suffix="%"
          decimals={1}
          subtitle={`Classes F & G (${passoiresCount.toLocaleString('fr-FR')} DPE)`}
          icon={TrendingDown}
          color="red"
          delay={0.2}
        />
        <StatCard
          title="Classe dominante"
          value={mostCommon.class}
          suffix=""
          decimals={0}
          subtitle={`${mostCommonPercentage}% des logements`}
          icon={Home}
          color="yellow"
          delay={0.3}
        />
      </div>

      {/* 3. Main chart + DPE Scale side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart - 3 columns */}
        <Card delay={0.4} className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribution des étiquettes DPE en Corse</CardTitle>
            <CardDescription>
              Répartition des {totalDPE.toLocaleString('fr-FR')} diagnostics de
              performance énergétique par classe (A à G)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={data.globalDistribution} />
          </CardContent>
        </Card>

        {/* DPE Scale - 2 columns */}
        <Card delay={0.5} className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Échelle DPE</CardTitle>
            <CardDescription>
              Consommation en kWh/m²/an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {[
                { class: 'A', range: '≤ 70', color: 'bg-dpe-A', text: 'text-white' },
                { class: 'B', range: '71 - 110', color: 'bg-dpe-B', text: 'text-black' },
                { class: 'C', range: '111 - 180', color: 'bg-dpe-C', text: 'text-black' },
                { class: 'D', range: '181 - 250', color: 'bg-dpe-D', text: 'text-black' },
                { class: 'E', range: '251 - 330', color: 'bg-dpe-E', text: 'text-black' },
                { class: 'F', range: '331 - 420', color: 'bg-dpe-F', text: 'text-black' },
                { class: 'G', range: '> 420', color: 'bg-dpe-G', text: 'text-white' },
              ].map((item, index) => (
                <motion.div
                  key={item.class}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-lg ${item.color} ${item.text} flex items-center justify-center font-bold`}>
                    {item.class}
                  </div>
                  <span className="text-sm text-surface-600 dark:text-surface-300 font-medium">{item.range} kWh/m²/an</span>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-700 space-y-2 text-sm text-surface-500 dark:text-surface-400">
              <p><strong className="text-green-600">{performantsPercentage}%</strong> performants (A-B)</p>
              <p><strong className="text-red-600">{passoiresPercentage}%</strong> passoires thermiques (F-G)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Data source - at the bottom */}
      <DataSourceSection totalDPE={totalDPE} />
    </motion.div>
  );
};

export default DPEDistribution;
