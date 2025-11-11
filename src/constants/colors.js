// src/constants/colors.js
export const COLORS = {
  // Açık tema renkleri - biraz daha gri tona kaydırıldı
  light: {
    primary: "#8A4FFF", // Ana mor renk
    primaryDark: "#6932E0", // Koyu mor
    primaryLight: "#A880FF", // Açık mor
    secondary: "#FF9D55", // Turuncu vurgu rengi
    success: "#4ECDC4", // Başarı rengi
    error: "#FF6B6B", // Hata rengi
    warning: "#FF8A5B", // Uyarı rengi
    info: "#4A6FA5", // Bilgi rengi
    background: "#F1F0F5", // Daha gri-mor tonda arka plan
    card: "#FFFFFF",
    white: "#FFFFFF",
    black: "#000000",
    gray: "#EEEDF2", // Hafif mor-gri
    lightGray: "#F7F7F9", // Çok açık mor-gri
    darkGray: "#666666",
    textPrimary: "#333333",
    textSecondary: "#666666",
    textTertiary: "#999999",
    textOnGradient: "#1A1A1A", // Gradient arka plan üzerindeki metin rengi
    textOnPrimary: "#FFFFFF", // Primary renk üzerindeki metin rengi
    statusBar: "dark-content", // Status bar içeriği rengi
    border: "#E0E0E0",
    input: "#F5F5F7", // Input alanı arka plan rengi
    
    // Modül renkleri - Her modülün kendine özgü rengi
    mathPrimary: "#10B981", // Problem çözücü için yeşil (başarı, çözüm)
    mathPrimaryDark: "#059669", // Problem çözücü koyu yeşil
    mathPrimaryLight: "#34D399", // Problem çözücü açık yeşil
    chatPrimary: "#8B5CF6", // Chat için mor (iletişim, sosyallik)
    chatPrimaryDark: "#7C3AED", // Chat koyu mor
    chatPrimaryLight: "#A78BFA", // Chat açık mor
    newsPrimary: "#EF4444", // News için kırmızı (dikkat çekici, acil)
    newsPrimaryDark: "#DC2626", // News koyu kırmızı
    newsPrimaryLight: "#F87171", // News açık kırmızı
    calculatorPrimary: "#3B82F6", // Hesap makinesi için mavi (hesaplama, sayısal)
    calculatorPrimaryDark: "#2563EB", // Hesap makinesi koyu mavi
    calculatorPrimaryLight: "#60A5FA", // Hesap makinesi açık mavi
    textEditorPrimary: "#F59E0B", // Metin düzenleme için turuncu (verimlilik, yazma)
    textEditorPrimaryDark: "#D97706", // Metin düzenleme koyu turuncu
    textEditorPrimaryLight: "#FBBF24", // Metin düzenleme açık turuncu
    imageAnalyzerPrimary: "#EC4899", // Resim analizi için pembe (görsel, yaratıcılık)
    imageAnalyzerPrimaryDark: "#DB2777", // Resim analizi koyu pembe
    imageAnalyzerPrimaryLight: "#F472B6", // Resim analizi açık pembe
    noteGeneratorPrimary: "#14B8A6", // Not üretici için teal (organizasyon, üretkenlik)
    noteGeneratorPrimaryDark: "#0D9488", // Not üretici koyu teal
    noteGeneratorPrimaryLight: "#5EEAD4", // Not üretici açık teal
  },

  // Koyu tema renkleri - ekran görüntülerine göre ayarlandı
  dark: {
    primary: "#9B4DFF", // Ana mor renk
    primaryDark: "#7535E5", // Koyu mor
    primaryLight: "#B492FF", // Açık mor
    secondary: "#FF9D55", // Turuncu vurgu rengi (aynı kaldı)
    success: "#4ECDC4", // Başarı rengi
    error: "#FF6B6B", // Hata rengi
    warning: "#FF8A5B", // Uyarı rengi
    info: "#4A6FA5", // Bilgi rengi
    background: "#21193A", // Koyu mor-siyah arka plan
    card: "#312A4A", // Koyu mor-gri kart arka planı
    white: "#FFFFFF",
    black: "#000000",
    gray: "#3D365A", // Koyu mor-gri
    lightGray: "#484267", // Orta koyu mor-gri
    darkGray: "#BBBBBB",
    textPrimary: "#F5F5F5",
    textSecondary: "#DDDDDD",
    textTertiary: "#AAAAAA",
    textOnGradient: "#FFFFFF", // Gradient arka plan üzerindeki metin rengi
    textOnPrimary: "#FFFFFF", // Primary renk üzerindeki metin rengi
    statusBar: "light-content", // Status bar içeriği rengi
    border: "#3D3D5A", // Hafif mor-gri sınır
    input: "#312A4A", // Input alanı arka plan rengi
    
    // Modül renkleri (koyu tema için aynı renkler)
    mathPrimary: "#10B981", // Problem çözücü için yeşil (başarı, çözüm)
    mathPrimaryDark: "#059669", // Problem çözücü koyu yeşil
    mathPrimaryLight: "#34D399", // Problem çözücü açık yeşil
    chatPrimary: "#8B5CF6", // Chat için mor (iletişim, sosyallik)
    chatPrimaryDark: "#7C3AED", // Chat koyu mor
    chatPrimaryLight: "#A78BFA", // Chat açık mor
    newsPrimary: "#EF4444", // News için kırmızı (dikkat çekici, acil)
    newsPrimaryDark: "#DC2626", // News koyu kırmızı
    newsPrimaryLight: "#F87171", // News açık kırmızı
    calculatorPrimary: "#3B82F6", // Hesap makinesi için mavi (hesaplama, sayısal)
    calculatorPrimaryDark: "#2563EB", // Hesap makinesi koyu mavi
    calculatorPrimaryLight: "#60A5FA", // Hesap makinesi açık mavi
    textEditorPrimary: "#F59E0B", // Metin düzenleme için turuncu (verimlilik, yazma)
    textEditorPrimaryDark: "#D97706", // Metin düzenleme koyu turuncu
    textEditorPrimaryLight: "#FBBF24", // Metin düzenleme açık turuncu
    imageAnalyzerPrimary: "#EC4899", // Resim analizi için pembe (görsel, yaratıcılık)
    imageAnalyzerPrimaryDark: "#DB2777", // Resim analizi koyu pembe
    imageAnalyzerPrimaryLight: "#F472B6", // Resim analizi açık pembe
    noteGeneratorPrimary: "#14B8A6", // Not üretici için teal (organizasyon, üretkenlik)
    noteGeneratorPrimaryDark: "#0D9488", // Not üretici koyu teal
    noteGeneratorPrimaryLight: "#5EEAD4", // Not üretici açık teal
  },
};
