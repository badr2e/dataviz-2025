import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import {
  MapPin,
  Search,
  X,
  Home,
  Calendar,
  Ruler,
  ChevronUp,
  ChevronDown,
  MapPinned,
  HelpCircle,
  MousePointer,
  ZoomIn,
  Layers,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/Card";
import {
  DPE_COLORS,
  getClassFromScore,
  DPE_LABELS,
  DPE_RANGES,
  GES_RANGES,
} from "../../utils/colors";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Corsica center coordinates
const CORSICA_CENTER = [42.15, 9.1];
const CORSICA_BOUNDS = [
  [41.3, 8.5],
  [43.0, 9.6],
];

// Create custom DPE icons (cached for performance)
const dpeIcons = {};
["A", "B", "C", "D", "E", "F", "G"].forEach((dpe) => {
  const color = DPE_COLORS[dpe];
  dpeIcons[dpe] = L.divIcon({
    html: `<div style="background-color:${color};width:10px;height:10px;border-radius:50%;border:1px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,0.3)"></div>`,
    className: "dpe-marker",
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
});

// Custom cluster icon
const createClusterCustomIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers();
  const count = markers.length;

  // Calculate average DPE score for color
  const scores = { A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1 };
  const avgScore =
    markers.reduce((sum, m) => sum + (scores[m.options.dpeClass] || 4), 0) /
    count;

  let color;
  if (avgScore >= 5.5) color = DPE_COLORS.A;
  else if (avgScore >= 4.5) color = DPE_COLORS.B;
  else if (avgScore >= 3.5) color = DPE_COLORS.C;
  else if (avgScore >= 3.0) color = DPE_COLORS.D;
  else if (avgScore >= 2.5) color = DPE_COLORS.E;
  else if (avgScore >= 2.0) color = DPE_COLORS.F;
  else color = DPE_COLORS.G;

  const size = count < 100 ? 30 : count < 500 ? 40 : count < 1000 ? 50 : 60;

  return L.divIcon({
    html: `<div style="background-color:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${
      avgScore > 5 || avgScore < 2 ? "#fff" : "#000"
    };font-weight:bold;font-size:${
      size < 40 ? 11 : 13
    }px;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3)">${
      count >= 1000 ? Math.round(count / 1000) + "k" : count
    }</div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(size, size),
  });
};

// Leaflet-native clustering component
const LogementsLayer = ({ logements, onSelectLogement }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    if (!map || !logements.length) return;

    // Remove existing cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    // Create cluster group with native Leaflet
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 50,
      chunkDelay: 20,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 17,
      removeOutsideVisibleBounds: true,
      animate: false,
      iconCreateFunction: createClusterCustomIcon,
    });

    // Add all markers at once
    const markers = logements.map((logement) => {
      const marker = L.marker([logement.lat, logement.lon], {
        icon: dpeIcons[logement.classe_dpe] || dpeIcons.D,
        dpeClass: logement.classe_dpe,
      });
      marker.logementData = logement;
      marker.on("click", () => onSelectLogement(logement));
      return marker;
    });

    clusterGroup.addLayers(markers);
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map, logements, onSelectLogement]);

  return null;
};

// Component to zoom to a location
const ZoomToLocation = ({ location, zoom = 13, forceZoom = false }) => {
  const map = useMap();
  useEffect(() => {
    if (location && location.lat && location.lon) {
      const currentZoom = map.getZoom();
      // Only zoom if forceZoom is true or if we need to zoom in
      const targetZoom = forceZoom ? zoom : Math.max(currentZoom, zoom);
      map.flyTo([location.lat, location.lon], targetZoom, { duration: 0.8 });
    }
  }, [location, zoom, map, forceZoom]);
  return null;
};

// Component to reset map view
const ResetMapView = ({ shouldReset, onReset }) => {
  const map = useMap();
  useEffect(() => {
    if (shouldReset) {
      map.flyTo(CORSICA_CENTER, 8, { duration: 1 });
      onReset();
    }
  }, [shouldReset, map, onReset]);
  return null;
};

// Search component with Portal for dropdown
// Searches communes AND logements by address
const SearchBar = ({
  communes,
  logements,
  onSelectCommune,
  onSelectLogement,
  selectedCommune,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Filter communes
  const filteredCommunes = useMemo(() => {
    if (!query.trim()) return [];
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return communes
      .filter((c) => {
        const nameMatch = c.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(normalizedQuery);
        const codePostalMatch = c.code_postal && c.code_postal.includes(query);
        return nameMatch || codePostalMatch;
      })
      .slice(0, 5);
  }, [query, communes]);

  // Filter logements by address (only if query is 3+ chars)
  const filteredLogements = useMemo(() => {
    if (!query.trim() || query.length < 3) return [];
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return logements
      .filter((l) => {
        if (!l.adresse) return false;
        return l.adresse
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(normalizedQuery);
      })
      .slice(0, 5);
  }, [query, logements]);

  const hasResults =
    filteredCommunes.length > 0 || filteredLogements.length > 0;

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const updatePosition = () => {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen, query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        const dropdown = document.getElementById("commune-search-dropdown");
        if (dropdown && dropdown.contains(e.target)) {
          return;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelectCommune = (commune) => {
    onSelectCommune(commune);
    setQuery(commune.name);
    setIsOpen(false);
  };

  const handleSelectLogement = (logement) => {
    onSelectLogement(logement);
    setQuery(logement.adresse || "");
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    onSelectCommune(null);
  };

  return (
    <div className="relative z-50" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher par commune, code postal ou adresse..."
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-corsica-500 focus:border-transparent outline-none transition-all text-surface-900 dark:text-white placeholder:text-surface-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-100 rounded-lg z-10"
          >
            <X className="w-4 h-4 text-surface-400" />
          </button>
        )}
      </div>

      {/* Dropdown with Portal */}
      {isOpen &&
        hasResults &&
        createPortal(
          <div
            id="commune-search-dropdown"
            className="fixed bg-white dark:bg-surface-800 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-700 max-h-96 overflow-y-auto"
            style={{
              zIndex: 99999,
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
          >
            {/* Communes section */}
            {filteredCommunes.length > 0 && (
              <>
                <div className="px-3 py-2 bg-surface-50 dark:bg-surface-700 text-xs font-semibold text-surface-500 dark:text-surface-400 sticky top-0">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Communes
                </div>
                {filteredCommunes.map((commune) => (
                  <button
                    key={commune.code_insee || commune.name}
                    onClick={() => handleSelectCommune(commune)}
                    className={`w-full px-4 py-3 text-left hover:bg-surface-50 dark:hover:bg-surface-700 flex items-center justify-between border-b border-surface-100 dark:border-surface-700 transition-colors ${
                      selectedCommune?.name === commune.name
                        ? "bg-corsica-50 dark:bg-corsica-900/30"
                        : ""
                    }`}
                  >
                    <div>
                      <span className="font-medium text-surface-900 dark:text-white">
                        {commune.name}
                      </span>
                      <span className="ml-2 text-xs text-surface-400 dark:text-surface-500">
                        {commune.code_postal}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-surface-500 dark:text-surface-400">
                        {commune.nb_dpe.toLocaleString("fr-FR")} DPE
                      </span>
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: DPE_COLORS[commune.classe_dominante],
                          color:
                            commune.classe_dominante === "A" ||
                            commune.classe_dominante === "G"
                              ? "#fff"
                              : "#1a1a1a",
                        }}
                      >
                        {commune.classe_dominante}
                      </span>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Logements section */}
            {filteredLogements.length > 0 && (
              <>
                <div className="px-3 py-2 bg-surface-50 dark:bg-surface-700 text-xs font-semibold text-surface-500 dark:text-surface-400 sticky top-0">
                  <Home className="w-3 h-3 inline mr-1" />
                  Logements
                </div>
                {filteredLogements.map((logement, idx) => (
                  <button
                    key={logement.id || idx}
                    onClick={() => handleSelectLogement(logement)}
                    className="w-full px-4 py-3 text-left hover:bg-surface-50 dark:hover:bg-surface-700 flex items-center justify-between border-b border-surface-100 dark:border-surface-700 last:border-0 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-surface-900 dark:text-white truncate text-sm">
                        {logement.adresse}
                      </div>
                      <div className="text-xs text-surface-400 dark:text-surface-500">
                        {logement.commune}
                        {logement.surface && ` • ${logement.surface} m²`}
                      </div>
                    </div>
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0"
                      style={{
                        backgroundColor: DPE_COLORS[logement.classe_dpe],
                        color:
                          logement.classe_dpe === "A" ||
                          logement.classe_dpe === "G"
                            ? "#fff"
                            : "#1a1a1a",
                      }}
                    >
                      {logement.classe_dpe}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

// Map help modal component
const MapHelpModal = ({ isOpen, onClose }) => {
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
              Guide de la carte
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
            >
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Clusters */}
            <div className="flex gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              <div className="p-2 rounded-lg bg-corsica-100 dark:bg-corsica-900/50 h-fit">
                <Layers className="w-5 h-5 text-corsica-600 dark:text-corsica-400" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                  Clusters colorés
                </h4>
                <p className="text-sm text-surface-600 dark:text-surface-300">
                  Les cercles regroupent plusieurs logements. Leur{" "}
                  <strong>couleur</strong> indique la classe DPE moyenne du
                  groupe (vert = performant, rouge = passoire). Le{" "}
                  <strong>nombre</strong> indique le nombre de DPE.
                </p>
              </div>
            </div>

            {/* Zoom */}
            <div className="flex gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 h-fit">
                <ZoomIn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                  Zoom
                </h4>
                <p className="text-sm text-surface-600 dark:text-surface-300">
                  Zoomez pour voir les logements individuels. Utilisez la{" "}
                  <strong>molette</strong> ou les boutons <strong>+/-</strong>.
                  Double-cliquez pour zoomer rapidement.
                </p>
              </div>
            </div>

            {/* Click */}
            <div className="flex gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 h-fit">
                <MousePointer className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                  Clic sur un logement
                </h4>
                <p className="text-sm text-surface-600 dark:text-surface-300">
                  Cliquez sur un point pour voir les détails :{" "}
                  <strong>classe DPE</strong>,
                  <strong> consommation énergétique</strong>,{" "}
                  <strong>émissions GES</strong>, surface et année de
                  construction.
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 h-fit">
                <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                  Recherche
                </h4>
                <p className="text-sm text-surface-600 dark:text-surface-300">
                  Utilisez la barre de recherche pour trouver une{" "}
                  <strong>commune</strong> (par nom ou code postal) ou une{" "}
                  <strong>adresse</strong> spécifique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// Commune details content
const CommuneDetailsContent = ({ commune, onClose }) => {
  const dpeClass = getClassFromScore(commune.score_moyen);
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm"
            style={{
              backgroundColor: DPE_COLORS[dpeClass],
              color: dpeClass === "A" || dpeClass === "G" ? "#fff" : "#1a1a1a",
            }}
          >
            {dpeClass}
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">
              {commune.name}
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {commune.nb_dpe.toLocaleString("fr-FR")} DPE
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
        >
          <X className="w-4 h-4 text-surface-400" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-700">
          <div className="text-xs text-surface-500 dark:text-surface-400">
            Score
          </div>
          <div className="font-bold text-surface-900 dark:text-white">
            {commune.score_moyen.toFixed(1)}/7
          </div>
        </div>
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30">
          <div className="text-xs text-red-600 dark:text-red-400">
            Passoires
          </div>
          <div className="font-bold text-red-700 dark:text-red-300">
            {commune.passoires_pct}%
          </div>
        </div>
      </div>
      <div className="flex gap-0.5">
        {["A", "B", "C", "D", "E", "F", "G"].map((c) => {
          const pct = (commune.distribution[c] / commune.nb_dpe) * 100;
          return (
            <div
              key={c}
              className="flex-1 text-center"
              title={`${c}: ${pct.toFixed(1)}%`}
            >
              <div className="h-8 rounded-sm relative overflow-hidden bg-surface-100 dark:bg-surface-700">
                <div
                  className="absolute bottom-0 w-full"
                  style={{
                    height: `${Math.max(pct, 3)}%`,
                    backgroundColor: DPE_COLORS[c],
                  }}
                />
              </div>
              <div className="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5">
                {c}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Logement details content
const LogementDetailsContent = ({ logement, onClose }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-md"
            style={{
              backgroundColor: DPE_COLORS[logement.classe_dpe],
              color:
                logement.classe_dpe === "A" || logement.classe_dpe === "G"
                  ? "#fff"
                  : "#1a1a1a",
            }}
          >
            {logement.classe_dpe}
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">
              {DPE_LABELS[logement.classe_dpe]}
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {logement.commune || "Commune inconnue"}
              {logement.code_postal && ` (${logement.code_postal})`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
        >
          <X className="w-4 h-4 text-surface-400" />
        </button>
      </div>
      {logement.adresse && (
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-start gap-2">
          <MapPinned className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            {logement.adresse}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 p-3 rounded-xl bg-surface-50 dark:bg-surface-700">
          <div className="text-xs text-surface-500 dark:text-surface-400 mb-1">
            Énergie (DPE)
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0"
              style={{
                backgroundColor: DPE_COLORS[logement.classe_dpe],
                color:
                  logement.classe_dpe === "A" || logement.classe_dpe === "G"
                    ? "#fff"
                    : "#1a1a1a",
              }}
            >
              {logement.classe_dpe}
            </span>
            <span className="text-sm text-surface-600 dark:text-surface-300">
              {DPE_RANGES[logement.classe_dpe]} kWh/m²/an
            </span>
          </div>
        </div>
        {logement.classe_ges && (
          <div className="flex-1 p-3 rounded-xl bg-surface-50 dark:bg-surface-700">
            <div className="text-xs text-surface-500 dark:text-surface-400 mb-1">
              GES
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0"
                style={{
                  backgroundColor: DPE_COLORS[logement.classe_ges],
                  color:
                    logement.classe_ges === "A" || logement.classe_ges === "G"
                      ? "#fff"
                      : "#1a1a1a",
                }}
              >
                {logement.classe_ges}
              </span>
              <span className="text-sm text-surface-600 dark:text-surface-300">
                {GES_RANGES[logement.classe_ges]} kg CO₂/m²/an
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {logement.surface && (
          <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-700 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-surface-400" />
            <div>
              <div className="text-xs text-surface-500 dark:text-surface-400">
                Surface
              </div>
              <div className="font-semibold text-surface-900 dark:text-white">
                {logement.surface} m²
              </div>
            </div>
          </div>
        )}
        {logement.annee && (
          <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-surface-400" />
            <div>
              <div className="text-xs text-surface-500 dark:text-surface-400">
                Construction
              </div>
              <div className="font-semibold text-surface-900 dark:text-white">
                {logement.annee}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Communes table
const CommunesTable = ({
  communes,
  selectedCommune,
  onSelectCommune,
  sortConfig,
  onSort,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const getClassScore = (classe) =>
    ({ A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1 }[classe] || 0);

  const sortedCommunes = useMemo(() => {
    const sorted = [...communes];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (sortConfig.key === "name")
          return sortConfig.direction === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        const aVal =
          sortConfig.key === "classe_dominante"
            ? getClassScore(a.classe_dominante)
            : a[sortConfig.key];
        const bVal =
          sortConfig.key === "classe_dominante"
            ? getClassScore(b.classe_dominante)
            : b[sortConfig.key];
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return sorted;
  }, [communes, sortConfig]);

  const totalPages = Math.ceil(sortedCommunes.length / itemsPerPage);
  const paginatedCommunes = sortedCommunes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ column }) =>
    sortConfig.key === column ? (
      sortConfig.direction === "asc" ? (
        <ChevronUp className="w-4 h-4 inline ml-0.5 text-corsica-500" />
      ) : (
        <ChevronDown className="w-4 h-4 inline ml-0.5 text-corsica-500" />
      )
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-0.5 opacity-30" />
    );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-700">
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-surface-500 cursor-pointer hover:text-surface-700 select-none"
                onClick={() =>
                  onSort({
                    key: "name",
                    direction:
                      sortConfig.key === "name" &&
                      sortConfig.direction === "desc"
                        ? "asc"
                        : "desc",
                  })
                }
              >
                Commune <SortIcon column="name" />
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-surface-500 cursor-pointer hover:text-surface-700 select-none"
                onClick={() =>
                  onSort({
                    key: "nb_dpe",
                    direction:
                      sortConfig.key === "nb_dpe" &&
                      sortConfig.direction === "desc"
                        ? "asc"
                        : "desc",
                  })
                }
              >
                Nb DPE <SortIcon column="nb_dpe" />
              </th>
              <th
                className="text-center py-3 px-4 text-sm font-semibold text-surface-500 cursor-pointer hover:text-surface-700 select-none"
                onClick={() =>
                  onSort({
                    key: "classe_dominante",
                    direction:
                      sortConfig.key === "classe_dominante" &&
                      sortConfig.direction === "desc"
                        ? "asc"
                        : "desc",
                  })
                }
              >
                Classe <SortIcon column="classe_dominante" />
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-surface-500 cursor-pointer hover:text-surface-700 select-none"
                onClick={() =>
                  onSort({
                    key: "score_moyen",
                    direction:
                      sortConfig.key === "score_moyen" &&
                      sortConfig.direction === "desc"
                        ? "asc"
                        : "desc",
                  })
                }
              >
                Score <SortIcon column="score_moyen" />
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-surface-500 cursor-pointer hover:text-surface-700 select-none"
                onClick={() =>
                  onSort({
                    key: "passoires_pct",
                    direction:
                      sortConfig.key === "passoires_pct" &&
                      sortConfig.direction === "desc"
                        ? "asc"
                        : "desc",
                  })
                }
              >
                Passoires <SortIcon column="passoires_pct" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCommunes.map((commune) => (
              <tr
                key={commune.name}
                className={`border-b border-surface-100 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors ${
                  selectedCommune?.name === commune.name
                    ? "bg-corsica-50 dark:bg-corsica-900/30"
                    : ""
                }`}
                onClick={() => onSelectCommune(commune)}
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-surface-900 dark:text-white">
                    {commune.name}
                  </span>{" "}
                  <span className="text-xs text-surface-400 dark:text-surface-500">
                    {commune.departement}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-surface-700 dark:text-surface-300">
                  {commune.nb_dpe.toLocaleString("fr-FR")}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm"
                    style={{
                      backgroundColor: DPE_COLORS[commune.classe_dominante],
                      color:
                        commune.classe_dominante === "A" ||
                        commune.classe_dominante === "G"
                          ? "#fff"
                          : "#1a1a1a",
                    }}
                  >
                    {commune.classe_dominante}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-surface-700 dark:text-surface-300">
                  {commune.score_moyen.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`font-medium ${
                      commune.passoires_pct > 10
                        ? "text-red-600 dark:text-red-400"
                        : "text-surface-700 dark:text-surface-300"
                    }`}
                  >
                    {commune.passoires_pct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
        <div className="text-sm text-surface-500 dark:text-surface-400">
          {sortedCommunes.length} communes • Page {currentPage}/{totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

// Full-screen loading overlay with spinning wheel
const LoadingOverlay = () => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm"
      style={{ cursor: "wait", pointerEvents: "all" }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Spinning loader */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-surface-200 dark:border-surface-700" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-corsica-500 animate-spin" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-1">
            Chargement de la carte
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            70 590 diagnostics DPE en Corse
          </p>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

export const CorsicaMap = () => {
  const [communes, setCommunes] = useState([]);
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [selectedLogement, setSelectedLogement] = useState(null);
  const [resetView, setResetView] = useState(false);
  const [shouldCenterOnLogement, setShouldCenterOnLogement] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "nb_dpe",
    direction: "desc",
  });
  const mapRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch("/communes_dpe.json").then((r) => r.json()),
      fetch("/logements_dpe.json").then((r) => r.json()),
    ])
      .then(([communesData, logementsData]) => {
        setCommunes(communesData.communes.filter((c) => c.lat && c.lon));
        setLogements(logementsData.logements || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  const handleCommuneSelect = (commune) => {
    setSelectedCommune(commune);
    setSelectedLogement(null);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Find commune for a logement and select both
  // fromSearch: if true, will center map on the logement
  const handleLogementSelect = useCallback(
    (logement, fromSearch = false) => {
      setSelectedLogement(logement);
      setShouldCenterOnLogement(fromSearch);
      // Find matching commune by name (case-insensitive)
      if (logement.commune) {
        const communeName = logement.commune
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const matchingCommune = communes.find(
          (c) =>
            c.name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") === communeName
        );
        if (matchingCommune) {
          setSelectedCommune(matchingCommune);
        }
      }
    },
    [communes]
  );

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Search */}
      <Card delay={0.35}>
        <CardContent className="py-4">
          <SearchBar
            communes={communes}
            logements={logements}
            onSelectCommune={(c) => {
              setSelectedCommune(c);
              setSelectedLogement(null);
              setShouldCenterOnLogement(false);
            }}
            onSelectLogement={(l) => handleLogementSelect(l, true)}
            selectedCommune={selectedCommune}
          />
        </CardContent>
      </Card>

      {/* Map - Full width with sliding panel */}
      <Card ref={mapRef} delay={0.4}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle>Carte interactive des DPE</CardTitle>
                <CardDescription>
                  {logements.length.toLocaleString("fr-FR")} DPE disponibles en
                  Corse
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
            <div className="flex items-center gap-2">
              {(selectedCommune || selectedLogement) && (
                <button
                  onClick={() => {
                    setSelectedCommune(null);
                    setSelectedLogement(null);
                    setResetView(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                >
                  Vue globale
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Help Modal */}
        <MapHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        <CardContent>
          <div className="relative">
            {/* Map container with smooth width transition */}
            <div
              className="transition-all duration-500 ease-out"
              style={{
                marginRight:
                  selectedCommune || selectedLogement ? "340px" : "0",
              }}
            >
              <div className="h-[550px] rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
                <MapContainer
                  center={CORSICA_CENTER}
                  zoom={8}
                  style={{ height: "100%", width: "100%" }}
                  maxBounds={CORSICA_BOUNDS}
                  minZoom={7}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Zoom only when searching */}
                  {shouldCenterOnLogement && selectedLogement && (
                    <ZoomToLocation
                      location={selectedLogement}
                      zoom={17}
                      forceZoom={true}
                    />
                  )}
                  {!shouldCenterOnLogement &&
                    !selectedLogement &&
                    selectedCommune && (
                      <ZoomToLocation
                        location={selectedCommune}
                        zoom={12}
                        forceZoom={true}
                      />
                    )}
                  <ResetMapView
                    shouldReset={resetView}
                    onReset={() => setResetView(false)}
                  />

                  <LogementsLayer
                    logements={logements}
                    onSelectLogement={handleLogementSelect}
                  />
                </MapContainer>
              </div>
            </div>

            {/* Sliding details panel */}
            <AnimatePresence>
              {(selectedCommune || selectedLogement) && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute top-0 right-0 w-[320px] h-[550px] overflow-y-auto rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-lg"
                >
                  <div className="p-4 space-y-4">
                    {/* Commune section */}
                    {selectedCommune && (
                      <div>
                        <div className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">
                          Commune
                        </div>
                        <CommuneDetailsContent
                          commune={selectedCommune}
                          onClose={() => {
                            setSelectedCommune(null);
                            setSelectedLogement(null);
                            setResetView(true);
                          }}
                        />
                      </div>
                    )}

                    {/* Separator if both are selected */}
                    {selectedCommune && selectedLogement && (
                      <div className="border-t border-surface-200 dark:border-surface-700" />
                    )}

                    {/* Logement section */}
                    {selectedLogement && (
                      <div>
                        <div className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">
                          Logement
                        </div>
                        <LogementDetailsContent
                          logement={selectedLogement}
                          onClose={() => setSelectedLogement(null)}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="text-surface-500 dark:text-surface-400 font-medium">
                Légende DPE:
              </span>
              {["A", "B", "C", "D", "E", "F", "G"].map((c) => (
                <div key={c} className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: DPE_COLORS[c] }}
                  />
                  <span className="text-surface-600 dark:text-surface-300">
                    {c}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card delay={0.7}>
        <CardHeader>
          <CardTitle>Communes de Corse</CardTitle>
          <CardDescription>
            Cliquez sur une commune pour voir ses informations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommunesTable
            communes={communes}
            selectedCommune={selectedCommune}
            onSelectCommune={handleCommuneSelect}
            sortConfig={sortConfig}
            onSort={setSortConfig}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CorsicaMap;
