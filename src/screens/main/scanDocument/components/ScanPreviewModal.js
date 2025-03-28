import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Text, Button } from "../../../../components";

const { width, height } = Dimensions.get("window");

const ScanPreviewModal = ({ visible, image, onRetake, onUse, theme, processing = false }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Animate in on visibility change
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!visible || !image) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Preview Header */}
          <View style={styles.previewHeader}>
            <Text variant="h3" color="#FFFFFF" style={styles.previewTitle}>
              Preview Document
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onRetake}
              disabled={processing}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Image Preview */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: image.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>

          {/* Quality Indicator */}
          <View style={styles.qualityContainer}>
            <View style={styles.qualityBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text variant="body2" color="#10B981" style={styles.qualityText}>
                Good Quality
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              label="Retake"
              onPress={onRetake}
              variant="outline"
              style={[styles.actionButton, styles.retakeButton]}
              textStyle={{ color: "#FFFFFF" }}
              disabled={processing}
            />

            {processing ? (
              <Button
                style={styles.actionButton}
                disabled={true}
              >
                <View style={styles.processingButton}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text color="#FFFFFF" style={styles.processingText}>
                    Processing...
                  </Text>
                </View>
              </Button>
            ) : (
              <Button
                label="Use Photo"
                onPress={onUse}
                gradient={true}
                style={styles.actionButton}
                leftIcon={<Ionicons name="checkmark" size={20} color="#FFFFFF" />}
              />
            )}
          </View>

          {/* AI Processing Explanation */}
          <Text
            variant="caption"
            color="rgba(255,255,255,0.7)"
            style={styles.tip}
          >
            Document will be processed by Claude AI for text extraction and analysis
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 500,
    borderRadius: 20,
    overflow: "hidden",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  previewTitle: {
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 4,
  },
  imageContainer: {
    width: "100%",
    height: height * 0.5,
    backgroundColor: "#000",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  qualityContainer: {
    alignItems: "center",
    padding: 16,
  },
  qualityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qualityText: {
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  retakeButton: {
    borderColor: "rgba(255,255,255,0.3)",
  },
  processingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  processingText: {
    marginLeft: 8,
  },
  tip: {
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ScanPreviewModal;