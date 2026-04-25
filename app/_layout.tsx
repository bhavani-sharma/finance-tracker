import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";

const queryClient = new QueryClient();

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerPushToken(userId: string) {
  // Push tokens only work on physical devices
  if (!Device.isDevice) return;

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  // Android needs a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Get the token and save it to Supabase
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  await supabase
    .from("profiles")
    .update({ push_token: token })
    .eq("id", userId);
}

export default function RootLayout() {
  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        // No session → send to login
        router.replace("/auth/login");
      } else {
        // Session exists → go to app and register push token
        router.replace("./(tabs)/");
        if (event === "SIGNED_IN") {
          // Only register on fresh sign-in, not on every token refresh
          await registerPushToken(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
