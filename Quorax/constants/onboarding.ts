export interface OnboardingSlide {
  id: string;
  title: string;
  titleKey: string;
  description: string;
  descriptionKey: string;
  icon: string;
  gradient: string[];
  features?: string[];
  isConsent?: boolean;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Quorax\'a Hoş Geldin',
    titleKey: 'onboarding.slide1.title',
    description: 'Yapay zeka ile öğrenmek artık çok daha kolay. Sınava hazırlan, matematik çöz, soru sor.',
    descriptionKey: 'onboarding.slide1.description',
    icon: '🚀',
    gradient: ['#8A4FFF', '#6932E0'],
    features: ['AI Destekli', 'Ücretsiz Başla', 'Türkçe & İngilizce'],
  },
  {
    id: '2',
    title: 'AI Sohbet Asistanı',
    titleKey: 'onboarding.slide2.title',
    description: 'Her konuda akıllı asistanınla sohbet et. Ödevlerini açıkla, kavramları anla, sorularını yanıtla.',
    descriptionKey: 'onboarding.slide2.description',
    icon: '🤖',
    gradient: ['#3B82F6', '#1D4ED8'],
    features: ['Anlık Yanıt', 'Her Konu', 'Sohbet Geçmişi'],
  },
  {
    id: '3',
    title: 'Matematik Çözücü',
    titleKey: 'onboarding.slide3.title',
    description: 'Problemini yaz veya fotoğrafla. Cebir, geometri, kalkülüs — adım adım açıklamalı çözüm.',
    descriptionKey: 'onboarding.slide3.description',
    icon: '🧮',
    gradient: ['#10B981', '#059669'],
    features: ['Fotoğrafla Çöz', 'Adım Adım', 'Doğrulama'],
  },
  {
    id: '4',
    title: 'Sınav Kampı',
    titleKey: 'onboarding.slide4.title',
    description: 'İstediğin konuda test oluştur. Zorluk seviyesi, soru sayısı, hatta ders fotoğrafından bile.',
    descriptionKey: 'onboarding.slide4.description',
    icon: '📝',
    gradient: ['#F59E0B', '#D97706'],
    features: ['AI Test Üret', '3 Zorluk', 'Detaylı Analiz'],
  },
];
