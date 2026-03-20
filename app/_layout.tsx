import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { session, profile, setSession, fetchProfile } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && profile && inAuthGroup) {
      // Redirigir según rol
      switch (profile.role) {
        case "super_admin":
          router.replace("/(app)/(super-admin)/");
          break;
        case "tournament_admin":
          router.replace("/(app)/(admin)/");
          break;
        case "captain":
          router.replace("/(app)/(captain)/");
          break;
        default:
          router.replace("/(app)/(public)/");
      }
    }
  }, [session, profile, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
