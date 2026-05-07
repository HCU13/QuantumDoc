export interface Module {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string; // Ionicons name
  iconType?: 'outline' | 'solid'; // Icon style
  surfaceTint?: string; // Subtle surface tint color (muted, professional)
  route?: string;
  isPrimary?: boolean; // Hero/primary module
  height?: number; // Kart yüksekliği (px)
}

// Niş: Matematik çöz + Sınav pratiği. Önce iki ana aksiyon (primary), sonra diğer araçlar.
export const MODULES: Module[] = [
  {
    id: 'math',
    titleKey: 'modules.math.title',
    descriptionKey: 'modules.math.description',
    icon: 'calculator-outline',
    iconType: 'outline',
    surfaceTint: '#F5F3FF',
    isPrimary: true,
    height: 140,
  },
  {
    id: 'exam-lab',
    titleKey: 'modules.examLab.title',
    descriptionKey: 'modules.examLab.description',
    icon: 'document-text-outline',
    iconType: 'outline',
    surfaceTint: '#FFF4E6',
    isPrimary: true,
    height: 140,
  },
  {
    id: 'chat',
    titleKey: 'modules.chat.title',
    descriptionKey: 'modules.chat.description',
    icon: 'chatbubble-ellipses',
    iconType: 'outline',
    surfaceTint: '#F0F4F8',
    height: 120,
  },
  {
    id: 'calculator',
    titleKey: 'modules.calculator.title',
    descriptionKey: 'modules.calculator.description',
    icon: 'calculator',
    iconType: 'outline',
    surfaceTint: '#F0FDF4',
    height: 120,
  },
];

