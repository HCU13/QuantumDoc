import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";

// ─── Section helpers ────────────────────────────────────────────────────────
function SectionTitle({ text, color }: { text: string; color: string }) {
  return (
    <Text style={[styles.sectionTitle, { color }]}>{text}</Text>
  );
}

function Paragraph({ text, color }: { text: string; color: string }) {
  return (
    <Text style={[styles.paragraph, { color }]}>{text}</Text>
  );
}

function BulletItem({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletDot, { color }]}>•</Text>
      <Text style={[styles.bulletText, { color }]}>{text}</Text>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function TermsScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { premiumPriceString } = useSubscription();
  const isTr = i18n.language === "tr";
  // Fiyat her zaman Apple/RevenueCat'ten dinamik — statik fallback sadece yüklenene kadar
  const priceDisplay = premiumPriceString || "...";

  const primary = colors.textPrimary;
  const secondary = colors.textSecondary;
  const accent = colors.primary ?? "#8B5CF6";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ModuleHeader title={t("profile.terms.title")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>

          {/* Header */}
          <Text style={[styles.docTitle, { color: primary }]}>
            {isTr ? "Kullanım Koşulları" : "Terms of Service"}
          </Text>
          <Text style={[styles.meta, { color: secondary }]}>
            {isTr
              ? "Yürürlük Tarihi: 4 Mart 2026\nSon Güncelleme: 4 Mart 2026"
              : "Effective Date: March 4, 2026\nLast Updated: March 4, 2026"}
          </Text>

          {/* 1 */}
          <SectionTitle color={accent}
            text={isTr ? "1. Koşulların Kabulü" : "1. Acceptance of Terms"} />
          <Paragraph color={primary} text={isTr
            ? "Quorax uygulamasını ('Uygulama') indirerek, yükleyerek veya kullanarak bu Kullanım Koşulları'nı ('Koşullar') ve Gizlilik Politikamızı kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız lütfen Uygulamayı kullanmayınız. Uygulamayı kullanmak için en az 13 yaşında olmanız gerekmektedir."
            : "By downloading, installing, or using the Quorax application (\"App\"), you agree to be bound by these Terms of Service (\"Terms\") and our Privacy Policy. If you do not agree to these Terms, please do not use the App. You must be at least 13 years old to use the App."} />

          {/* 2 */}
          <SectionTitle color={accent}
            text={isTr ? "2. Hizmetin Tanımı" : "2. Description of Service"} />
          <Paragraph color={primary} text={isTr
            ? "Quorax, yapay zeka destekli aşağıdaki özellikleri sunan bir mobil uygulamadır:"
            : "Quorax is an AI-powered mobile application offering the following features:"} />
          {(isTr ? [
            "Sınav Laboratuvarı — konu veya fotoğraftan AI destekli sınav oluşturma",
            "Matematik Çözücü — fotoğraf ve metin tabanlı adım adım çözüm",
            "AI Sohbet — Anthropic Claude ile konuşma asistanı",
            "Görüntü Analizörü — fotoğraf analizi ve açıklama",
            "Not Üreteci — AI destekli not ve özet oluşturma",
            "Metin Editörü — AI destekli metin düzenleme ve iyileştirme",
          ] : [
            "Exam Lab — AI-generated exams from topics or photos",
            "Math Solver — step-by-step solutions from text or photos",
            "AI Chat — conversational assistant powered by Anthropic Claude",
            "Image Analyzer — photo analysis and description",
            "Note Generator — AI-powered note and summary creation",
            "Text Editor — AI-powered text editing and improvement",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 3 */}
          <SectionTitle color={accent}
            text={isTr ? "3. Kullanıcı Hesabı" : "3. User Account"} />
          <Paragraph color={primary} text={isTr
            ? "Bazı özellikler için hesap oluşturmanız gerekebilir. Hesabınızla ilgili şunlardan sorumlusunuzdur:"
            : "Certain features require you to create an account. You are responsible for:"} />
          {(isTr ? [
            "Doğru ve güncel bilgi sağlamak",
            "Hesap şifrenizi gizli tutmak",
            "Hesabınızda gerçekleşen tüm etkinlikler",
            "Yetkisiz erişimi derhal bize bildirmek",
          ] : [
            "Providing accurate and current information",
            "Keeping your account password confidential",
            "All activity that occurs under your account",
            "Notifying us immediately of any unauthorized access",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 4 */}
          <SectionTitle color={accent}
            text={isTr ? "4. Premium Abonelik ve Ödemeler" : "4. Premium Subscription & Payments"} />
          <Paragraph color={primary} text={isTr
            ? "Quorax, aylık yenilenen premium abonelik sunar. Abonelik koşulları:"
            : "Quorax offers a monthly auto-renewing premium subscription. Subscription terms:"} />
          {(isTr ? [
            "Abonelik, App Store üzerinden satın alınır ve yönetilir.",
            `Fiyatlandırma: aylık ${priceDisplay} (vergi hariç; ülkeye göre değişebilir).`,
            "Abonelikler, mevcut dönem bitmeden en az 24 saat önce iptal edilmediği takdirde otomatik olarak yenilenir.",
            "Yenileme ücreti, mevcut dönemin bitişinden 24 saat öncesine kadar Apple kimliğine borçlandırılır.",
            "Aboneliği App Store üzerinden Ayarlar > Apple Kimliği > Abonelikler bölümünden iptal edebilirsiniz.",
            "İptal ücreti alınmaz; mevcut dönem sonuna kadar premium avantajlardan yararlanmaya devam edersiniz.",
          ] : [
            "Subscriptions are purchased and managed through the App Store.",
            `Pricing: ${priceDisplay}/month (excl. taxes; may vary by country).`,
            "Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.",
            "Your Apple ID will be charged for renewal within 24 hours prior to the end of the current period.",
            "You can cancel your subscription in Settings > Apple ID > Subscriptions on your device.",
            "No cancellation fee applies; premium benefits continue until the end of the current period.",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 5 */}
          <SectionTitle color={accent}
            text={isTr ? "5. Ücretsiz ve Premium Katman" : "5. Free vs. Premium Tier"} />
          <Paragraph color={primary} text={isTr
            ? "Ücretsiz kullanıcılar günlük kullanım limitlerine ve reklam gösterimine tabidir. Premium aboneler:"
            : "Free users are subject to daily usage limits and ad display. Premium subscribers enjoy:"} />
          {(isTr ? [
            "Tüm AI modülleri için artırılmış günlük limit",
            "Reklamsız deneyim",
            "Öncelikli AI işleme",
          ] : [
            "Increased daily limits across all AI modules",
            "Ad-free experience",
            "Priority AI processing",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 6 */}
          <SectionTitle color={accent}
            text={isTr ? "6. AI İçeriği ve Sorumluluk Reddi" : "6. AI-Generated Content & Disclaimer"} />
          <Paragraph color={primary} text={isTr
            ? "Quorax'ın ürettiği tüm içerik Anthropic'in Claude modeli tarafından oluşturulmaktadır. Şunları kabul edersiniz:"
            : "All content generated by Quorax is produced by Anthropic's Claude model. You acknowledge:"} />
          {(isTr ? [
            "AI yanıtları her zaman doğru veya eksiksiz olmayabilir.",
            "Sınav soruları ve çözümler referans amaçlıdır; resmi eğitim kurumlarının yerine geçmez.",
            "Tıbbi, hukuki veya finansal kararlar için AI çıktısına güvenmemelisiniz.",
            "Hatalı içerik için Quorax sorumluluk kabul etmez.",
          ] : [
            "AI responses may not always be accurate or complete.",
            "Exam questions and solutions are for reference purposes and do not replace official educational institutions.",
            "You should not rely on AI output for medical, legal, or financial decisions.",
            "Quorax accepts no liability for erroneous AI-generated content.",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 7 */}
          <SectionTitle color={accent}
            text={isTr ? "7. Kabul Edilemez Kullanım" : "7. Prohibited Use"} />
          <Paragraph color={primary} text={isTr
            ? "Aşağıdaki amaçlarla Uygulamayı kullanamazsınız:"
            : "You may not use the App for the following purposes:"} />
          {(isTr ? [
            "Yasadışı faaliyetler veya zararlı içerik üretmek",
            "Uygulamayı tersine mühendislik, çoğaltma veya dağıtmak",
            "Başkalarını taciz etmek, tehdit etmek veya zarar vermek",
            "Sistem kaynaklarını aşırı yükleyecek otomatik sorgular göndermek",
            "Üçüncü taraf hizmetlerin kullanım koşullarını ihlal etmek",
          ] : [
            "Engaging in illegal activities or producing harmful content",
            "Reverse engineering, copying, or distributing the App",
            "Harassing, threatening, or causing harm to others",
            "Sending automated queries that overload system resources",
            "Violating the terms of service of third-party services",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 8 */}
          <SectionTitle color={accent}
            text={isTr ? "8. Fikri Mülkiyet" : "8. Intellectual Property"} />
          <Paragraph color={primary} text={isTr
            ? "Uygulama ve tüm içerikleri (tasarım, kod, görseller, AI sistem prompt'ları dahil) Quorax'a aittir ve telif hukuku ile diğer fikri mülkiyet yasalarıyla korunmaktadır. Sizin tarafınızdan oluşturulan içerikler (sorduğunuz sorular, yüklediğiniz fotoğraflar) size aittir; ancak Quorax'a hizmet iyileştirme amacıyla bu içerikleri kullanma lisansı vermiş olursunuz."
            : "The App and all its content (including design, code, visuals, and AI system prompts) are owned by Quorax and protected by copyright and other intellectual property laws. Content you create (questions you ask, photos you upload) remains yours; however, you grant Quorax a license to use such content for service improvement purposes."} />

          {/* 9 */}
          <SectionTitle color={accent}
            text={isTr ? "9. Reklamlar" : "9. Advertisements"} />
          <Paragraph color={primary} text={isTr
            ? "Ücretsiz katman kullanıcılarına Google AdMob aracılığıyla reklam gösterilir. Reklamlar hakkında:"
            : "Free tier users are shown advertisements via Google AdMob. Regarding ads:"} />
          {(isTr ? [
            "Reklamlar Google'ın gizlilik politikasına tabidir.",
            "Kişiselleştirilmiş reklamları cihaz ayarlarından devre dışı bırakabilirsiniz.",
            "Premium abonelik satın alarak reklamları tamamen kaldırabilirsiniz.",
          ] : [
            "Advertisements are subject to Google's privacy policy.",
            "You can opt out of personalized ads via your device settings.",
            "You can remove ads entirely by purchasing a Premium subscription.",
          ]).map((item, i) => <BulletItem key={i} text={item} color={primary} />)}

          {/* 10 */}
          <SectionTitle color={accent}
            text={isTr ? "10. Sorumluluk Sınırlaması" : "10. Limitation of Liability"} />
          <Paragraph color={primary} text={isTr
            ? "Quorax'ın toplam sorumluluğu, söz konusu olaydan önceki 12 aylık dönemde ödediğiniz abonelik ücretleriyle sınırlıdır. Quorax, dolaylı, tesadüfi, özel, sonuçsal veya cezai zararlar dahil olmak üzere herhangi bir kayıp veya zarardan sorumlu tutulamaz. Bu kısıtlama yürürlükteki hukukun izin verdiği azami ölçüde geçerlidir."
            : "Quorax's total liability is limited to subscription fees paid by you in the 12-month period preceding the event in question. Quorax shall not be liable for any indirect, incidental, special, consequential, or punitive damages. This limitation applies to the maximum extent permitted by applicable law."} />

          {/* 11 */}
          <SectionTitle color={accent}
            text={isTr ? "11. Garanti Reddi" : "11. Disclaimer of Warranties"} />
          <Paragraph color={primary} text={isTr
            ? "Uygulama 'OLDUĞU GİBİ' ve 'MEVCUT OLDUĞU HÂLDE' sunulmaktadır; açık veya zımni hiçbir garanti verilmemektedir. Quorax, Uygulamanın kesintisiz, hatasız veya güvenli olacağını garanti etmez. Belirli bir amaca uygunluk veya ihlal yapmama garantisi dahil olmak üzere tüm garantiler reddedilmektedir."
            : "The App is provided \"AS IS\" and \"AS AVAILABLE\" without any warranties, express or implied. Quorax does not warrant that the App will be uninterrupted, error-free, or secure. All warranties, including fitness for a particular purpose and non-infringement, are disclaimed."} />

          {/* 12 */}
          <SectionTitle color={accent}
            text={isTr ? "12. Değişiklikler" : "12. Changes to Terms"} />
          <Paragraph color={primary} text={isTr
            ? "Quorax bu Koşulları istediği zaman değiştirme hakkını saklı tutar. Önemli değişiklikler Uygulama içi bildirim veya e-posta ile duyurulacaktır. Değişikliklerin yayımlanmasından sonra Uygulamayı kullanmaya devam etmeniz, güncellenmiş Koşulları kabul ettiğiniz anlamına gelir."
            : "Quorax reserves the right to modify these Terms at any time. Material changes will be announced via in-app notification or email. Continued use of the App following publication of changes constitutes acceptance of the updated Terms."} />

          {/* 13 */}
          <SectionTitle color={accent}
            text={isTr ? "13. Hesap Feshi" : "13. Account Termination"} />
          <Paragraph color={primary} text={isTr
            ? "Quorax, bu Koşullar'ı ihlal eden hesapları önceden bildirim yapmaksızın askıya alma veya sonlandırma hakkını saklı tutar. Hesabınızı dilediğiniz zaman Profil > Hesabı Sil seçeneğiyle silebilirsiniz."
            : "Quorax reserves the right to suspend or terminate accounts that violate these Terms without prior notice. You may delete your account at any time via Profile > Delete Account."} />

          {/* 14 */}
          <SectionTitle color={accent}
            text={isTr ? "14. Uygulanacak Hukuk" : "14. Governing Law"} />
          <Paragraph color={primary} text={isTr
            ? "Bu Koşullar Türk hukukuna tabidir. Bu Koşullar'dan kaynaklanan uyuşmazlıklar öncelikle dostane yollarla çözülmeye çalışılacak; anlaşmazlık hâlinde Türk mahkemelerinin yargı yetkisi kabul edilir."
            : "These Terms are governed by the laws of Turkey. Disputes arising from these Terms will first be resolved amicably; failing that, the parties submit to the jurisdiction of Turkish courts."} />

          {/* 15 */}
          <SectionTitle color={accent}
            text={isTr ? "15. Gizlilik Politikası" : "15. Privacy Policy"} />
          <Paragraph color={primary} text={isTr
            ? "Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında ayrıntılı bilgi için Profil > Gizlilik Politikası sayfasını inceleyiniz."
            : "For detailed information on how your personal data is collected, used, and protected, please review our Privacy Policy at Profile > Privacy Policy."} />

          {/* 16 — Contact */}
          <SectionTitle color={accent}
            text={isTr ? "16. İletişim" : "16. Contact"} />
          <Paragraph color={primary} text={isTr
            ? "Kullanım Koşulları hakkında sorularınız için:\n\nE-posta: support@quorax.app\nUygulama içi: Profil > Yardım & Destek"
            : "For questions about these Terms:\n\nEmail: support@quorax.app\nIn-app: Profile > Help & Support"} />

          <Text style={[styles.versionNote, { color: secondary }]}>
            {isTr
              ? "Sürüm 1.0 · 4 Mart 2026"
              : "Version 1.0 · March 4, 2026"}
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
