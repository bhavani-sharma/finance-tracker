// app/(auth)/login.tsx
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert("Error", error.message);
    else router.replace("./(tabs)/");
    setLoading(false);
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "600", marginBottom: 32 }}>
        Sign in
      </Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 10,
          padding: 14,
          marginBottom: 12,
        }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 10,
          padding: 14,
          marginBottom: 20,
        }}
      />
      <TouchableOpacity
        onPress={signIn}
        disabled={loading}
        style={{
          backgroundColor: "#1D9E75",
          padding: 16,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {loading ? "Signing in..." : "Sign in"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("./(auth)/signup")}
        style={{ marginTop: 16, alignItems: "center" }}
      >
        <Text style={{ color: "#1D9E75" }}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
