import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { apiGet } from '../api/client';

const fallback = [
  { donor: { fullName: 'Hajar Khomssi', bloodType: 'O_NEG' }, center: { name: 'Centre El Jadida' }, status: 'FULFILLED', scheduledAt: '2026-05-13' },
  { donor: { fullName: 'Sara Mahfoud', bloodType: 'A_POS' }, center: { name: 'CNTS Casablanca' }, status: 'PLANNED', scheduledAt: '2026-05-14' }
];

export default function DonationsScreen() {
  const [items, setItems] = useState(fallback);
  useEffect(() => { apiGet('/donations', fallback).then(setItems); }, []);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Vos dons et réservations</Text>
      {items.map((item, index) => <View key={item.id || index} style={styles.card}>
        <Text style={styles.name}>{item.donor?.fullName || 'Donneur'} • {item.donor?.bloodType}</Text>
        <Text style={styles.meta}>{item.center?.name || 'Centre de don'}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f7f7f7' }, content: { padding: 18 }, title: { fontSize: 26, fontWeight: '800', marginBottom: 14 }, card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 }, name: { fontSize: 18, fontWeight: '700' }, meta: { color: '#666', marginVertical: 6 }, status: { color: '#2e7d32', fontWeight: '800' } });
