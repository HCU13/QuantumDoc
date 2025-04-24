import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";

const PrivacyScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
      paddingBottom: 30,
    },
    title: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      marginVertical: 20,
      textAlign: "center",
    },
    lastUpdated: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: "center",
      fontStyle: "italic",
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginBottom: 12,
      fontWeight: "bold",
    },
    paragraph: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginBottom: 10,
      lineHeight: 22,
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 5,
      paddingLeft: 10,
    },
    bulletPoint: {
      ...FONTS.body4,
      color: colors.primary,
      marginRight: 5,
      fontWeight: "bold",
    },
    bulletText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      flex: 1,
      lineHeight: 22,
    },
    bold: {
      fontWeight: "bold",
    },
    highlightBox: {
      backgroundColor: isDark
        ? "rgba(100, 210, 255, 0.2)"
        : "rgba(100, 210, 255, 0.1)",
      borderRadius: SIZES.radius,
      padding: 15,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: "rgba(100, 210, 255, 0.3)",
    },
    highlightText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      lineHeight: 22,
    },
    link: {
      color: colors.primary,
      textDecorationLine: "underline",
    },
  });

  const renderBullet = (text) => (
    <View style={styles.bullet}>
      <Text style={styles.bulletPoint}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        /> */}

        <Header title="Gizlilik Politikası" showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Gizlilik Politikası</Text>
          <Text style={styles.lastUpdated}>Son güncelleme: 23 Nisan 2025</Text>

          <View style={styles.section}>
            <Text style={styles.paragraph}>
              Bu gizlilik politikası, AI Asistan uygulamasının ("Uygulama")
              kullanımı sırasında bilgilerinizin nasıl toplandığını,
              kullanıldığını ve korunduğunu açıklar. Uygulamayı kullanarak, bu
              politikada belirtilen uygulamaları kabul etmiş olursunuz.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Toplanan Bilgiler</Text>
            <Text style={styles.paragraph}>
              Uygulamamız, size hizmet verebilmek için aşağıdaki bilgileri
              toplayabilir:
            </Text>
            {renderBullet(
              "Hesap Bilgileri: E-posta adresi, ad-soyad, profil fotoğrafı gibi kayıt sırasında verdiğiniz bilgiler."
            )}
            {renderBullet(
              "Kullanım Verileri: Uygulama içi etkileşimler, sohbet geçmişi, kullanılan özellikler ve içerik tercihleri."
            )}
            {renderBullet(
              "Cihaz Bilgileri: Cihaz modeli, işletim sistemi, uygulama versiyonu ve ağ bilgileri."
            )}
            {renderBullet(
              "Konum Verileri: Eğer izin verirseniz, konuma dayalı hizmetler sunmak için coğrafi konum bilgileriniz."
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Bilgilerin Kullanımı</Text>
            <Text style={styles.paragraph}>
              Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:
            </Text>
            {renderBullet("Hizmetlerimizi sunmak ve iyileştirmek")}
            {renderBullet("AI yanıtlarını kişiselleştirmek ve geliştirmek")}
            {renderBullet("Hesabınızı yönetmek ve güvenliğini sağlamak")}
            {renderBullet(
              "Teknik sorunları gidermek ve uygulama performansını analiz etmek"
            )}
            {renderBullet(
              "Yeni özellikler ve güncellemeler hakkında bilgilendirmek"
            )}
            {renderBullet("Dolandırıcılık ve kötüye kullanımı önlemek")}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Veri Saklama</Text>
            <Text style={styles.paragraph}>
              Verilerinizi, hizmetlerimizi sağlamak için gerekli olduğu sürece
              saklarız. "Geçmiş Kaydetme" özelliğini kapatırsanız, sohbet
              geçmişiniz cihazınızda veya sunucularımızda saklanmaz. Hesabınızı
              sildiğinizde, tüm kişisel verileriniz 30 gün içinde kalıcı olarak
              silinir.
            </Text>

            <View style={styles.highlightBox}>
              <Text style={styles.highlightText}>
                <Text style={styles.bold}>Önemli: </Text>
                Uygulama kullanımınızla ilgili bazı temel veriler (örn. hata
                günlükleri, sistem verileri), hizmetin sürdürülebilmesi için
                daha uzun süre saklanabilir. Bu veriler, kişisel bilgilerinizden
                arındırılmış olarak saklanır.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Veri Paylaşımı</Text>
            <Text style={styles.paragraph}>
              Kişisel bilgilerinizi şu durumlarda paylaşabiliriz:
            </Text>
            {renderBullet(
              "Hizmet Sağlayıcılar: Uygulamamızın çalışmasına yardımcı olan güvenilir üçüncü taraf hizmet sağlayıcılarla."
            )}
            {renderBullet(
              "Yasal Gereklilikler: Yasalara uymak, yasal süreçlere cevap vermek veya güvenliğimizi korumak için gereken durumlarda."
            )}
            {renderBullet(
              "İş Ortakları: Eğer 'Üçüncü Taraf Paylaşımı' özelliğini etkinleştirirseniz, anonim kullanım verileriniz araştırma ve geliştirme amacıyla paylaşılabilir."
            )}

            <Text style={styles.paragraph}>
              Kişisel verilerinizi, açık izniniz olmadan üçüncü taraf pazarlama
              amaçları için satmayız, kiralamayız veya paylaşmayız.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              5. Kullanıcı Kontrolleri ve Hakları
            </Text>
            <Text style={styles.paragraph}>
              Uygulamada aşağıdaki gizlilik kontrollerine erişebilirsiniz:
            </Text>
            {renderBullet(
              "Veri Tasarrufu: Daha az veri kullanarak AI yanıtları alma"
            )}
            {renderBullet(
              "Geçmiş Kaydetme: Sohbet ve etkinlik geçmişinizi saklama kontrolü"
            )}
            {renderBullet(
              "Anonim Analitik: Uygulamayı geliştirmek için anonim verilerin paylaşılması"
            )}
            {renderBullet(
              "Kişiselleştirilmiş İçerik: İlgi alanlarınıza göre öneriler alma"
            )}
            {renderBullet(
              "Üçüncü Taraf Paylaşımı: Anonim verilerin araştırma ortaklarıyla paylaşılması"
            )}
            {renderBullet(
              "Konum İzleme: Konuma dayalı özelliklerin etkinleştirilmesi"
            )}

            <Text style={styles.paragraph}>Ayrıca şu haklara sahipsiniz:</Text>
            {renderBullet("Verilerinize erişmek ve indirmek")}
            {renderBullet("Verilerinizin düzeltilmesini talep etmek")}
            {renderBullet("Verilerinizin silinmesini talep etmek")}
            {renderBullet("Veri işlemeye itiraz etmek")}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Veri Güvenliği</Text>
            <Text style={styles.paragraph}>
              Verilerinizi korumak için endüstri standardı güvenlik önlemleri
              kullanıyoruz. Buna şifreleme, güvenli erişim kontrolleri ve
              düzenli güvenlik denetimleri dahildir. Ancak, hiçbir elektronik
              iletim veya depolama yöntemi %100 güvenli değildir. Verilerinizi
              korumak için makul önlemler alırken, mutlak güvenliği garanti
              edemeyiz.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Çocukların Gizliliği</Text>
            <Text style={styles.paragraph}>
              Hizmetlerimiz 13 yaşın altındaki çocuklara yönelik değildir.
              Bilerek 13 yaşın altındaki çocuklardan kişisel bilgi toplamayız.
              Eğer bir ebeveyn veya vasi iseniz ve çocuğunuzun bize kişisel
              bilgiler verdiğini düşünüyorsanız, lütfen bizimle iletişime geçin.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Değişiklikler</Text>
            <Text style={styles.paragraph}>
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli
              değişiklikler olduğunda sizi bilgilendireceğiz. Uygulamayı
              kullanmaya devam etmeniz, güncel gizlilik politikasını kabul
              ettiğiniz anlamına gelir.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. İletişim</Text>
            <Text style={styles.paragraph}>
              Bu gizlilik politikası hakkında sorularınız veya endişeleriniz
              varsa, lütfen bizimle iletişime geçin:
            </Text>
            <Text style={[styles.paragraph, styles.link]}>
              privacy@aiapp.com
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default PrivacyScreen;
