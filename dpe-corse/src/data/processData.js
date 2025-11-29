import Papa from 'papaparse';
import { DPE_CLASSES, getDPEScore } from '../utils/colors';

// File configurations with column mappings
const FILE_CONFIGS = {
  'logements_avant_2021': {
    name: 'Logements (avant juillet 2021)',
    shortName: 'Logements avant 2021',
    category: 'existant',
    period: 'avant_2021',
    columns: {
      dpe: 'classe_consommation_energie',
      ges: 'classe_estimation_ges',
      consumption: 'consommation_energie',
      surface: 'surface_thermique_lot',
      commune: 'code_insee_commune_actualise',
      department: 'tv016_departement_code',
      year: 'annee_construction',
      type: 'tr002_type_batiment_description',
      date: 'date_etablissement_dpe',
    }
  },
  'logements_existants_depuis_2021': {
    name: 'Logements existants (depuis juillet 2021)',
    shortName: 'Logements existants',
    category: 'existant',
    period: 'depuis_2021',
    columns: {
      dpe: 'etiquette_dpe',
      ges: 'etiquette_ges',
      consumption: 'conso_5_usages_par_m2_ep',
      surface: 'surface_habitable_logement',
      commune: 'nom_commune_ban',
      department: 'code_departement_ban',
      year: 'annee_construction',
      type: 'type_batiment',
      date: 'date_etablissement_dpe',
      heating: 'type_energie_principale_chauffage',
    }
  },
  'logements_neufs': {
    name: 'Logements neufs (depuis juillet 2021)',
    shortName: 'Logements neufs',
    category: 'neuf',
    period: 'depuis_2021',
    columns: {
      dpe: 'etiquette_dpe',
      ges: 'etiquette_ges',
      consumption: 'conso_5_usages_par_m2_ep',
      surface: 'surface_habitable_logement',
      commune: 'nom_commune_ban',
      department: 'code_departement_ban',
      type: 'type_batiment',
      date: 'date_etablissement_dpe',
      heating: 'type_energie_principale_chauffage',
    }
  },
  'tertiaire_avant_2021': {
    name: 'Tertiaire (avant juillet 2021)',
    shortName: 'Tertiaire avant 2021',
    category: 'tertiaire',
    period: 'avant_2021',
    columns: {
      dpe: 'classe_consommation_energie',
      ges: 'classe_estimation_ges',
      consumption: 'consommation_energie',
      surface: 'surface_habitable',
      commune: 'commune',
      department: 'tv016_departement_code',
      year: 'annee_construction',
      type: 'tr002_type_batiment_description',
      date: 'date_etablissement_dpe',
    }
  },
  'tertiaire_depuis_2021': {
    name: 'Tertiaire (depuis juillet 2021)',
    shortName: 'Tertiaire depuis 2021',
    category: 'tertiaire',
    period: 'depuis_2021',
    columns: {
      dpe: 'etiquette_dpe',
      ges: 'etiquette_ges',
      consumption: 'conso_kwhep_m2_an',
      surface: 'surface_utile',
      commune: 'nom_commune_ban',
      department: 'code_departement_ban',
      year: 'annee_construction',
      date: 'date_etablissement_dpe',
      heating: 'type_energie_principale_chauffage',
    }
  }
};

// Parse CSV file
const parseCSV = (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
};

// Calculate DPE distribution
const calculateDPEDistribution = (data, dpeColumn) => {
  const distribution = {};
  DPE_CLASSES.forEach(c => distribution[c] = 0);

  data.forEach(row => {
    const dpe = row[dpeColumn]?.toUpperCase()?.trim();
    if (DPE_CLASSES.includes(dpe)) {
      distribution[dpe]++;
    }
  });

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return DPE_CLASSES.map(dpeClass => ({
    class: dpeClass,
    count: distribution[dpeClass],
    percentage: total > 0 ? ((distribution[dpeClass] / total) * 100).toFixed(1) : 0,
  }));
};

// Calculate average consumption
const calculateAverageConsumption = (data, consumptionColumn) => {
  const validValues = data
    .map(row => parseFloat(row[consumptionColumn]))
    .filter(v => !isNaN(v) && v > 0 && v < 10000);

  if (validValues.length === 0) return null;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
};

