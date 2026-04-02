import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Ana sayfa — animasyon yok */}
      <Stack.Screen name="index" options={{ animation: 'none' }} />

      {/* Modüller — push ile açılır, back ile iOS native geri kayar */}
      <Stack.Screen name="chat" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="math" />
      <Stack.Screen name="math-topics" />
      <Stack.Screen name="calculator" />
      <Stack.Screen name="exam-lab" />

      {/* Auth akışı */}
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="reset-password" />

      {/* Profile alt sayfaları */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="activity" />
    </Stack>
  );
}
