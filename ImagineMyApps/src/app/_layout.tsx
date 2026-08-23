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
        <Stack.Screen name="planner" options={{ title: 'Project Planner' }} />
        <Stack.Screen name="projects" options={{ headerShown: false }} />
        <Stack.Screen name="resources" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="project/[id]" options={{ title: 'Project Workspace' }} />
        <Stack.Screen name="support" options={{ title: 'Help & Support' }} />
      </Stack>
    </>
  );
}