// Calculate average surface
const calculateAverageSurface = (data, surfaceColumn) => {
  const validValues = data
    .map(row => parseFloat(row[surfaceColumn]))
    .filter(v => !isNaN(v) && v > 0 && v < 10000);

  if (validValues.length === 0) return null;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
};

// Calculate passoire thermique percentage
const calculatePassoirePercentage = (data, dpeColumn) => {
  const total = data.filter(row => {
    const dpe = row[dpeColumn]?.toUpperCase()?.trim();
    return DPE_CLASSES.includes(dpe);
  }).length;

  const passoires = data.filter(row => {
    const dpe = row[dpeColumn]?.toUpperCase()?.trim();
    return dpe === 'F' || dpe === 'G';
  }).length;

  return total > 0 ? (passoires / total) * 100 : 0;
};

// Calculate class A percentage
const calculateClassAPercentage = (data, dpeColumn) => {
  const total = data.filter(row => {
    const dpe = row[dpeColumn]?.toUpperCase()?.trim();
    return DPE_CLASSES.includes(dpe);
  }).length;

  const classA = data.filter(row => {
    const dpe = row[dpeColumn]?.toUpperCase()?.trim();
    return dpe === 'A';
  }).length;

  return total > 0 ? (classA / total) * 100 : 0;
};

// Calculate commune statistics
const calculateCommuneStats = (data, config) => {
  const communeData = {};
  const { columns } = config;

  data.forEach(row => {
    let commune = row[columns.commune];
    if (!commune) return;

    // Normalize commune name
    commune = commune.toString().toUpperCase().trim();

    if (!communeData[commune]) {
      communeData[commune] = {
        name: commune,
        dpeScores: [],
        consumptions: [],
        count: 0,
      };
    }

    communeData[commune].count++;

    const dpe = row[columns.dpe]?.toUpperCase()?.trim();
    if (DPE_CLASSES.includes(dpe)) {
      communeData[commune].dpeScores.push(getDPEScore(dpe));
    }

    const consumption = parseFloat(row[columns.consumption]);
    if (!isNaN(consumption) && consumption > 0 && consumption < 10000) {
      communeData[commune].consumptions.push(consumption);
    }
  });

  // Calculate averages
  return Object.values(communeData)
    .filter(c => c.count >= 5) // Minimum 5 DPE per commune
    .map(commune => ({
      name: commune.name,
      count: commune.count,
      avgScore: commune.dpeScores.length > 0
        ? commune.dpeScores.reduce((a, b) => a + b, 0) / commune.dpeScores.length
        : null,
      avgConsumption: commune.consumptions.length > 0
        ? commune.consumptions.reduce((a, b) => a + b, 0) / commune.consumptions.length
        : null,
    }))
    .sort((a, b) => b.count - a.count);
};

