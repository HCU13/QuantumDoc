import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Share,
  ImageBackground,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";

const { width } = Dimensions.get("window");

const TextGeneratorScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const scrollViewRef = useRef();
  const typeScrollRef = useRef();

  const tokenCost = 3; // Cost to generate text

  // Yazı türleri - Genişletilmiş liste
  const contentTypes = [
    {
      id: "blog",
      label: "Blog Yazısı",
      icon: "document-text",
      color: colors.primary,
    },
    {
      id: "social",
      label: "Sosyal Medya",
      icon: "share-social",
      color: colors.secondary,
    },
    { id: "email", label: "E-posta", icon: "mail", color: colors.success },
    { id: "story", label: "Hikaye", icon: "book", color: colors.warning },
    { id: "academic", label: "Akademik", icon: "school", color: colors.info },
    {
      id: "business",
      label: "İş Metni",
      icon: "briefcase",
      color: colors.gray,
    },
    { id: "cv", label: "CV/Özgeçmiş", icon: "person", color: colors.primary },
    {
      id: "product",
      label: "Ürün Açıklaması",
      icon: "pricetag",
      color: colors.secondary,
    },
    {
      id: "recipe",
      label: "Yemek Tarifi",
      icon: "restaurant",
      color: colors.success,
    },
    {
      id: "poem",
      label: "Şiir/Şarkı Sözü",
      icon: "musical-notes",
      color: colors.warning,
    },
    {
      id: "news",
      label: "Haber Makalesi",
      icon: "newspaper",
      color: colors.info,
    },
    {
      id: "speech",
      label: "Konuşma/Sunum",
      icon: "megaphone",
      color: colors.primary,
    },
  ];

  // Yazı tonları
  const toneOptions = [
    { id: "professional", label: "Profesyonel" },
    { id: "casual", label: "Günlük" },
    { id: "formal", label: "Resmi" },
    { id: "friendly", label: "Arkadaşça" },
    { id: "persuasive", label: "İkna Edici" },
    { id: "humorous", label: "Mizahi" },
    { id: "inspirational", label: "İlham Verici" },
    { id: "educational", label: "Eğitici" },
  ];

  // Uzunluk seçenekleri
  const lengthOptions = [
    { id: "short", label: "Kısa", icon: "text" },
    { id: "medium", label: "Orta", icon: "list" },
    { id: "long", label: "Uzun", icon: "document" },
  ];

  // Kullanıcının seçimlerine göre yazı üretme
  const generateText = async () => {
    if (!topic.trim()) {
      Alert.alert("Hata", "Lütfen bir konu girin.");
      return;
    }

    // // Token kontrolü
    // if (tokens < tokenCost) {
    //   Alert.alert(
    //     "Yetersiz Token",
    //     `Bu işlem için ${tokenCost} token gerekiyor. Daha fazla token kazanın.`,
    //     [
    //       { text: "İptal", style: "cancel" },
    //       { text: "Token Kazan", onPress: () => navigation.navigate("Tokens") },
    //     ]
    //   );
    //   return;
    // }

    Keyboard.dismiss();
    setLoading(true);
    setShowResult(false);

    try {
      // Token kullanımı
      //   await useTokens(tokenCost);

      // Yazı üretme simülasyonu (gerçekte API çağrısı yapılacak)
      setTimeout(() => {
        const generatedContent = generateSampleText(
          contentType,
          topic,
          tone,
          length
        );
        setGeneratedText(generatedContent);
        setLoading(false);
        setShowResult(true);

        // Sonuçlara scroll yap
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 500);
      }, 2000);
    } catch (error) {
      console.log("Error generating text:", error);
      setLoading(false);
      Alert.alert("Hata", "Yazı üretilirken bir hata oluştu.");
    }
  };

  // Örnek yazı üretme fonksiyonu (gerçekte AI API'si kullanılacak)
  const generateSampleText = (type, userTopic, userTone, userLength) => {
    let baseText = "";
    const topic = userTopic.charAt(0).toUpperCase() + userTopic.slice(1);

    // Türe göre giriş cümlesi
    switch (type) {
      case "blog":
        baseText = `# ${topic} Hakkında Bilmeniz Gerekenler\n\n`;
        baseText += `${topic} günümüzde giderek önem kazanan bir konu. Bu yazıda, ${topic.toLowerCase()} hakkında detaylı bilgiler ve önemli ipuçları paylaşacağım.\n\n`;
        break;
      case "social":
        baseText = `📱 #${topic.replace(/\s+/g, "")}\n\n`;
        baseText += `Bugün sizlerle ${topic.toLowerCase()} hakkında heyecan verici bilgiler paylaşmak istiyorum! 👇\n\n`;
        break;
      case "email":
        baseText = `Konu: ${topic} Hakkında Bilgilendirme\n\n`;
        baseText += `Sayın İlgili,\n\nBu e-postayı ${topic.toLowerCase()} hakkında sizi bilgilendirmek amacıyla yazıyorum.\n\n`;
        break;
      case "story":
        baseText = `# ${topic}: Bir Hikaye\n\n`;
        baseText += `Bir zamanlar, ${topic.toLowerCase()} ile derin bir bağı olan birisi vardı. Günlerden bir gün, beklenmedik bir olay gerçekleşti...\n\n`;
        break;
      case "academic":
        baseText = `## ${topic} Üzerine Bir İnceleme\n\n`;
        baseText += `Özet: Bu çalışmada, ${topic.toLowerCase()} konusu akademik bir bakış açısıyla ele alınmış ve mevcut literatür ışığında değerlendirilmiştir.\n\n`;
        break;
      case "business":
        baseText = `# ${topic} İş Planı\n\n`;
        baseText += `Yönetici Özeti: Bu doküman, ${topic.toLowerCase()} alanında stratejik bir yaklaşım sunmak ve potansiyel iş fırsatlarını değerlendirmek amacıyla hazırlanmıştır.\n\n`;
        break;
      case "cv":
        baseText = `# ${topic} - Özgeçmiş\n\n`;
        baseText += `Profesyonel Özet: ${topic.toLowerCase()} alanında deneyimli, sonuç odaklı bir profesyonel.\n\n`;
        break;
      case "product":
        baseText = `# ${topic} - Ürün Açıklaması\n\n`;
        baseText += `Benzersiz ${topic.toLowerCase()} ürünümüz, hayatınızı kolaylaştırmak için tasarlandı. İşte size sunduğu avantajlar...\n\n`;
        break;
      case "recipe":
        baseText = `# Lezzetli ${topic} Tarifi\n\n`;
        baseText += `Bu enfes ${topic.toLowerCase()} tarifi, sofranıza renk katacak. İşte malzemeler ve yapılışı...\n\n`;
        break;
      case "poem":
        baseText = `# ${topic} Üzerine\n\n`;
        baseText += `Duyguların dile geldiği an,\n${topic.toLowerCase()} ile başlayan yolculuk...\n\n`;
        break;
      case "news":
        baseText = `# ${topic} Konusunda Son Gelişmeler\n\n`;
        baseText += `Son dakika: ${topic} konusundaki gelişmeler, uzmanlar tarafından yakından takip ediliyor...\n\n`;
        break;
      case "speech":
        baseText = `# ${topic} Hakkında Konuşma\n\n`;
        baseText += `Sayın dinleyiciler, bugün sizlerle ${topic.toLowerCase()} konusundaki düşüncelerimi paylaşmak istiyorum...\n\n`;
        break;
      default:
        baseText = `# ${topic}\n\n`;
    }

    // Tona göre içerik ekleme
    let toneText = "";
    switch (userTone) {
      case "professional":
        toneText = `${topic} alanında profesyonel bir yaklaşım benimsemek, günümüz rekabet ortamında önemli avantajlar sağlayabilir. Verilere dayalı stratejiler ve sistematik yöntemler, bu konuda ilerlemenin anahtarıdır.`;
        break;
      case "casual":
        toneText = `Hey, ${topic} hakkında konuşalım biraz! Biliyorsun, bu konu gerçekten ilginç ve herkesin hayatına dokunabiliyor. Ben şahsen bu konuyu her zaman merak etmişimdir.`;
        break;
      case "formal":
        toneText = `${topic} hususunda, resmi bir değerlendirme yapmak gerekirse, konunun çeşitli boyutlarını sistematik bir şekilde ele almak ve objektif kriterler çerçevesinde analiz etmek gerekmektedir.`;
        break;
      case "friendly":
        toneText = `${topic} ile ilgili düşüncelerimi seninle paylaşmak istiyorum dostum! Bu konuda birlikte keşfedecek çok şey var ve eminim ki sen de en az benim kadar heyecanlısın.`;
        break;
      case "persuasive":
        toneText = `${topic} konusunda harekete geçmenin tam zamanı. Düşünsenize, bu fırsatı kaçırmanın maliyeti ne olabilir? Rekabet her geçen gün artarken, şimdi adım atmamanın lüksü yok.`;
        break;
      case "humorous":
        toneText = `${topic} hakkında ciddi konuşmaya çalışırken, kendimi bir komedyen gibi hissediyorum! Bu konu o kadar ilginç ki, bazen gülmekten kendimi alamıyorum. Hazır olun, gülmekten karnınız ağrıyabilir!`;
        break;
      case "inspirational":
        toneText = `${topic} hayatımızda ilham verici bir yolculuk. Her adım, her deneyim bizi daha güçlü ve bilge kılıyor. Bu yolda karşılaştığımız zorluklar aslında bizi hedeflerimize daha da yaklaştıran fırsatlar.`;
        break;
      case "educational":
        toneText = `${topic} konusunu öğrenirken adım adım ilerlemek önemlidir. Bu yazıda temel kavramlardan başlayarak, karmaşık konulara doğru ilerleyeceğiz. Her bölümde pratik örneklerle konuyu pekiştireceğiz.`;
        break;
      default:
        toneText = `${topic} hakkında düşüncelerim şu şekilde...`;
    }

    baseText += toneText + "\n\n";

    // Uzunluğa göre içerik ekleme
    let paragraphs = "";
    const paragraphCount =
      userLength === "short" ? 2 : userLength === "medium" ? 4 : 6;

    const paragraphTemplates = [
      `${topic} alanında yapılan son araştırmalar, birçok yeni bulguyu ortaya koymuştur. Özellikle teknolojinin gelişmesiyle birlikte, bu alandaki ilerlemeler hız kazanmıştır. Uzmanlar, önümüzdeki yıllarda daha fazla yeniliğin geleceğini öngörmektedir.`,

      `Peki ${topic} ile ilgili bilmeniz gereken temel noktalar nelerdir? Öncelikle, bu konuya yaklaşırken bütünsel bir bakış açısı geliştirmek önemlidir. Farklı perspektiflerden değerlendirmeler yapmak, daha kapsamlı bir anlayış sağlayacaktır.`,

      `${topic} konusundaki genel yanılgılardan biri, onun sadece belirli bir kesimi ilgilendirdiği düşüncesidir. Oysa yapılan araştırmalar, toplumun her kesiminin bu konudan etkilendiğini göstermektedir. Bu nedenle, konuya geniş bir perspektiften bakmak gerekmektedir.`,

      `Günümüzde ${topic} ile ilgili karşılaşılan zorlukların başında, bilgi eksikliği gelmektedir. Doğru bilgiye ulaşmak ve bu bilgiyi etkili bir şekilde kullanmak, başarının anahtarıdır. Bu nedenle, güvenilir kaynaklardan bilgi edinmek büyük önem taşımaktadır.`,

      `${topic} alanında uzmanlaşmak isteyenler için önerilen adımlar şunlardır: Düzenli olarak güncel bilgileri takip etmek, alanındaki uzmanlarla iletişim kurmak, pratik uygulamalar yapmak ve geri bildirimler almak. Bu adımları izleyerek, sürekli bir gelişim sağlamak mümkündür.`,

      `${topic} ile ilgili gelecek trendlere baktığımızda, dijitalleşmenin etkisini görmek mümkündür. Teknolojik gelişmeler, bu alanda yeni fırsatlar sunmakta ve iş yapış şekillerini değiştirmektedir. Bu değişime ayak uydurmak, rekabet avantajı sağlayacaktır.`,

      `Sonuç olarak, ${topic} hakkında doğru bilgiye sahip olmak ve bu bilgiyi etkili bir şekilde kullanmak büyük önem taşımaktadır. Bu yazıda paylaştığım bilgilerin, konuya yaklaşımınızda faydalı olacağını umuyorum.`,
    ];

    for (let i = 0; i < paragraphCount; i++) {
      paragraphs += paragraphTemplates[i % paragraphTemplates.length] + "\n\n";
    }

    baseText += paragraphs;

    // Sonuç paragrafı
    baseText += `## Sonuç\n\n${topic} hakkında paylaştığım bu bilgilerin size faydalı olmasını umuyorum. Sorularınız veya yorumlarınız varsa, lütfen paylaşmaktan çekinmeyin. Gelecek yazılarda görüşmek üzere!`;

    return baseText;
  };

  // İçerik türü seçildiğinde
  const handleSelectContentType = (typeId) => {
    setContentType(typeId);
    // İlgili içerik türüne scroll yapma
    const index = contentTypes.findIndex((item) => item.id === typeId);
    if (index !== -1) {
      typeScrollRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // Ortala
      });
    }
  };

  // Üretilen metni paylaşma
  const shareGeneratedText = async () => {
    try {
      await Share.share({
        message: generatedText,
      });
    } catch (error) {
      Alert.alert("Hata", "Paylaşım sırasında bir hata oluştu.");
    }
  };

  // Üretilen metni kopyalama (Gerçek uygulamada Clipboard.setString kullanılır)
  const copyToClipboard = () => {
    // Clipboard.setString(generatedText);
    Alert.alert("Başarılı", "Metin panoya kopyalandı.");
  };

  // İçerik türü kartını render etme
  const renderContentTypeItem = ({ item, index }) => {
    const isSelected = contentType === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.contentTypeCard,
          isSelected && styles.contentTypeCardSelected,
          {
            backgroundColor: isSelected
              ? item.color + "33"
              : isDark
              ? colors.card
              : colors.white,
          },
        ]}
        onPress={() => handleSelectContentType(item.id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.contentTypeIconContainer,
            {
              backgroundColor: isSelected ? item.color : colors.card,
            },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={isSelected ? "#FFFFFF" : item.color}
          />
        </View>
        <Text
          style={[
            styles.contentTypeText,
            isSelected && { color: item.color, fontWeight: "bold" },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Giriş alanı placeholder metni
  const getPlaceholderText = () => {
    switch (contentType) {
      case "blog":
        return "Blog konunuzu girin...";
      case "social":
        return "Sosyal medya içeriğinizin konusunu girin...";
      case "email":
        return "E-posta konusunu girin...";
      case "story":
        return "Hikayenizin konusunu veya temasını girin...";
      case "academic":
        return "Akademik makalenizin konusunu girin...";
      case "business":
        return "İş metninizin anahtar kelimelerini girin...";
      case "cv":
        return "Özgeçmiş için pozisyon veya alan girin...";
      case "product":
        return "Ürün adı veya türünü girin...";
      case "recipe":
        return "Yemek veya malzemeleri girin...";
      case "poem":
        return "Şiir veya şarkı temasını girin...";
      case "news":
        return "Haber konusunu girin...";
      case "speech":
        return "Konuşma konusunu girin...";
      default:
        return "Yazınızın konusu ne olacak?";
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    gradientContainer: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding - 4,
      paddingBottom: 0, // Alt padding'i kaldırıyoruz
    },
    sectionTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      marginTop: 12,
      marginBottom: 8,
      paddingLeft: 4,
    },
    // Yeni stil - Kaydırılabilir kartlar için
    contentTypesList: {
      marginBottom: 12,
    },
    contentTypeCard: {
      width: width * 0.35,
      height: 90,
      marginRight: 10,
      borderRadius: 16,
      padding: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? colors.card : colors.white,
    },
    contentTypeCardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
      ...Platform.select({
        android: {
          borderWidth: 2.5,
        },
      }),
    },
    contentTypeIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
      overflow: "hidden",
    },
    contentTypeText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      textAlign: "center",
    },
    inputContainer: {
      backgroundColor: isDark ? colors.card : colors.white,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.lightGray,
    },
    inputLabel: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginBottom: 8,
      fontWeight: "500",
    },
    input: {
      backgroundColor: isDark ? colors.input : colors.white,
      borderRadius: 12,
      padding: 12,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.lightGray,
      minHeight: 80,
      maxHeight: 120,
      textAlignVertical: "top",
      ...FONTS.body3,
    },
    // Yazı tonu ve uzunluk seçimi
    optionRow: {
      flexDirection: "row",
      marginBottom: 6,
      paddingHorizontal: 4,
    },
    optionLabel: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginRight: 10,
      fontWeight: "500",
      alignSelf: "center",
      width: 80,
    },
    optionsScrollContainer: {
      flex: 1,
    },
    optionButton: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      backgroundColor: isDark ? colors.card : colors.white,
      borderRadius: 16,
      marginRight: 8,
    },
    optionButtonSelected: {
      backgroundColor: colors.primary + "22",
      borderColor: colors.primary,
      ...Platform.select({
        android: {
          borderWidth: 1.5,
        },
      }),
    },
    optionButtonText: {
      ...FONTS.body4,
      color: colors.textPrimary,
    },
    optionButtonTextSelected: {
      color: colors.primary,
      fontWeight: "bold",
    },
    // Buton stilleri
    generateButton: {
      marginVertical: 12,
      borderRadius: 25,
      overflow: "hidden",
    },
    generateButtonInner: {
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 25,
      overflow: "hidden",
    },
    generateButtonIcon: {
      marginRight: 8,
    },
    generateButtonText: {
      ...FONTS.h4,
      color: colors.white,
    },
    // Yükleniyor ve sonuç
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: isDark ? colors.card : colors.white,
      borderRadius: 16,
      marginVertical: 10,
    },
    loadingText: {
      ...FONTS.body3,
      color: colors.textPrimary,
      marginTop: 10,
    },
    resultContainer: {
      backgroundColor: isDark ? colors.card : colors.white,
      borderRadius: 16,
      padding: 16,
      marginVertical: 10,
      elevation: 3,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border : colors.lightGray,
      paddingBottom: 8,
    },
    resultTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
    },
    actionsContainer: {
      flexDirection: "row",
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? colors.card : colors.white,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
      overflow: "hidden",
    },
    resultContent: {
      ...FONTS.body3,
      color: colors.textPrimary,
      lineHeight: 22,
    },
    // Sonuç butonları
    newTextButton: {
      marginTop: 16,
      backgroundColor: colors.primary + "22",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      padding: 10,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    newTextButtonText: {
      ...FONTS.body4,
      color: colors.primary,
      marginLeft: 6,
      fontWeight: "bold",
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title="Yazı Üretici" showBackButton />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 0 }}
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
          >
            {/* İçerik türü seçimi - Yeni kaydırılabilir kart tasarımı */}
            <Text style={styles.sectionTitle}>İçerik Türü</Text>
            <FlatList
              ref={typeScrollRef}
              data={contentTypes}
              renderItem={renderContentTypeItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contentTypesList}
              onScrollToIndexFailed={() => {}}
            />

            {/* Konu girişi - Daha kompakt tasarım */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Konu veya Anahtar Kelimeler</Text>
              <TextInput
                style={styles.input}
                placeholder={getPlaceholderText()}
                placeholderTextColor={
                  isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)"
                }
                value={topic}
                onChangeText={setTopic}
                multiline
                maxLength={200}
              />
            </View>

            {/* Yazı tonu seçimi - Yatay kaydırmalı */}
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Yazı Tonu</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.optionsScrollContainer}
              >
                {toneOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      tone === option.id && styles.optionButtonSelected,
                    ]}
                    onPress={() => setTone(option.id)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        tone === option.id && styles.optionButtonTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Uzunluk seçimi - Yatay kaydırmalı */}
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Uzunluk</Text>
              <View style={styles.optionsScrollContainer}>
                {lengthOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      length === option.id && styles.optionButtonSelected,
                    ]}
                    onPress={() => setLength(option.id)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        length === option.id && styles.optionButtonTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Yazı üretme butonu - Gradyan arka planlı */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateText}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.generateButtonInner,
                  { opacity: loading ? 0.7 : 1 },
                ]}
                borderRadius={16}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="create-outline"
                      size={22}
                      color="#fff"
                      style={styles.generateButtonIcon}
                    />
                    <Text style={styles.generateButtonText}>Yazı Üret</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Yükleniyor göstergesi */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Yazınız hazırlanıyor, lütfen bekleyin...
                </Text>
              </View>
            )}

            {/* Üretilen içerik */}
            {showResult && (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Üretilen Yazı</Text>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={copyToClipboard}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={shareGeneratedText}
                    >
                      <Ionicons
                        name="share-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Markdown tarzında içerik gösterimi */}
                <Text style={styles.resultContent}>{generatedText}</Text>

                {/* Yeni yazı butonu */}
                <TouchableOpacity
                  style={styles.newTextButton}
                  onPress={() => {
                    setShowResult(false);
                    setGeneratedText("");
                    scrollViewRef.current?.scrollTo({
                      x: 0,
                      y: 0,
                      animated: true,
                    });
                  }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.newTextButtonText}>
                    Yeni Yazı Oluştur
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TextGeneratorScreen;
