/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) return "Unknown size";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Format date to relative or absolute string
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return "Unknown date";

  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();

  // Invalid date
  if (isNaN(dateObj.getTime())) return "Invalid date";

  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  // Today
  if (diffDays === 0) {
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }

  // Yesterday
  if (diffDays === 1) return "Yesterday";

  // Less than a week
  if (diffDays < 7) return `${diffDays} days ago`;

  // Format date based on whether it's this year or not
  const thisYear = now.getFullYear() === dateObj.getFullYear();
  if (thisYear) {
    return dateObj.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return dateObj.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format time only
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted time
 */
export const formatTime = (date) => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  // Invalid date
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Format a full timestamp (date and time)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (date) => {
  if (!date) return "Unknown";

  const dateObj = date instanceof Date ? date : new Date(date);

  // Invalid date
  if (isNaN(dateObj.getTime())) return "Invalid date";

  return `${formatDate(dateObj)} at ${formatTime(dateObj)}`;
};

/**
 * Get file type display name based on MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} File type display name
 */
export const getFileTypeDisplay = (mimeType) => {
  if (!mimeType) return "DOC";

  const type = mimeType.toLowerCase();

  if (type.includes("pdf")) return "PDF";
  if (type.includes("jpeg") || type.includes("jpg")) return "JPG";
  if (type.includes("png")) return "PNG";
  if (type.includes("docx")) return "DOCX";
  if (type.includes("doc")) return "DOC";
  if (type.includes("text") || type.includes("txt")) return "TXT";
  if (type.includes("xlsx") || type.includes("xls")) return "EXCEL";
  if (type.includes("pptx") || type.includes("ppt")) return "PPT";

  // Extract extension from MIME type
  const parts = type.split("/");
  if (parts.length === 2) {
    return parts[1].toUpperCase();
  }

  return "DOC";
};

/**
 * Get file icon name based on MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} Ionicons icon name
 */
export const getFileIconName = (mimeType) => {
  if (!mimeType) return "document-outline";

  const type = mimeType.toLowerCase();

  if (type.includes("pdf")) return "document-text";
  if (type.includes("image")) return "image";
  if (type.includes("doc")) return "document";
  if (type.includes("excel") || type.includes("xls")) return "grid";
  if (type.includes("ppt")) return "easel";
  if (type.includes("text") || type.includes("txt"))
    return "document-text-outline";

  return "document-outline";
};

/**
 * Get file color based on MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} Hex color code
 */
export const getFileColor = (mimeType) => {
  if (!mimeType) return "#5D5FEF"; // Default primary color

  const type = mimeType.toLowerCase();

  if (type.includes("pdf")) return "#EF4444"; // Red
  if (type.includes("image")) return "#3B82F6"; // Blue
  if (type.includes("doc")) return "#8B5CF6"; // Purple
  if (type.includes("excel") || type.includes("xls")) return "#10B981"; // Green
  if (type.includes("ppt")) return "#F59E0B"; // Amber
  if (type.includes("text") || type.includes("txt")) return "#6B7280"; // Gray

  return "#5D5FEF"; // Default primary
};
