import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from '../ui/AppText';
import AppCard from '../ui/AppCard';

// Heatmap horaire (24h) : visualise la moyenne de selles par heure sur la période
// Hypothèses de données stools: { id, timestamp (ms), hasBlood, ... }

const HourlyHeatmap = ({ stools = [], periodDays = 30 }) => {
  const { width } = Dimensions.get('window');
  const chartWidth = Math.min(width - 80, 600);
  const chartHeight = 56; // bande compacte
  const segmentCount = 24;

  const { hourlyAverages, maxAvg, totalAvgSum } = useMemo(() => {
    if (!stools || stools.length === 0) {
      return { hourlyAverages: Array(24).fill(0), maxAvg: 0, totalAvgSum: 0 };
    }

    // Compter les événements par heure sur la période choisie
    const counts = Array(24).fill(0);
    stools.forEach((s) => {
      if (!s || typeof s.timestamp !== 'number') return;
      const date = new Date(s.timestamp);
      const hour = date.getHours();
      counts[hour] += 1;
    });

    // Moyenne par heure = total événements / nb jours de la période
    const days = Math.max(1, periodDays);
    const averages = counts.map((c) => c / days);

    // Limiter l'échelle au P95 pour éviter les outliers
    const sorted = [...averages].sort((a, b) => a - b);
    const p95Index = Math.min(sorted.length - 1, Math.floor(0.95 * (sorted.length - 1)));
    const p95 = sorted[p95Index] || 0;
    const maxAvgValue = p95 > 0 ? p95 : Math.max(...averages, 0);
    const total = averages.reduce((a, b) => a + b, 0);

    return { hourlyAverages: averages, maxAvg: maxAvgValue, totalAvgSum: total };
  }, [stools, periodDays]);

  // Palette bleue (clair -> foncé)
  const colorForValue = (v) => {
    if (maxAvg <= 0) return '#EDEDFC';
    const t = Math.min(1, v / maxAvg);
    // Interpolation simple entre #EDEDFC (clair) et #4C4DDC (foncé)
    // t^0.6 pour un peu plus de contraste dans les faibles valeurs
    const k = Math.pow(t, 0.6);
    const from = { r: 237, g: 237, b: 252 }; // EDEDFC
    const to = { r: 76, g: 77, b: 220 }; // 4C4DDC
    const r = Math.round(from.r + (to.r - from.r) * k);
    const g = Math.round(from.g + (to.g - from.g) * k);
    const b = Math.round(from.b + (to.b - from.b) * k);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const ticks = [0, 6, 12, 18, 24];

  const insufficientData = periodDays < 3 || hourlyAverages.every((v) => v === 0);

  // Tooltip (web uniquement)
  const wrapperRef = useRef(null);
  const [hover, setHover] = useState(null); // { hour, x, y }

  const handleMouseMove = useCallback((e, hour, avg) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHover({ hour, x, y, avg });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(null);
  }, []);

  return (
    <AppCard style={styles.container}>
      <View style={styles.titleContainer}>
        <MaterialCommunityIcons name="clock-outline" size={28} color="#4C4DDC" style={{ marginRight: 12 }} />
        <AppText variant="headlineLarge" style={styles.title}>
          Répartition horaire des Selles
        </AppText>
      </View>
      <AppText variant="bodyMedium" style={styles.subtitle}>
        Moyenne par heure sur la période sélectionnée
      </AppText>

      {Platform.OS === 'web' ? (
        insufficientData ? (
          <View style={styles.emptyContainer}>
            <AppText variant="bodyMedium" style={styles.emptyText}>
              Données insuffisantes pour une moyenne fiable
            </AppText>
          </View>
        ) : (
          <View style={styles.chartWrapper} ref={wrapperRef}>
            <svg width={chartWidth} height={chartHeight} style={{ overflow: 'hidden' }}>
              {/* Masque pour coins arrondis uniquement sur les bords extérieurs */}
              <defs>
                <clipPath id="roundedBar">
                  <rect x="0" y="0" width={chartWidth} height={chartHeight} rx="8" ry="8" />
                </clipPath>
              </defs>

              {/* Barre uniforme avec segments contigus */}
              <g clipPath="url(#roundedBar)">
                {hourlyAverages.map((avg, hour) => {
                  const segmentWidth = chartWidth / segmentCount;
                  const x = hour * segmentWidth;
                  const fill = colorForValue(avg);
                  return (
                    <rect
                      key={hour}
                      x={x}
                      y={0}
                      width={segmentWidth}
                      height={chartHeight}
                      fill={fill}
                      stroke={hover && hover.hour === hour ? '#101010' : 'transparent'}
                      strokeWidth={hover && hover.hour === hour ? 2 : 0}
                      onMouseMove={(e) => handleMouseMove(e, hour, avg)}
                      onMouseLeave={handleMouseLeave}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                })}
              </g>

              {/* Ticks d'heures clefs */}
              {ticks.map((t, idx) => {
                const x = (t / 24) * chartWidth;
                return (
                  <g key={idx}>
                    <line x1={x} y1={chartHeight - 16} x2={x} y2={chartHeight} stroke="#C8C8F4" strokeWidth="1" />
                    <text x={x} y={chartHeight - 2} fontSize="10" fill="#101010" textAnchor="middle">
                      {t}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hover && (
              <View
                style={[
                  styles.tooltip,
                  {
                    left: Math.min(Math.max(hover.x + 8, 8), chartWidth - 160),
                    top: Math.min(Math.max(hover.y - 56, 8), chartHeight - 56),
                  },
                ]}
                pointerEvents="none"
              >
                <View style={styles.tooltipHeader}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#4C4DDC" />
                  <AppText variant="labelSmall" style={styles.tooltipHour}>
                    {String(hover.hour).padStart(2, '0')}h - {String((hover.hour + 1) % 24).padStart(2, '0')}h
                  </AppText>
                </View>
                <AppText variant="labelSmall" style={styles.tooltipValue}>
                  {hover.avg.toFixed(2)} selles/heure
                </AppText>
                {totalAvgSum > 0 && (
                  <AppText variant="labelSmall" style={styles.tooltipSub}>
                    {(Math.max(0, hover.avg) / totalAvgSum * 100).toFixed(1)}% de la journée
                  </AppText>
                )}
              </View>
            )}
          </View>
        )
      ) : (
        <View style={styles.emptyContainer}>
          <AppText variant="bodyMedium" style={styles.emptyText}>
            Disponible sur la version web
          </AppText>
        </View>
      )}

      {/* Légende compacte */}
      <View style={styles.legendRow}>
        <AppText variant="labelSmall" style={styles.legendLabel}>Intensité moyenne (selles/heure)</AppText>
        <View style={styles.legendScale}>
          <View style={[styles.legendSwatch, { backgroundColor: '#EDEDFC' }]} />
          <View style={[styles.legendSwatch, { backgroundColor: '#B4B6EF' }]} />
          <View style={[styles.legendSwatch, { backgroundColor: '#4C4DDC' }]} />
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8C8F4',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#101010',
    fontWeight: '700',
  },
  subtitle: {
    color: '#101010',
    marginBottom: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyContainer: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#101010',
  },
  legendRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    color: '#101010',
  },
  legendScale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 28,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  tooltip: {
    position: 'absolute',
    minWidth: 140,
    maxWidth: 180,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8C8F4',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  tooltipHour: {
    color: '#101010',
    fontWeight: '700',
  },
  tooltipValue: {
    color: '#101010',
    fontWeight: '600',
  },
  tooltipSub: {
    color: '#101010',
    opacity: 0.8,
    marginTop: 2,
  },
});

export default HourlyHeatmap;


