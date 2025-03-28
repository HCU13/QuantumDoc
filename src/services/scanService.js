import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Camera } from "expo-camera";
import documentService from "./documentService";
import aiService from "./aiService";

/**
 * Scan Service - Handles camera scanning operations and OCR
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

      // Process the image to enhance document quality
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
   * Convert image file to base64
   * @param {string} uri - Image file URI
   * @returns {Promise<string>} Base64-encoded image data
   */
  imageToBase64: async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  },

  /**
   * Extract text from image using Claude's vision capabilities
   * @param {string} imageUri - Image file URI
   * @returns {Promise<string>} Extracted text
   */
  extractTextFromImage: async (imageUri) => {
    try {
      // Convert image to base64
      const base64Image = await scanService.imageToBase64(imageUri);

      // Use Claude AI service to extract text
      // Bu gerçek bir Claude entegrasyonu olduğunda burada Claude'un görüntü işleme API'si çağrılır
      return await aiService.extractTextFromImage(base64Image);
    } catch (error) {
      console.error("Error extracting text from image:", error);
      throw new Error("Could not extract text from image: " + error.message);
    }
  },

  /**
   * Process and analyze a scanned document
   * @param {Object} processedImage - Processed image file object
   * @returns {Promise<Object>} Document analysis result
   */
  processScannedDocument: async (processedImage) => {
    try {
      // Upload document to Firebase first
      const uploadedDoc = await documentService.uploadDocument(
        processedImage.uri,
        processedImage.name
      );

      // Convert to base64 for analysis
      const base64Image = await scanService.imageToBase64(processedImage.uri);

      // Görüntü belgelerinde metin içeriği doğrudan Claude'un anlayabileceği bir formatta olmalı
      // Bu gösterim amaçlı basit bir metin
      const dummyText =
        "Bu bir taranmış belge görüntüsüdür. Claude AI tarafından analiz edilecektir.";

      // Prepare file data object
      const fileData = {
        content: dummyText,
        rawData: base64Image,
        fileType: "image",
        name: processedImage.name,
      };

      // Analyze the document
      const analysisResult = await documentService.analyzeDocument(
        uploadedDoc.id,
        fileData
      );

      return {
        document: uploadedDoc,
        analysis: analysisResult,
        textContent: dummyText,
      };
    } catch (error) {
      console.error("Error processing scanned document:", error);
      throw error;
    }
  },
};

export default scanService;
