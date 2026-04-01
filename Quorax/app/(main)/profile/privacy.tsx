import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";

function SectionTitle({ text, color }: { text: string; color: string }) {
  return <Text style={[styles.sectionTitle, { color }]}>{text}</Text>;
}

function Paragraph({ text, color }: { text: string; color: string }) {
  return <Text style={[styles.paragraph, { color }]}>{text}</Text>;
}

function BulletItem({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletDot, { color }]}>•</Text>
      <Text style={[styles.bulletText, { color }]}>{text}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isTr = i18n.language === "tr";

  const primary = colors.textPrimary;
  const secondary = colors.textSecondary;
  const accent = colors.primary ?? "#8B5CF6";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ModuleHeader title={t("profile.privacy.title")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>

          <Text style={[styles.docTitle, { color: primary }]}>
            {isTr ? "Gizlilik Politikası" : "Privacy Policy"}
          </Text>
          <Text style={[styles.meta, { color: secondary }]}>
            {isTr
              ? "Yürürlük Tarihi: 4 Mart 2026\nSon Güncelleme: 4 Mart 2026"
              : "Effective Date: March 4, 2026\nLast Updated: March 4, 2026"}
          </Text>

          {/* 1 */}
          <SectionTitle color={accent}
            text={isTr ? "1. Giriş ve Kapsam" : "1. Introduction & Scope"} />
          <Paragraph color={primary} text={isTr
            ? "Quorax (\"biz\", \"bizim\") olarak kişisel verilerinizin gizliliğini ciddiye alıyoruz. Bu Gizlilik Politikası; Quorax mobil uygulamasını (\"Uygulama\") kullandığınızda hangi verileri topladığımızı, bu verileri nasıl işlediğimizi, kimlerle paylaştığımızı ve haklarınızın neler olduğunu açıklar. Uygulamayı kullanmaya devam ederek bu politikayı kabul etmiş olursunuz."
            : "At Quorax (\"we\", \"our\"), we take the privacy of your personal data seriously. This Privacy Policy explains what data we collect when you use the Quorax mobile application (\"App\"), how we process it, with whom we share it, and what your rights are. By continuing to use the App, you accept this policy."} />

          {/* 2 */}
          <SectionTitle color={accent}
            text={isTr ? "2. Topladığımız Veriler" : "2. Data We Collect"} />
          <Paragraph color={primary} text={isTr ? "a) Hesap ve Profil Bilgileri" : "a) Account & Profile Information"} />
          {(isTr ? [
            "Ad soyad, e-posta adresi",
            "Profil fotoğrafı (seçimli)",
            "Şifrelenmiş parola ve kimlik doğrulama token'ları",
          ] : [
            "Full name, email address",
            "Profile photo (optional)",
            "Encrypted password and authentication tokens",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          <Paragraph color={primary} text={isTr ? "b) Uygulama Kullanım Verileri" : "b) App Usage Data"} />
          {(isTr ? [
            "Kullanılan özellikler, oturum süresi, ekran görüntülemeleri",
            "IP adresi, cihaz modeli, işletim sistemi sürümü",
            "Uygulama çökme logları ve hata raporları",
          ] : [
            "Features used, session duration, screens viewed",
            "IP address, device model, operating system version",
            "App crash logs and error reports",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          <Paragraph color={primary} text={isTr ? "c) AI Modüllerine Gönderilen İçerik" : "c) Content Submitted to AI Modules"} />
          {(isTr ? [
            "Sohbet mesajları ve AI yanıtları",
            "Matematik problemleri (metin veya fotoğraf)",
            "Görüntü analizi için yüklenen fotoğraflar",
            "Not veya metin düzenleme amacıyla girilen metinler",
            "Sınav Laboratuvarı için girilen konu ve fotoğraflar",
          ] : [
            "Chat messages and AI responses",
            "Math problems (text or photo)",
            "Photos uploaded for image analysis",
            "Text entered for note generation or editing",
            "Topics and photos submitted to Exam Lab",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          <Paragraph color={primary} text={isTr ? "d) Ödeme ve Abonelik Verileri" : "d) Payment & Subscription Data"} />
          {(isTr ? [
            "Satın alınan ürünler, tarih ve tutarlar (Apple/Google üzerinden)",
            "Premium abonelik durumu ve yenileme tarihleri",
            "Kredi kartı veya banka bilgileri tarafımızca saklanmaz; tüm ödeme işlemleri Apple App Store veya Google Play Store tarafından yönetilir.",
          ] : [
            "Products purchased, dates and amounts (via Apple/Google)",
            "Premium subscription status and renewal dates",
            "Credit card or banking details are not stored by us; all payment processing is handled by Apple App Store or Google Play Store.",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 3 */}
          <SectionTitle color={accent}
            text={isTr ? "3. Verilerin İşlenme Amaçları ve Hukuki Dayanakları" : "3. Purposes & Legal Bases for Processing"} />
          {(isTr ? [
            "Hesap oluşturma ve kimlik doğrulama — Sözleşmenin ifası",
            "AI özelliklerinin sunulması (Claude aracılığıyla) — Sözleşmenin ifası & açık rıza",
            "Abonelik ve ödeme yönetimi — Sözleşmenin ifası",
            "Uygulama performansını iyileştirme — Meşru menfaat",
            "Dolandırıcılık ve kötüye kullanımın önlenmesi — Meşru menfaat & yasal yükümlülük",
            "Pazarlama iletişimleri — Açık rıza (her zaman geri çekilebilir)",
            "Reklam kişiselleştirme — Açık rıza (cihaz ayarlarından kontrol edilebilir)",
          ] : [
            "Account creation and authentication — Performance of contract",
            "Delivery of AI features (via Claude) — Performance of contract & explicit consent",
            "Subscription and payment management — Performance of contract",
            "App performance improvement — Legitimate interest",
            "Fraud prevention and abuse detection — Legitimate interest & legal obligation",
            "Marketing communications — Explicit consent (withdrawable at any time)",
            "Ad personalization — Explicit consent (controllable via device settings)",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 4 */}
          <SectionTitle color={accent}
            text={isTr ? "4. Üçüncü Taraflarla Veri Paylaşımı" : "4. Third-Party Data Sharing"} />
          <Paragraph color={primary} text={isTr
            ? "Verileriniz aşağıdaki hizmet sağlayıcılarla, yalnızca hizmetin sunulması için gerekli olan ölçüde paylaşılır:"
            : "Your data is shared with the following service providers only to the extent necessary to deliver the service:"} />
          {(isTr ? [
            "Anthropic, Inc. (Claude AI) — AI modüllerine gönderilen içerik; Anthropic'in gizlilik politikasına tabidir ve modeli eğitmek için kullanılmaz.",
            "Supabase — Veritabanı barındırma ve kimlik doğrulama",
            "RevenueCat — Abonelik ve satın alma yönetimi",
            "Google AdMob — Ücretsiz katman reklamları (kişiselleştirme kapatılabilir)",
            "Apple / Google — Uygulama dağıtımı ve ödeme işleme",
          ] : [
            "Anthropic, Inc. (Claude AI) — Content submitted to AI modules; subject to Anthropic's privacy policy and not used to train their models.",
            "Supabase — Database hosting and authentication",
            "RevenueCat — Subscription and purchase management",
            "Google AdMob — Free tier advertising (personalization can be disabled)",
            "Apple / Google — App distribution and payment processing",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}
          <Paragraph color={primary} text={isTr
            ? "Kişisel verilerinizi üçüncü taraflara satmıyor, kiralamıyor veya pazarlama amacıyla devretmiyoruz."
            : "We do not sell, rent, or transfer your personal data to third parties for marketing purposes."} />

          {/* 5 */}
          <SectionTitle color={accent}
            text={isTr ? "5. Veri Saklama Süreleri" : "5. Data Retention"} />
          {(isTr ? [
            "Aktif hesap: Veriler hesap aktif olduğu sürece saklanır.",
            "Hesap silme: Kişisel veriler silme talebinden itibaren 30 gün içinde kalıcı olarak silinir.",
            "Yedek sistemler: Yedeklerden silme, rutin yedek döngüsü tamamlandığında gerçekleşir (en fazla 90 gün).",
            "Yasal yükümlülük: Vergi ve muhasebe kayıtları gibi bazı veriler yasal zorunluluklar nedeniyle daha uzun süre saklanabilir.",
          ] : [
            "Active account: Data is retained while the account is active.",
            "Account deletion: Personal data is permanently deleted within 30 days of the deletion request.",
            "Backup systems: Deletion from backups occurs when the routine backup cycle completes (maximum 90 days).",
            "Legal obligation: Certain data such as tax and accounting records may be retained longer due to legal requirements.",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 6 */}
          <SectionTitle color={accent}
            text={isTr ? "6. Veri Güvenliği" : "6. Data Security"} />
          {(isTr ? [
            "Aktarım sırasında TLS/SSL şifrelemesi",
            "Depolamada AES-256 şifrelemesi",
            "Yetkili personele sınırlı erişim ve rol tabanlı erişim kontrolleri",
            "Düzenli güvenlik denetimleri ve güvenlik açığı taramaları",
            "Güvenli bulut altyapısı (Supabase)",
          ] : [
            "TLS/SSL encryption in transit",
            "AES-256 encryption at rest",
            "Limited access for authorized personnel with role-based access controls",
            "Regular security audits and vulnerability scans",
            "Secure cloud infrastructure (Supabase)",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}
          <Paragraph color={primary} text={isTr
            ? "İnternet üzerinden hiçbir veri aktarımı veya elektronik depolama yöntemi %100 güvenli değildir. Güvenlik ihlali yaşanması hâlinde, yasal süre içinde etkilenen kullanıcıları ve ilgili otoriteleri bilgilendireceğiz."
            : "No method of data transmission over the Internet or electronic storage is 100% secure. In the event of a security breach, we will notify affected users and relevant authorities within the legally required timeframe."} />

          {/* 7 */}
          <SectionTitle color={accent}
            text={isTr ? "7. Kullanıcı Hakları" : "7. Your Rights"} />
          <Paragraph color={primary} text={isTr
            ? "KVKK, GDPR ve geçerli diğer veri koruma mevzuatı kapsamında aşağıdaki haklara sahipsiniz:"
            : "Under KVKK, GDPR, and other applicable data protection laws, you have the following rights:"} />
          {(isTr ? [
            "Erişim hakkı: Hakkınızda hangi verileri işlediğimizi öğrenme",
            "Düzeltme hakkı: Hatalı veya eksik verilerinizin düzeltilmesini talep etme",
            "Silme hakkı (unutulma hakkı): Belirli koşullarda verilerinizin silinmesini talep etme",
            "İşlemeyi kısıtlama hakkı: Belirli durumlarda veri işlemenin sınırlandırılmasını talep etme",
            "Veri taşınabilirliği hakkı: Verilerinizi makine tarafından okunabilir formatta alma",
            "İtiraz hakkı: Meşru menfaate dayalı işlemeye itiraz etme",
            "Rızayı geri çekme hakkı: Rızaya dayalı her işleme için onayı istediğiniz zaman geri çekme",
            "Şikayet hakkı: Kişisel Verileri Koruma Kurumu'na (KVKK) veya yerel veri koruma otoritenize şikayette bulunma",
          ] : [
            "Right of access: Learn what data we process about you",
            "Right to rectification: Request correction of inaccurate or incomplete data",
            "Right to erasure (right to be forgotten): Request deletion of your data under certain conditions",
            "Right to restrict processing: Request limitation of data processing in certain situations",
            "Right to data portability: Receive your data in a machine-readable format",
            "Right to object: Object to processing based on legitimate interest",
            "Right to withdraw consent: Withdraw consent for any consent-based processing at any time",
            "Right to lodge a complaint: File a complaint with the Personal Data Protection Authority (KVKK) or your local data protection authority",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}
          <Paragraph color={primary} text={isTr
            ? "Haklarınızı kullanmak için privacy@quorax.app adresine e-posta gönderin veya Uygulama içinde Profil > Yardım & Destek üzerinden destek talebi oluşturun. Talepler en geç 30 gün içinde yanıtlanır."
            : "To exercise your rights, email privacy@quorax.app or submit a support request via Profile > Help & Support in the App. Requests are responded to within 30 days."} />

          {/* 8 */}
          <SectionTitle color={accent}
            text={isTr ? "8. Çocukların Gizliliği" : "8. Children's Privacy"} />
          <Paragraph color={primary} text={isTr
            ? "Uygulama 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın altındaki bireylerden bilerek kişisel veri toplamıyoruz. Ebeveyn veya vasi olarak çocuğunuzun bizimle kişisel veri paylaştığını fark ederseniz lütfen privacy@quorax.app adresinden bizimle iletişime geçin; söz konusu verileri derhal sileceğiz."
            : "The App is not directed at children under 13. We do not knowingly collect personal data from individuals under 13. If you are a parent or guardian and discover that your child has shared personal data with us, please contact us at privacy@quorax.app and we will promptly delete such data."} />

          {/* 9 */}
          <SectionTitle color={accent}
            text={isTr ? "9. Uluslararası Veri Transferleri" : "9. International Data Transfers"} />
          <Paragraph color={primary} text={isTr
            ? "Verileriniz, Anthropic (ABD) ve Supabase (AB/ABD) gibi hizmet sağlayıcılarımızın altyapısı nedeniyle yurt dışına aktarılabilir. Bu aktarımlar; AB Standart Sözleşme Maddeleri (SCC), ABD–AB Veri Gizliliği Çerçevesi veya diğer geçerli güvence mekanizmaları kapsamında gerçekleştirilmektedir. KVKK'nın yurt dışı aktarım hükümleri de gözetilmektedir."
            : "Your data may be transferred internationally due to the infrastructure of our service providers such as Anthropic (USA) and Supabase (EU/USA). Such transfers are carried out under EU Standard Contractual Clauses (SCCs), the US–EU Data Privacy Framework, or other applicable safeguard mechanisms. The cross-border transfer provisions of KVKK are also observed."} />

          {/* 10 */}
          <SectionTitle color={accent}
            text={isTr ? "10. Reklamlar ve Kişiselleştirme" : "10. Advertising & Personalization"} />
          {(isTr ? [
            "Ücretsiz katman kullanıcılarına Google AdMob aracılığıyla reklam gösterilir.",
            "Reklamlar ilgi alanlarınıza göre kişiselleştirilebilir (Google'ın gizlilik politikasına tabidir).",
            "Kişiselleştirilmiş reklamları cihaz ayarlarınızdan devre dışı bırakabilirsiniz (iOS: Ayarlar > Gizlilik > Apple Reklamları / Android: Ayarlar > Google > Reklamlar).",
            "Premium abonelik ile reklamları tamamen kaldırabilirsiniz.",
          ] : [
            "Free tier users are shown ads via Google AdMob.",
            "Ads may be personalized based on your interests (subject to Google's privacy policy).",
            "You can disable personalized ads in your device settings (iOS: Settings > Privacy > Apple Advertising / Android: Settings > Google > Ads).",
            "You can remove ads entirely by purchasing a Premium subscription.",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 11 */}
          <SectionTitle color={accent}
            text={isTr ? "11. Çerezler ve Yerel Depolama" : "11. Cookies & Local Storage"} />
          <Paragraph color={primary} text={isTr
            ? "Uygulama, cihazınızda aşağıdaki verileri yerel olarak saklar; web tarayıcılarındaki anlamıyla çerez kullanmaz:"
            : "The App stores the following data locally on your device and does not use cookies in the web browser sense:"} />
          {(isTr ? [
            "Oturum ve kimlik doğrulama token'ları",
            "Dil, tema ve bildirim tercihleri",
            "Kullanım ilerlemesi (örn. günlük limit durumu)",
          ] : [
            "Session and authentication tokens",
            "Language, theme, and notification preferences",
            "Usage progress (e.g. daily limit status)",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 12 */}
          <SectionTitle color={accent}
            text={isTr ? "12. Politika Değişiklikleri" : "12. Policy Changes"} />
          <Paragraph color={primary} text={isTr
            ? "Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler Uygulama içi bildirim ve/veya e-posta ile en az 14 gün önceden duyurulacaktır. Bildirim döneminin ardından uygulamayı kullanmaya devam etmeniz güncellenmiş politikayı kabul ettiğiniz anlamına gelir."
            : "We may update this policy from time to time. Material changes will be announced via in-app notification and/or email at least 14 days in advance. Continued use of the App after the notice period constitutes acceptance of the updated policy."} />

          {/* 13 */}
          <SectionTitle color={accent}
            text={isTr ? "13. İletişim ve Veri Sorumlusu" : "13. Contact & Data Controller"} />
          <Paragraph color={primary} text={isTr
            ? "Veri Sorumlusu: Quorax\nGizlilik talepleri: privacy@quorax.app\nGenel destek: support@quorax.app\nUygulama içi: Profil > Yardım & Destek\nWeb: https://quorax.app\n\nTalepler en geç 30 gün içinde yanıtlanır."
            : "Data Controller: Quorax\nPrivacy requests: privacy@quorax.app\nGeneral support: support@quorax.app\nIn-app: Profile > Help & Support\nWeb: https://quorax.app\n\nRequests are responded to within 30 days."} />

          <Text style={[styles.versionNote, { color: secondary }]}>
            {isTr ? "Sürüm 2.0 · 4 Mart 2026" : "Version 2.0 · March 4, 2026"}
          </Text>

        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  docTitle: {
    ...TEXT_STYLES.titleLarge,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  meta: {
    ...TEXT_STYLES.bodySmall,
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "700",
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  paragraph: {
    ...TEXT_STYLES.bodyMedium,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  bulletDot: {
    ...TEXT_STYLES.bodyMedium,
    marginRight: SPACING.sm,
    lineHeight: 24,
  },
  bulletText: {
    ...TEXT_STYLES.bodyMedium,
    lineHeight: 24,
    flex: 1,
  },
  versionNote: {
    ...TEXT_STYLES.labelSmall,
    marginTop: SPACING.xl,
    textAlign: "center",
    opacity: 0.6,
  },
});
