import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Card({ title, value, subtitle, children }) {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      {value !== undefined && <Text style={styles.value}>{value}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#eee' },
  title: { fontSize: 15, color: '#666', marginBottom: 6 },
  value: { fontSize: 30, fontWeight: '700', color: '#202124' },
  subtitle: { color: '#777', marginTop: 4 }
});
