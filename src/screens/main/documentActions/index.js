import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useTokens } from "../../../context/TokenContext";
import { Text, Button, Card } from "../../../components";
import FilePickerModule from "./components/FilePickerModule";
import ScanDocumentModule from "./components/ScanDocumentModule";

const DocumentActionsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { freeTrialUsed, TOKEN_COSTS } = useTokens();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Document picker function
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      }); 

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Now navigate to upload processing screen with file details
        navigation.navigate("DocumentProcessing", { file });

        // Provide haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  // Camera/Scan function
  const handleScanDocument = () => {
    navigation.navigate("ScanDocument");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>
          Add Documents
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            },
          ]}
        >
          {/* Main Feature Image */}
          {/* <Image
            source={require("../../assets/images/document-illustration.png")}
            style={styles.featureImage}
            resizeMode="contain"
          /> */}

          {/* Upload Module */}
          <FilePickerModule onPress={handlePickDocument} />

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <Text
              variant="body2"
              color={theme.colors.textSecondary}
              style={styles.dividerText}
            >
              OR
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
          </View>

          {/* Scan Document Module */}
          <ScanDocumentModule onPress={handleScanDocument} />

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text variant="subtitle2" style={styles.infoTitle}>
              Why use Document Analysis?
            </Text>

            <View style={styles.infoItem}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.infoText}
              >
                Extract key insights from any document automatically
              </Text>
            </View>

            <View style={styles.infoItem}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: theme.colors.info + "15" },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color={theme.colors.info}
                />
              </View>
              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.infoText}
              >
                Ask questions about your document and get instant answers
              </Text>
            </View>

            <View style={styles.infoItem}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: theme.colors.success + "15" },
                ]}
              >
                <Ionicons name="time" size={20} color={theme.colors.success} />
              </View>
              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.infoText}
              >
                Save hours of reading and manual summarization
              </Text>
            </View>
          </View>

          {/* Free Trial Notice */}
          {!freeTrialUsed && (
            <Card
              style={[
                styles.freeTrialCard,
                { backgroundColor: theme.colors.success + "10" },
              ]}
            >
              <LinearGradient
                colors={[
                  theme.colors.success + "20",
                  theme.colors.success + "05",
                ]}
                style={styles.freeTrialGradient}
              />
              <View style={styles.freeTrialIcon}>
                <Ionicons name="gift" size={24} color={theme.colors.success} />
              </View>
              <View style={styles.freeTrialContent}>
                <Text
                  variant="subtitle2"
                  color={theme.colors.success}
                  style={styles.freeTrialTitle}
                >
                  Free Trial Available
                </Text>
                <Text variant="body2" style={styles.freeTrialText}>
                  Your first document analysis is free! Try it today.
                </Text>
              </View>
            </Card>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 8,
  },
  title: {
    marginBottom: 8,
  },
  mainContent: {
    padding: 20,
  },
  featureImage: {
    width: "100%",
    height: 200,
    marginBottom: 32,
    alignSelf: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
  },
  infoSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  infoTitle: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  freeTrialCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    marginVertical: 8,
  },
  freeTrialGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  freeTrialIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  freeTrialContent: {
    flex: 1,
  },
  freeTrialTitle: {
    marginBottom: 4,
  },
  freeTrialText: {
    opacity: 0.9,
  },
});

export default DocumentActionsScreen;
