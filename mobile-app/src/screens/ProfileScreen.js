import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import Card from '../components/Card';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}><Text style={styles.avatar}>🩸</Text><Text style={styles.name}>Hajar Khomssi</Text><Text style={styles.role}>Donneur O- disponible</Text></View>
      <Card title="Informations sanguines" value="O-" subtitle="Dernier don : 10/04/2025" />
      <Card title="Coordonnées" subtitle="El Jadida • 0611111111 • hajar@example.com" />
      <Card title="Historique" value="4" subtitle="Dons réalisés" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f7f7f7' }, content: { padding: 18 }, header: { backgroundColor: '#c62828', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16 }, avatar: { fontSize: 44 }, name: { color: '#fff', fontSize: 24, fontWeight: '800' }, role: { color: '#fff', marginTop: 6 } });
