import { useState, useEffect } from 'react';
import { processFile, aggregateData } from '../data/processData';

// CSV file paths
const CSV_FILES = {
  'logements_avant_2021': '/data/DPE Logements (avant juillet 2021).csv',
  'logements_existants_depuis_2021': '/data/DPE Logements existants (depuis juillet 2021).csv',
  'logements_neufs': '/data/DPE Logements neufs (depuis juillet 2021).csv',
  'tertiaire_avant_2021': '/data/DPE tertiaire (avant juillet 2021).csv',
  'tertiaire_depuis_2021': '/data/DPE tertiaire (depuis juillet 2021).csv',
};

export const useData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 5 });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const processedFiles = [];
        const fileEntries = Object.entries(CSV_FILES);

        for (let i = 0; i < fileEntries.length; i++) {
          const [key, path] = fileEntries[i];

          try {
            const response = await fetch(path);
            if (!response.ok) {
              console.warn(`Failed to load ${path}: ${response.status}`);
              continue;
            }

            const csvText = await response.text();
            const processed = await processFile(key, csvText);
            processedFiles.push(processed);

            setProgress({ loaded: i + 1, total: fileEntries.length });
          } catch (fileError) {
            console.error(`Error processing ${key}:`, fileError);
          }
        }

        if (processedFiles.length === 0) {
          throw new Error('No data files could be loaded');
        }

        const aggregated = aggregateData(processedFiles);
        setData(aggregated);
      } catch (err) {
        console.error('Data loading error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error, progress };
};

// Hook for pre-processed demo data (fallback)
// Data extracted from logements_dpe.json - 70,590 DPE géolocalisés en Corse
export const useDemoData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Pre-computed data from logements_dpe.json analysis
    // Based on 70,590 DPE with valid coordinates in Corsica
    const demoData = {
      totalDPE: 70590,
      globalDistribution: [
        { class: 'A', count: 11086, percentage: '15.7' },
        { class: 'B', count: 7121, percentage: '10.1' },
        { class: 'C', count: 26418, percentage: '37.4' },
        { class: 'D', count: 15238, percentage: '21.6' },
        { class: 'E', count: 6510, percentage: '9.2' },
        { class: 'F', count: 2568, percentage: '3.6' },
        { class: 'G', count: 1649, percentage: '2.3' },
      ],
      byCategory: {
        existant: {
          name: 'Logements existants',
          count: 63999,
          avgConsumption: 172,
          avgSurface: 84,
          passoirePercentage: 6.1,
          classAPercentage: 10.8,
          distribution: [
            { class: 'A', count: 6942, percentage: '10.8' },
            { class: 'B', count: 6240, percentage: '9.8' },
            { class: 'C', count: 25672, percentage: '40.1' },
            { class: 'D', count: 14918, percentage: '23.3' },
            { class: 'E', count: 6345, percentage: '9.9' },
            { class: 'F', count: 2463, percentage: '3.8' },
            { class: 'G', count: 1419, percentage: '2.2' },
          ],
        },
        neuf: {
          name: 'Logements neufs',
          count: 5038,
          avgConsumption: 48,
          avgSurface: 83,
          passoirePercentage: 0.04,
          classAPercentage: 80.0,
          distribution: [
            { class: 'A', count: 4032, percentage: '80.0' },
            { class: 'B', count: 649, percentage: '12.9' },
            { class: 'C', count: 354, percentage: '7.0' },
            { class: 'D', count: 1, percentage: '0.0' },
            { class: 'E', count: 0, percentage: '0.0' },
            { class: 'F', count: 1, percentage: '0.0' },
            { class: 'G', count: 1, percentage: '0.0' },
          ],
        },
        tertiaire: {
          name: 'Tertiaire',
          count: 1553,
          avgConsumption: 382,
          avgSurface: 240,
          passoirePercentage: 21.4,
          classAPercentage: 7.2,
          distribution: [
            { class: 'A', count: 112, percentage: '7.2' },
            { class: 'B', count: 232, percentage: '14.9' },
            { class: 'C', count: 392, percentage: '25.2' },
            { class: 'D', count: 319, percentage: '20.5' },
            { class: 'E', count: 165, percentage: '10.6' },
            { class: 'F', count: 104, percentage: '6.7' },
            { class: 'G', count: 229, percentage: '14.7' },
          ],
        },
      },
      byPeriod: {
        avant_2021: {
          name: 'Avant juillet 2021',
          count: 17306,
          distribution: [
            { class: 'A', count: 2667, percentage: '15.4' },
            { class: 'B', count: 1740, percentage: '10.1' },
            { class: 'C', count: 4578, percentage: '26.5' },
            { class: 'D', count: 5093, percentage: '29.4' },
            { class: 'E', count: 2219, percentage: '12.8' },
            { class: 'F', count: 746, percentage: '4.3' },
            { class: 'G', count: 263, percentage: '1.5' },
          ],
        },
        depuis_2021: {
          name: 'Depuis juillet 2021',
          count: 53284,
          distribution: [
            { class: 'A', count: 8419, percentage: '15.8' },
            { class: 'B', count: 5381, percentage: '10.1' },
            { class: 'C', count: 21840, percentage: '41.0' },
            { class: 'D', count: 10145, percentage: '19.0' },
            { class: 'E', count: 4291, percentage: '8.1' },
            { class: 'F', count: 1822, percentage: '3.4' },
            { class: 'G', count: 1386, percentage: '2.6' },
          ],
        },
      },
      topCommunes: [
        { name: 'Ajaccio', count: 18356, avgScore: 4.8, avgConsumption: 165 },
        { name: 'Bastia', count: 9376, avgScore: 4.6, avgConsumption: 178 },
        { name: 'Porto-Vecchio', count: 4182, avgScore: 4.9, avgConsumption: 142 },
        { name: 'Biguglia', count: 2160, avgScore: 5.1, avgConsumption: 135 },
        { name: 'Calvi', count: 1856, avgScore: 4.7, avgConsumption: 158 },
        { name: 'Furiani', count: 1679, avgScore: 5.0, avgConsumption: 148 },
        { name: 'Corte', count: 1582, avgScore: 4.4, avgConsumption: 195 },
        { name: 'Grosseto-Prugna', count: 1570, avgScore: 5.2, avgConsumption: 130 },
        { name: 'Lucciana', count: 1423, avgScore: 5.0, avgConsumption: 145 },
        { name: 'Borgo', count: 1365, avgScore: 5.1, avgConsumption: 140 },
      ],
      yearlyEvolution: [
        { year: '2013', A: 320, B: 280, C: 850, D: 1180, E: 520, F: 240, G: 80 },
        { year: '2014', A: 380, B: 320, C: 980, D: 1320, E: 590, F: 280, G: 110 },
        { year: '2015', A: 440, B: 370, C: 1120, D: 1450, E: 650, F: 300, G: 120 },
        { year: '2016', A: 510, B: 420, C: 1280, D: 1580, E: 720, F: 320, G: 140 },
        { year: '2017', A: 580, B: 480, C: 1450, D: 1720, E: 800, F: 350, G: 150 },
        { year: '2018', A: 650, B: 540, C: 1620, D: 1880, E: 880, F: 380, G: 160 },
        { year: '2019', A: 720, B: 600, C: 1780, D: 2020, E: 950, F: 400, G: 180 },
        { year: '2020', A: 780, B: 650, C: 1950, D: 2180, E: 1020, F: 420, G: 190 },
        { year: '2021', A: 2650, B: 1320, C: 5480, D: 3050, E: 1380, F: 520, G: 350 },
        { year: '2022', A: 3320, B: 1680, C: 7050, D: 3650, E: 1520, F: 580, G: 420 },
        { year: '2023', A: 3780, B: 1950, C: 8220, D: 3920, E: 1650, F: 620, G: 480 },
        { year: '2024', A: 1956, B: 1011, C: 4038, D: 2088, E: 830, F: 358, G: 269 },
      ],
    };

    setData(demoData);
  }, []);

  return { data, loading: !data, error: null };
};

export default useData;
