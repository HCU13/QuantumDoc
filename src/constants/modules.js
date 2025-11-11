import { COLORS } from "./colors";

export const MODULES = [
  {
    id: "chat",
    titleKey: "modules.chat.title",
    descriptionKey: "modules.chat.description",
    icon: "chatbubble-outline",
    gradientColors: [COLORS.light.chatPrimary, COLORS.light.chatPrimaryDark],
    route: "Chat",
    enabled: true,
    showQuickArea: false,
    category: "tools",
    tokenCost: 1, // Her mesaj 1 token
    tokenCostRange: null,
    decorativeImage: require("../assets/modules/chat.png"),
  },
  {
    id: "math",
    titleKey: "modules.math.title",
    descriptionKey: "modules.math.description",
    icon: "calculator-outline",
    gradientColors: [COLORS.light.mathPrimary, COLORS.light.mathPrimaryDark],
    route: "Math",
    enabled: true,
    showQuickArea: true,
    category: "education",
    tokenCost: 7, // Detaylı çözüm (tek fiyat)
    tokenCostRange: null,
    decorativeImage: require("../assets/modules/math.png"),
  },
  {
    id: "calculator",
    titleKey: "modules.calculator.title",
    descriptionKey: "modules.calculator.description",
    icon: "calculator",
    gradientColors: [
      COLORS.light.calculatorPrimary,
      COLORS.light.calculatorPrimaryDark,
    ],
    route: "Calculator",
    enabled: true,
    showQuickArea: true,
    category: "tools",
    tokenCost: 0, // Ücretsiz
    tokenCostRange: null,
    decorativeImage: require("../assets/modules/calculator.png"),
  },
  {
    id: "textEditor",
    titleKey: "modules.textEditor.title",
    descriptionKey: "modules.textEditor.description",
    icon: "create-outline",
    gradientColors: [
      COLORS.light.textEditorPrimary,
      COLORS.light.textEditorPrimaryDark,
    ],
    route: "TextEditor",
    enabled: true,
    showQuickArea: true,
    category: "productivity",
    tokenCost: 3, // Sabit: Her işlem 3 token
    tokenCostRange: null,
    decorativeImage: require("../assets/modules/edit_document.png"),
  },
  {
    id: "imageAnalyzer",
    titleKey: "modules.imageAnalyzer.title",
    descriptionKey: "modules.imageAnalyzer.description",
    icon: "image-outline",
    gradientColors: [
      COLORS.light.imageAnalyzerPrimary,
      COLORS.light.imageAnalyzerPrimaryDark,
    ],
    route: "ImageAnalyzer",
    enabled: true,
    showQuickArea: true,
    category: "information",
    tokenCost: 6, // Sabit: Her analiz 6 token
    tokenCostRange: null,
    decorativeImage: require("../assets/modules/photo.png"),
  },
  {
    id: "noteGenerator",
    titleKey: "modules.noteGenerator.title",
    descriptionKey: "modules.noteGenerator.description",
    icon: "document-text-outline",
    gradientColors: [
      COLORS.light.noteGeneratorPrimary,
      COLORS.light.noteGeneratorPrimaryDark,
    ],
    route: "NoteGenerator",
    enabled: true,
    showQuickArea: true,
    category: "productivity",
    tokenCost: 4, // Sabit: Her not 4 token
    tokenCostRange: null,
    decorativeImage: require("../assets/modules/notes.png"),
  },
];
