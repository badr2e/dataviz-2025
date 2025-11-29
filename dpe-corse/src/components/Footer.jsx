import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export const Footer = () => {
  const dataLinks = [
    {
      label: "DPE Logements existants",
      url: "https://data.ademe.fr/datasets/dpe03existant",
    },
    {
      label: "DPE Logements neufs",
      url: "https://data.ademe.fr/datasets/dpe02neuf",
    },
    {
      label: "DPE Tertiaire (ancien)",
      url: "https://data.ademe.fr/datasets/dpe01tertiaire",
    },
    {
      label: "DPE Tertiaire (nouveau)",
      url: "https://data.ademe.fr/datasets/dpe-tertiaire",
    },
    { label: "DPE France", url: "https://data.ademe.fr/datasets/dpe-france" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="
        mt-auto
        px-6 py-8
        border-t border-surface-200/50 dark:border-surface-700/50
        bg-white/30 dark:bg-surface-900/30 backdrop-blur-sm
      "
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Contest info */}
          <div className="text-sm text-surface-600 dark:text-surface-400 font-medium">
            Challenge Data Viz’ 2025
          </div>

          {/* Right - Data sources */}
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <span className="text-surface-400 dark:text-surface-500">
              Sources :
            </span>
            <a
              href="https://data.ademe.fr/datasets?topics=BR8GjsXga"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-corsica-600 transition-colors font-medium"
            >
              ADEME Open Data
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
