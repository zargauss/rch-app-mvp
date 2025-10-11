import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export default function CalendarMonth({ date = new Date(), renderDay }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1).getDay(); // 0=dimanche
  const numDays = daysInMonth(year, month);

  const cells = useMemo(() => {
    const arr = [];
    const offset = (first + 6) % 7; // Lundi=0
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= numDays; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [first, numDays]);

  return (
    <View style={styles.grid}>
      {['L','M','M','J','V','S','D'].map((d) => (
        <Text key={d} style={[styles.cell, styles.header]}>{d}</Text>
      ))}
      {cells.map((d, idx) => (
        <Pressable key={idx} style={styles.cell} disabled={!d}>
          {d ? (renderDay ? renderDay({ year, month, day: d }) : <Text>{d}</Text>) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  cell: {
    width: `${100 / 7}%`,
    padding: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    fontWeight: 'bold'
  }
});