// Calculate building type distribution
const calculateBuildingTypes = (data, typeColumn) => {
  const types = {};

  data.forEach(row => {
    let type = row[typeColumn]?.toString().toLowerCase().trim();
    if (!type) return;

    // Normalize type names
    if (type.includes('maison')) type = 'Maison';
    else if (type.includes('appartement')) type = 'Appartement';
    else if (type.includes('logement')) type = 'Logement';
    else type = 'Autre';

    types[type] = (types[type] || 0) + 1;
  });

  return Object.entries(types)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

// Calculate yearly distribution
const calculateYearlyDistribution = (data, config) => {
  const { columns } = config;
  const yearly = {};

  data.forEach(row => {
    const dateStr = row[columns.date];
    if (!dateStr) return;

    const year = dateStr.substring(0, 4);
    const dpe = row[columns.dpe]?.toUpperCase()?.trim();

    if (!DPE_CLASSES.includes(dpe)) return;

    if (!yearly[year]) {
      yearly[year] = {};
      DPE_CLASSES.forEach(c => yearly[year][c] = 0);
    }

    yearly[year][dpe]++;
  });

  return Object.entries(yearly)
    .map(([year, distribution]) => ({
      year,
      ...distribution,
      total: Object.values(distribution).reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => a.year.localeCompare(b.year));
};

// Process a single file
export const processFile = async (fileKey, csvText) => {
  const config = FILE_CONFIGS[fileKey];
  if (!config) throw new Error(`Unknown file key: ${fileKey}`);

  const data = await parseCSV(csvText);
  const { columns } = config;

  return {
    key: fileKey,
    name: config.name,
    shortName: config.shortName,
    category: config.category,
    period: config.period,
    totalCount: data.length,
    dpeDistribution: calculateDPEDistribution(data, columns.dpe),
    avgConsumption: calculateAverageConsumption(data, columns.consumption),
    avgSurface: calculateAverageSurface(data, columns.surface),
    passoirePercentage: calculatePassoirePercentage(data, columns.dpe),
    classAPercentage: calculateClassAPercentage(data, columns.dpe),
    communeStats: calculateCommuneStats(data, config),
    buildingTypes: columns.type ? calculateBuildingTypes(data, columns.type) : [],
    yearlyDistribution: calculateYearlyDistribution(data, config),
  };
};

// Aggregate all data for global statistics
export const aggregateData = (processedFiles) => {
  // Global DPE distribution
  const globalDistribution = {};
  DPE_CLASSES.forEach(c => globalDistribution[c] = 0);

  processedFiles.forEach(file => {
    file.dpeDistribution.forEach(d => {
      globalDistribution[d.class] += d.count;
    });
  });

  const globalTotal = Object.values(globalDistribution).reduce((a, b) => a + b, 0);

  // By category
  const byCategory = {
    existant: { count: 0, distribution: {} },
    neuf: { count: 0, distribution: {} },
    tertiaire: { count: 0, distribution: {} },
  };

  DPE_CLASSES.forEach(c => {
    byCategory.existant.distribution[c] = 0;
    byCategory.neuf.distribution[c] = 0;
    byCategory.tertiaire.distribution[c] = 0;
  });

  processedFiles.forEach(file => {
    byCategory[file.category].count += file.totalCount;
    file.dpeDistribution.forEach(d => {
      byCategory[file.category].distribution[d.class] += d.count;
    });
  });

  // By period
  const byPeriod = {
    avant_2021: { count: 0, distribution: {} },
    depuis_2021: { count: 0, distribution: {} },
  };

  DPE_CLASSES.forEach(c => {
    byPeriod.avant_2021.distribution[c] = 0;
    byPeriod.depuis_2021.distribution[c] = 0;
  });

  processedFiles.forEach(file => {
    byPeriod[file.period].count += file.totalCount;
    file.dpeDistribution.forEach(d => {
      byPeriod[file.period].distribution[d.class] += d.count;
    });
  });

  // Aggregate commune data
  const allCommunes = {};
  processedFiles.forEach(file => {
    file.communeStats.forEach(commune => {
      if (!allCommunes[commune.name]) {
        allCommunes[commune.name] = {
          name: commune.name,
          counts: [],
          scores: [],
          consumptions: [],
        };
      }
      allCommunes[commune.name].counts.push(commune.count);
      if (commune.avgScore) allCommunes[commune.name].scores.push(commune.avgScore);
      if (commune.avgConsumption) allCommunes[commune.name].consumptions.push(commune.avgConsumption);
    });
  });

  const communeStats = Object.values(allCommunes)
    .map(c => ({
      name: c.name,
      count: c.counts.reduce((a, b) => a + b, 0),
      avgScore: c.scores.length > 0
        ? c.scores.reduce((a, b) => a + b, 0) / c.scores.length
        : null,
      avgConsumption: c.consumptions.length > 0
        ? c.consumptions.reduce((a, b) => a + b, 0) / c.consumptions.length
        : null,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalDPE: processedFiles.reduce((a, f) => a + f.totalCount, 0),
    globalDistribution: DPE_CLASSES.map(c => ({
      class: c,
      count: globalDistribution[c],
      percentage: globalTotal > 0 ? ((globalDistribution[c] / globalTotal) * 100).toFixed(1) : 0,
    })),
    byCategory,
    byPeriod,
    communeStats,
    files: processedFiles,
  };
};

export { FILE_CONFIGS };
