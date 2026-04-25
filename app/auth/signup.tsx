import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validate() {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return false;
    }
    return true;
  }

  async function signUp() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          currency: "INR",
        });
      }

      Alert.alert(
        "Account created!",
        "Please check your email to verify your account.",
        [{ text: "OK", onPress: () => router.replace("/auth/login") }],
      );
    } catch (err: any) {
      Alert.alert("Signup failed", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ marginBottom: 36 }}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#1D9E75",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 24 }}>💰</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 6 }}>
            Create account
          </Text>
          <Text style={{ fontSize: 15, color: "#888" }}>
            Start tracking your finances today
          </Text>
        </View>

        {/* Fields */}
        <Text style={label}>Full name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Rahul Sharma"
          style={input}
          autoCapitalize="words"
        />

        <Text style={label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="rahul@example.com"
          style={input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={label}>Password</Text>
        <View style={{ position: "relative", marginBottom: 16 }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 characters"
            secureTextEntry={!showPassword}
            style={[input, { marginBottom: 0, paddingRight: 48 }]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 14, top: 14 }}
          >
            <Text style={{ color: "#888", fontSize: 12 }}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={label}>Confirm password</Text>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-enter password"
          secureTextEntry={!showPassword}
          style={input}
        />

        {/* Password strength indicator */}
        {password.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              gap: 4,
              marginBottom: 20,
              marginTop: -8,
            }}
          >
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor:
                    password.length >= i * 4
                      ? password.length >= 10
                        ? "#1D9E75"
                        : "#BA7517"
                      : "#eee",
                }}
              />
            ))}
            <Text
              style={{
                fontSize: 11,
                color: "#888",
                alignSelf: "center",
                marginLeft: 6,
              }}
            >
              {password.length < 4
                ? "Weak"
                : password.length < 10
                  ? "Fair"
                  : "Strong"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={signUp}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#a0d8c8" : "#1D9E75",
            padding: 16,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            {loading ? "Creating account..." : "Create account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          style={{ alignItems: "center" }}
        >
          <Text style={{ color: "#888", fontSize: 14 }}>
            Already have an account?{" "}
            <Text style={{ color: "#1D9E75", fontWeight: "600" }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const label: any = {
  fontSize: 13,
  color: "#555",
  marginBottom: 6,
  fontWeight: "500",
};
const input: any = {
  borderWidth: 1,
  borderColor: "#e5e5e5",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  marginBottom: 16,
  backgroundColor: "#fafafa",
};
