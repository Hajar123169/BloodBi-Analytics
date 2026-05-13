import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, TextInput, View } from 'react-native';
import { apiGet } from '../api/client';

const fallback = [
  { fullName: 'Hajar Khomssi', bloodType: 'O_NEG', city: 'El Jadida', phone: '0611111111', available: true },
  { fullName: 'Sara Mahfoud', bloodType: 'A_POS', city: 'Casablanca', phone: '0622222222', available: true }
];

export default function SearchDonorScreen() {
  const [query, setQuery] = useState('');
  const [donors, setDonors] = useState(fallback);
  useEffect(() => { apiGet('/donors', fallback).then(setDonors); }, []);
  const filtered = donors.filter(d => `${d.fullName} ${d.city} ${d.bloodType}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Trouver des donneurs</Text>
      <TextInput style={styles.input} placeholder="Rechercher par nom, ville ou groupe" value={query} onChangeText={setQuery} />
      {filtered.map((d, index) => <View key={d.id || index} style={styles.card}>
        <Text style={styles.name}>{d.fullName} <Text style={styles.blood}>{d.bloodType}</Text></Text>
        <Text style={styles.meta}>{d.city} • {d.phone}</Text>
        <Text style={d.available ? styles.available : styles.unavailable}>{d.available ? 'Disponible' : 'Indisponible'}</Text>
      </View>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f7f7f7' }, content: { padding: 18 }, title: { fontSize: 26, fontWeight: '800', marginBottom: 14 }, input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#eee' }, card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 }, name: { fontSize: 18, fontWeight: '700' }, blood: { color: '#c62828' }, meta: { color: '#666', marginVertical: 6 }, available: { color: '#2e7d32', fontWeight: '800' }, unavailable: { color: '#999', fontWeight: '800' } });
