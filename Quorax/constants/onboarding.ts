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
  /** Optional demo equation rendered as a static "try it" preview (no real solve). */
  demoEquation?: string;
  demoAnswer?: string;
  /** Step-by-step preview rendered under the equation — sells the "step-by-step" promise. */
  demoSteps?: string[];
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Quorax\'a Hoş Geldin',
    titleKey: 'onboarding.slide1.title',
    description: 'Matematik çöz, test üret, soru sor — hepsi tek uygulamada.',
    descriptionKey: 'onboarding.slide1.description',
    icon: '🚀',
    gradient: ['#8A4FFF', '#6932E0'],
    features: ['Kayıt gerekmez', '3 gün ücretsiz deneme', 'Reklamsız'],
  },
  {
    id: '2',
    title: 'AI Sohbet Asistanı',
    titleKey: 'onboarding.slide2.title',
    description: 'Konu konu ayrılmış sohbetler aç. Fotoğraf, PDF veya dosya yükle, kaldığın yerden devam et.',
    descriptionKey: 'onboarding.slide2.description',
    icon: '🤖',
    gradient: ['#3B82F6', '#1D4ED8'],
    features: ['Görsel & PDF yükle', 'Sınırsız sohbet sayısı', 'Otomatik kayıt'],
  },
  {
    id: '3',
    title: 'Matematik Çözücü',
    titleKey: 'onboarding.slide3.title',
    description: 'Denklemi yaz veya kameraya tut. Her adımın gerekçesiyle birlikte çözümü göster, sonucu doğrula.',
    descriptionKey: 'onboarding.slide3.description',
    icon: '🧮',
    gradient: ['#10B981', '#059669'],
    features: ['Kameradan tara', 'Cebir · Geometri · Türev · İntegral', 'Çözümü doğrula'],
    demoEquation: '2x + 5 = 13',
    demoAnswer: 'x = 4',
    demoSteps: ['2x = 13 − 5', '2x = 8', 'x = 8 ÷ 2'],
  },
  {
    id: '4',
    title: 'Sınav Kampı',
    titleKey: 'onboarding.slide4.title',
    description: 'YKS, LGS veya kendi konularından test üret. Süre tut, yanlışlarını çözümleriyle gör.',
    descriptionKey: 'onboarding.slide4.description',
    icon: '📝',
    gradient: ['#F59E0B', '#D97706'],
    features: ['Ders notundan test üret', 'Kolay · Orta · Zor', 'Yanlışlara özel açıklama'],
  },
];
