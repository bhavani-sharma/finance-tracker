// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.replace("./(auth)/login");
      else router.replace("./(tabs)/");
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
