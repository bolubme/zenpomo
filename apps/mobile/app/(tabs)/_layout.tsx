import { Tabs } from "expo-router";
import { Timer, BarChart2, Users, Settings } from "lucide-react-native";
import { useTimerStore } from "@zenpomo/core";

const THEME_COLORS: Record<string, string> = {
  zen_garden: "#4ade80",
  ocean_deep: "#22d3ee",
  night_city: "#f472b6",
  ancient_forest: "#86efac",
  ember: "#fb923c",
};

export default function TabLayout() {
  const theme = useTimerStore((s) => s.theme);
  const accent = THEME_COLORS[theme] ?? "#4ade80";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0a0a0f",
          borderTopColor: "rgba(255,255,255,0.06)",
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size }) => <Timer color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: "Rooms",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
