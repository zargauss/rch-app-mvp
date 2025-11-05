import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import AppText from '../ui/AppText';

const MultiAxisTrendChart = ({ scoreData, bloodPercentageData, labels }) => {
  const { width } = Dimensions.get('window');
  const chartWidth = Math.min(width - 40, 600);
  const chartHeight = 280;
  const padding = { top: 30, right: 50, bottom: 50, left: 50 };
  
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculer les points pour le score Lichtiger (axe Y gauche, 0-20)
  const scorePoints = useMemo(() => {
    const validData = scoreData.filter(d => d !== null);
    if (validData.length === 0) return [];

    const maxScore = 20; // Échelle fixe pour le score
    const minScore = 0;

    return scoreData.map((value, index) => {
      if (value === null) return null;

      const x = padding.left + (index / (scoreData.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((value - minScore) / (maxScore - minScore)) * innerHeight;

      // Déterminer la couleur selon le score
      let color = '#4C4DDC'; // Color 01 - Principal
      if (value >= 10) color = '#101010'; // Color 03 - Noir pour alertes
      else if (value >= 4) color = '#4C4DDC'; // Color 01

      return { x, y, value, color, index };
    }).filter(p => p !== null);
  }, [scoreData, innerWidth, innerHeight, padding]);

  // Calculer les points pour le % de sang (axe Y droit, 0-100%)
  const bloodPoints = useMemo(() => {
    const validData = bloodPercentageData.filter(d => d !== null);
    if (validData.length === 0) return [];

    const maxPercentage = 100; // Échelle fixe pour le pourcentage
    const minPercentage = 0;

    return bloodPercentageData.map((value, index) => {
      if (value === null) return null;

      const x = padding.left + (index / (bloodPercentageData.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((value - minPercentage) / (maxPercentage - minPercentage)) * innerHeight;

      return { x, y, value, color: '#DC2626', index }; // Rouge pastel pour le sang
    }).filter(p => p !== null);
  }, [bloodPercentageData, innerWidth, innerHeight, padding]);

  // Créer le chemin SVG pour la ligne du score
  const scoreLinePath = useMemo(() => {
    if (scorePoints.length < 2) return '';
    
    let path = `M ${scorePoints[0].x} ${scorePoints[0].y}`;
    for (let i = 1; i < scorePoints.length; i++) {
      path += ` L ${scorePoints[i].x} ${scorePoints[i].y}`;
    }
    return path;
  }, [scorePoints]);

  // Créer le chemin SVG pour la ligne du pourcentage de sang
  const bloodLinePath = useMemo(() => {
    if (bloodPoints.length < 2) return '';
    
    let path = `M ${bloodPoints[0].x} ${bloodPoints[0].y}`;
    for (let i = 1; i < bloodPoints.length; i++) {
      path += ` L ${bloodPoints[i].x} ${bloodPoints[i].y}`;
    }
    return path;
  }, [bloodPoints]);


  // Grille horizontale pour le score (axe Y gauche)
  const scoreGridLines = [0, 5, 10, 15, 20].map(value => {
    const y = padding.top + innerHeight - ((value / 20) * innerHeight);
    return { value, y };
  });

  // Grille horizontale pour le pourcentage (axe Y droit)
  const bloodGridLines = [0, 25, 50, 75, 100].map(value => {
    const y = padding.top + innerHeight - ((value / 100) * innerHeight);
    return { value, y };
  });

  // Labels d'axe X
  const xLabels = useMemo(() => {
    const step = Math.ceil(labels.length / 6);
    return labels
      .map((label, index) => {
        if (index % step !== 0 && index !== labels.length - 1) return null;
        const x = padding.left + (index / (labels.length - 1)) * innerWidth;
        return { label, x, index };
      })
      .filter(l => l !== null);
  }, [labels, innerWidth, padding]);

  if (scorePoints.length === 0 && bloodPoints.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText variant="bodyMedium" style={styles.emptyText}>
          Aucune donnée disponible pour cette période
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <svg width={chartWidth} height={chartHeight} style={styles.svg}>
        <defs>
          {/* Gradient pour l'aire du score */}
          <linearGradient id="scoreAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4C4DDC" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4C4DDC" stopOpacity="0.05" />
          </linearGradient>
          {/* Gradient pour l'aire du sang */}
          <linearGradient id="bloodAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grille horizontale pour le score (axe Y gauche) */}
        <g>
          {scoreGridLines.map((line, index) => (
            <g key={`score-${index}`}>
              <line
                x1={padding.left}
                y1={line.y}
                x2={chartWidth - padding.right}
                y2={line.y}
                stroke="#EDEDFC"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 10}
                y={line.y + 4}
                fontSize="10"
                fill="#101010"
                textAnchor="end"
                fontWeight="500"
              >
                {line.value}
              </text>
            </g>
          ))}
        </g>

        {/* Grille horizontale pour le pourcentage (axe Y droit) */}
        <g>
          {bloodGridLines.map((line, index) => (
            <g key={`blood-${index}`}>
              <line
                x1={padding.left}
                y1={line.y}
                x2={chartWidth - padding.right}
                y2={line.y}
                stroke="#FEE2E2"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <text
                x={chartWidth - padding.right + 10}
                y={line.y + 4}
                fontSize="10"
                fill="#DC2626"
                textAnchor="start"
                fontWeight="500"
              >
                {line.value}%
              </text>
            </g>
          ))}
        </g>

        {/* Aire sous la courbe du score */}
        {scorePoints.length >= 2 && (() => {
          let areaPath = `M ${scorePoints[0].x} ${chartHeight - padding.bottom}`;
          areaPath += ` L ${scorePoints[0].x} ${scorePoints[0].y}`;
          for (let i = 1; i < scorePoints.length; i++) {
            areaPath += ` L ${scorePoints[i].x} ${scorePoints[i].y}`;
          }
          areaPath += ` L ${scorePoints[scorePoints.length - 1].x} ${chartHeight - padding.bottom}`;
          areaPath += ' Z';
          
          return (
            <path
              d={areaPath}
              fill="url(#scoreAreaGradient)"
            />
          );
        })()}

        {/* Aire sous la courbe du sang */}
        {bloodPoints.length >= 2 && (() => {
          let areaPath = `M ${bloodPoints[0].x} ${chartHeight - padding.bottom}`;
          areaPath += ` L ${bloodPoints[0].x} ${bloodPoints[0].y}`;
          for (let i = 1; i < bloodPoints.length; i++) {
            areaPath += ` L ${bloodPoints[i].x} ${bloodPoints[i].y}`;
          }
          areaPath += ` L ${bloodPoints[bloodPoints.length - 1].x} ${chartHeight - padding.bottom}`;
          areaPath += ' Z';
          
          return (
            <path
              d={areaPath}
              fill="url(#bloodAreaGradient)"
            />
          );
        })()}

        {/* Ligne du score */}
        {scoreLinePath && (
          <path
            d={scoreLinePath}
            stroke="#4C4DDC"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Ligne du pourcentage de sang */}
        {bloodLinePath && (
          <path
            d={bloodLinePath}
            stroke="#DC2626"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 4"
          />
        )}

        {/* Points du score */}
        {scorePoints.map((point, index) => (
          <g key={`score-point-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#FFFFFF"
              stroke={point.color}
              strokeWidth="2"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill={point.color}
            />
          </g>
        ))}

        {/* Points du pourcentage de sang */}
        {bloodPoints.map((point, index) => (
          <g key={`blood-point-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3.5"
              fill="#FFFFFF"
              stroke="#DC2626"
              strokeWidth="1.5"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#DC2626"
            />
          </g>
        ))}

        {/* Axe X */}
        <line
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#C8C8F4"
          strokeWidth="2"
        />

        {/* Labels X */}
        {xLabels.map((label, index) => (
          <text
            key={index}
            x={label.x}
            y={chartHeight - padding.bottom + 20}
            fontSize="10"
            fill="#101010"
            textAnchor="middle"
          >
            {label.label}
          </text>
        ))}

        {/* Axe Y gauche (Score) */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={chartHeight - padding.bottom}
          stroke="#C8C8F4"
          strokeWidth="2"
        />

        {/* Axe Y droit (Pourcentage) */}
        <line
          x1={chartWidth - padding.right}
          y1={padding.top}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#FCA5A5"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Labels des axes */}
        <text
          x={padding.left - 30}
          y={padding.top + innerHeight / 2}
          fontSize="11"
          fill="#101010"
          textAnchor="middle"
          transform={`rotate(-90 ${padding.left - 30} ${padding.top + innerHeight / 2})`}
          fontWeight="600"
        >
          Score Lichtiger
        </text>
        <text
          x={chartWidth - padding.right + 30}
          y={padding.top + innerHeight / 2}
          fontSize="11"
          fill="#DC2626"
          textAnchor="middle"
          transform={`rotate(-90 ${chartWidth - padding.right + 30} ${padding.top + innerHeight / 2})`}
          fontWeight="600"
        >
          % Selles sanglantes
        </text>

        {/* Légende */}
        <g transform={`translate(${padding.left + 10}, ${padding.top - 20})`}>
          {/* Score */}
          <line x1="0" y1="0" x2="30" y2="0" stroke="#4C4DDC" strokeWidth="2" strokeLinecap="round" />
          <text x="35" y="4" fontSize="10" fill="#101010" fontWeight="500">Score Lichtiger</text>
          
          {/* Sang */}
          <line x1="0" y1="15" x2="30" y2="15" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
          <text x="35" y="19" fontSize="10" fill="#101010" fontWeight="500">% Selles sanglantes</text>
        </g>
      </svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  svg: {
    overflow: 'visible',
  },
  emptyContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#101010', // Color 03 - Noir pour meilleure lisibilité
  },
});

export default MultiAxisTrendChart;

