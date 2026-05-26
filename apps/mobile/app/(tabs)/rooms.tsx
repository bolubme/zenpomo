import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTimerStore } from "@zenpomo/core";

const THEME_BG: Record<string, [string, string]> = {
  zen_garden: ["#080f0a", "#0d1f10"],
  ocean_deep: ["#030f1a", "#051624"],
  night_city: ["#050008", "#0a0010"],
  ancient_forest: ["#040d06", "#08180a"],
  ember: ["#0f0500", "#1a0800"],
};

export default function RoomsScreen() {
  const theme = useTimerStore((s) => s.theme);
  const bg = THEME_BG[theme] ?? ["#080f0a", "#0d1f10"];

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Focus Rooms</Text>
        <Text style={styles.sub}>Focus together, achieve more</Text>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🏠</Text>
          <Text style={styles.cardTitle}>Rooms coming soon</Text>
          <Text style={styles.cardText}>
            Use the web app to create and join focus rooms. Mobile support coming soon.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 24 },
  title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 4, marginTop: 20 },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
  },
  cardEmoji: { fontSize: 40, marginBottom: 12 },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  cardText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
