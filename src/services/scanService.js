import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Camera } from "expo-camera";
import documentService from "./documentService";

/**
 * Scan Service - Handles camera scanning operations
 */
const scanService = {
  /**
   * Request camera permissions
   * @returns {Promise<boolean>} Whether permission was granted
   */
  requestCameraPermission: async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  },

  /**
   * Check if camera permission is granted
   * @returns {Promise<boolean>} Whether permission is granted
   */
  hasCameraPermission: async () => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error checking camera permission:", error);
      return false;
    }
  },

  /**
   * Process a captured image (cropping, enhancing, etc.)
   * @param {Object} photo - Photo object from camera
   * @returns {Promise<Object>} Processed image
   */
  processImage: async (photo) => {
    try {
      // Check if the photo exists
      if (!photo || !photo.uri) {
        throw new Error("Invalid photo object");
      }

      // Process the image
      const processedImage = await manipulateAsync(
        photo.uri,
        [
          // Image manipulations to enhance document quality
          { resize: { width: 1600 } }, // Resize to reasonable dimensions
          { contrast: 1.2 }, // Slightly increase contrast
          { brightness: 0.05 }, // Slightly increase brightness
          { saturation: 0.9 }, // Slightly decrease saturation for better text readability
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      // Get file info for the processed image
      const fileInfo = await FileSystem.getInfoAsync(processedImage.uri);

      // Create file object similar to what DocumentPicker would return
      return {
        uri: processedImage.uri,
        name: `scan_${new Date().getTime()}.jpg`,
        mimeType: "image/jpeg",
        type: "image/jpeg",
        size: fileInfo.size,
        width: processedImage.width,
        height: processedImage.height,
      };
    } catch (error) {
      console.error("Error processing image:", error);
      throw error;
    }
  },

  /**
   * Upload a scanned document
   * @param {Object} photo - Photo object from camera
   * @param {string} userId - User ID
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Uploaded document object
   */
  uploadScannedDocument: async (photo, userId, onProgress = () => {}) => {
    try {
      // Process the image
      const processedImage = await scanService.processImage(photo);

      // Upload the processed image as a document
      return await documentService.uploadDocument(
        processedImage,
        userId,
        onProgress
      );
    } catch (error) {
      console.error("Error uploading scanned document:", error);
      throw error;
    }
  },

  /**
   * Detect text in an image (OCR) using the AI service
   * This is handled by the aiService's extractTextFromImage method,
   * but included here for convenience when working with scanned documents
   * @param {string} imageUri - Local image URI
   * @returns {Promise<string>} Extracted text
   */
  detectText: async (imageUri) => {
    try {
      // This would use aiService.extractTextFromImage in a real implementation
      // But that requires the image to be accessible via URL
      // For a local image, we'd need to upload it first or use a different OCR service

      // For now, we'll return a simulated response
      console.log("Simulating OCR for image:", imageUri);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return `
        Simulated OCR result for ${imageUri}
        
        This is a document that contains text that would normally be extracted 
        by an OCR service. In a real application, you would integrate with 
        Google Cloud Vision API, Azure Computer Vision, or a similar service.
        
        The document appears to contain information about a business agreement
        between two parties, dated January 15, 2023.
        
        Key terms include payment schedules, deliverables, and confidentiality agreements.
        
        The document is signed by representatives from both organizations.
      `;
    } catch (error) {
      console.error("Error detecting text:", error);
      throw error;
    }
  },
};

export default scanService;
