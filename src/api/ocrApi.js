/**
 * OCR işlemleri API'si
 * Bu örnek, gerçek bir OCR uygulaması yerine simüle edilmiş bir yanıt döndürür
 */
export const ocrApi = {
  /**
   * Görüntüdeki metni tanır (simüle edilmiş)
   * @param {string} imageUrl - Görüntü URL'si
   * @returns {Promise<string>} - Tanınan metin
   */
  recognizeText: async (imageUrl) => {
    try {
      // Gerçek bir uygulamada, burada OCR API'si (Google Cloud Vision, Azure Computer Vision, vb.) çağrılır
      // Bu örnek için bir yanıt simüle ediyoruz
      console.log("Simulating OCR for image:", imageUrl);

      // İşlemi simüle etmek için gecikme
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return `
          Simulated OCR result for ${imageUrl}
          
          This is a document that contains text that would normally be extracted 
          by an OCR service. In a real application, you would integrate with 
          Google Cloud Vision API, Azure Computer Vision, or a similar service.
          
          The document appears to contain information about a business agreement
          between two parties, dated January 15, 2023.
          
          Key terms include payment schedules, deliverables, and confidentiality agreements.
          
          The document is signed by representatives from both organizations.
        `;
    } catch (error) {
      console.error("Error in OCR process:", error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  },
};
