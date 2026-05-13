import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import { apiGet } from '../api/client';

const fallback = { totalDonors: 205, availableDonors: 178, activeRequests: 12, criticalRequests: 4, criticalStocks: 3 };

export default function HomeScreen() {
  const [kpis, setKpis] = useState(fallback);
  useEffect(() => { apiGet('/dashboard/kpis', fallback).then(setKpis); }, []);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hero}>Sauver des vies avec les données</Text>
      <Text style={styles.text}>Consultez les demandes urgentes, les stocks critiques et les donneurs disponibles.</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.primary}><Text style={styles.buttonText}>Donner du sang</Text></TouchableOpacity>
        <TouchableOpacity style={styles.secondary}><Text style={styles.secondaryText}>Demander</Text></TouchableOpacity>
      </View>
      <Card title="Donneurs disponibles" value={kpis.availableDonors} subtitle="Donneurs prêts à répondre" />
      <Card title="Demandes actives" value={kpis.activeRequests} subtitle={`${kpis.criticalRequests} demandes critiques`} />
      <Card title="Stocks critiques" value={kpis.criticalStocks} subtitle="Centres à surveiller" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  content: { padding: 18 },
  hero: { fontSize: 30, fontWeight: '800', color: '#b71c1c', marginTop: 8 },
  text: { color: '#666', marginVertical: 10, lineHeight: 21 },
  row: { flexDirection: 'row', gap: 12, marginVertical: 16 },
  primary: { flex: 1, backgroundColor: '#c62828', padding: 14, borderRadius: 12, alignItems: 'center' },
  secondary: { flex: 1, backgroundColor: '#fff', borderColor: '#c62828', borderWidth: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: '#c62828', fontWeight: '700' }
});
