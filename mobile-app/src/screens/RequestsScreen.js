import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { apiGet } from '../api/client';

const fallback = [
  { patientName: 'Patient A', bloodType: 'O_NEG', urgency: 'CRITICAL', hospital: 'CHU Ibn Rochd', city: 'Casablanca', status: 'PENDING' },
  { patientName: 'Patient B', bloodType: 'AB_NEG', urgency: 'HIGH', hospital: 'Hopital Ibn Rochd', city: 'Casablanca', status: 'PENDING' }
];

export default function RequestsScreen() {
  const [items, setItems] = useState(fallback);
  useEffect(() => { apiGet('/requests', fallback).then(setItems); }, []);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Demandes urgentes</Text>
      {items.map((item, index) => <View key={item.id || index} style={styles.card}>
        <Text style={styles.name}>{item.patientName} - {item.bloodType}</Text>
        <Text style={styles.meta}>{item.hospital} • {item.city}</Text>
        <View style={styles.row}><Text style={[styles.badge, item.urgency === 'CRITICAL' && styles.critical]}>{item.urgency}</Text><Text>{item.status}</Text></View>
      </View>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' }, content: { padding: 18 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#c62828' },
  name: { fontSize: 18, fontWeight: '700' }, meta: { color: '#666', marginVertical: 6 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: '#fff', backgroundColor: '#f57c00', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, fontWeight: '700' },
  critical: { backgroundColor: '#d32f2f' }
});
