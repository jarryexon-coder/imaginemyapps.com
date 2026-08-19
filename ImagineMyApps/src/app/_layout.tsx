import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="portfolio" options={{ headerShown: false }} />
        <Stack.Screen name="case-study/[slug]" options={{ title: 'Case Study' }} />
        <Stack.Screen name="planner" options={{ title: 'Project Planner' }} />
        <Stack.Screen name="projects" options={{ title: 'My Projects' }} />
        <Stack.Screen name="project/[id]" options={{ title: 'Project Brief' }} />
        <Stack.Screen name="support" options={{ title: 'Help & Support' }} />
        <Stack.Screen name="consultation" options={{ title: 'Request a Consultation' }} />
      </Stack>
    </>
  );
}
