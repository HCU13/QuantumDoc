const tr = {
  // Dil İsimleri
  languages: {
    en: "İngilizce",
    tr: "Türkçe",
  },

  // Genel
  common: {
    cancel: "İptal",
    confirm: "Onayla",
    save: "Kaydet",
    delete: "Sil",
    edit: "Düzenle",
    back: "Geri",
    next: "İleri",
    skip: "Atla",
    done: "Tamam",
    loading: "Yükleniyor...",
    search: "Ara",
    retry: "Tekrar Dene",
    error: "Hata",
    success: "Başarılı",
    warning: "Uyarı",
    info: "Bilgi",
    getStarted: "Başla",
    continue: "Devam Et",
    or: "veya",
  },

  // Kimlik doğrulama
  auth: {
    login: "Giriş",
    register: "Kayıt Ol",
    forgotPassword: "Şifremi Unuttum",
    resetPassword: "Şifremi Sıfırla",
    email: "E-posta",
    password: "Şifre",
    confirmPassword: "Şifre Tekrar",
    fullName: "Ad Soyad",
    alreadyHaveAccount: "Zaten hesabınız var mı?",
    dontHaveAccount: "Hesabınız yok mu?",
    loginInstead: "Giriş yap",
    registerInstead: "Kayıt ol",
    loginSuccess: "Başarıyla giriş yaptınız!",
    registerSuccess: "Hesabınız başarıyla oluşturuldu!",
    invalidEmail: "Geçerli bir e-posta adresi girin",
    passwordRequired: "Şifre gerekli",
    passwordTooShort: "Şifre en az 6 karakter olmalı",
    passwordsDoNotMatch: "Şifreler eşleşmiyor",
    nameRequired: "Ad soyad gerekli",
    resetPasswordDesc:
      "Şifre sıfırlama bağlantısı almak için e-posta adresinizi girin",
    checkYourEmail: "Sıfırlama bağlantısı için e-postanızı kontrol edin",
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: "DocAI'ya Hoş Geldiniz",
      description: "Yapay zeka destekli akıllı belge asistanınız",
    },
    upload: {
      title: "Kolay Belge Yükleme",
      description:
        "Belgelerinizi yükleyin veya tarayın, anında analiz ve içgörüler elde edin",
    },
    analyze: {
      title: "Yapay Zeka Analizi",
      description:
        "Belgelerinizden otomatik olarak özetler, ana noktalar ve içgörüler alın",
    },
    ask: {
      title: "Soru Sorun",
      description:
        "Belgelerinizle sohbet edin ve sorularınıza anında cevaplar alın",
    },
  },

  // Ana ekran
  home: {
    welcome: "Merhaba",
    recentDocuments: "Son Belgeler",
    myDocuments: "Belgelerim",
    noDocuments: "Henüz belge yok",
    uploadDocument: "Belge Yükle",
    scanDocument: "Belge Tara",
  },

  // Belge işlemleri
  document: {
    details: "Belge Detayları",
    summary: "Özet",
    keyPoints: "Ana Noktalar",
    askQuestion: "Soru Sor",
    analyze: "Analiz Et",
    share: "Paylaş",
    delete: "Sil",
    deleteConfirm: "Bu belgeyi silmek istediğinizden emin misiniz?",
    noSummary: "Bu belge için özet bulunmuyor",
    noAnalysis: "Bu belge henüz analiz edilmemiş",
    processingDocument: "Belge işleniyor...",
    uploadingDocument: "Belge yükleniyor...",
    documentType: "Belge Türü",
    documentSize: "Belge Boyutu",
    uploadDate: "Yükleme Tarihi",
    askPlaceholder: "Bu belge hakkında bir şey sorun...",
    thinking: "AI düşünüyor...",
    positionDocumentInFrame: "Belgeyi çerçeve içinde konumlandırın",
  },

  // Token/Kredi sistemi
  tokens: {
    yourBalance: "Bakiyeniz",
    buyTokens: "Token Satın Al",
    notEnoughTokens: "Yeterli token yok",
    addTokens: "Token Ekle",
    freeTrialUsed: "Ücretsiz deneme kullanıldı",
    freeTrialAvailable: "Ücretsiz deneme mevcut",
    tokenUsage: "Token Kullanımı",
    documentAnalysis: "1 token = Belge analizi (5 sayfaya kadar)",
    questionAnswering: "0.2 token = Soru sorma (ilk 3 ücretsiz sorudan sonra)",
    largeDocument: "2 token = Büyük belge analizi (5+ sayfa)",
  },

  // Token Paketleri
  packages: {
    tokens20: {
      title: "Temel Paket",
      description: "Ara sıra kullanım için 20 token",
    },
    tokens50: {
      title: "Standart Paket",
      description: "%20 tasarrufla 50 token",
    },
    tokens120: {
      title: "Premium Paket",
      description: "%30 tasarrufla 120 token",
    },
    subscription: {
      title: "Aylık Abonelik",
      description: "Ayda 50 token + sınırsız analiz",
    },
    purchaseSuccess: "Satın alma başarılı!",
    bestValue: "En İyi Değer",
    selectPackage: "Bir paket seçin",
  },

  // Profil
  profile: {
    myProfile: "Profilim",
    accountSettings: "Hesap Ayarları",
    language: "Dil",
    theme: "Tema",
    darkMode: "Karanlık Mod",
    lightMode: "Aydınlık Mod",
    signOut: "Çıkış Yap",
    signOutConfirm: "Çıkış yapmak istediğinizden emin misiniz?",
    myTokens: "Tokenlerim",
    tokenHistory: "Token Geçmişi",
    purchaseHistory: "Satın Alma Geçmişi",
    help: "Yardım ve Destek",
    about: "DocAI Hakkında",
    version: "Versiyon",
  },

  // Hata Mesajları
  errors: {
    somethingWentWrong: "Bir şeyler yanlış gitti",
    connectionError: "Bağlantı hatası",
    tryAgain: "Lütfen tekrar deneyin",
    cameraPermission: "Belge taramak için kamera izni gerekli",
    uploadFailed: "Belge yükleme başarısız oldu",
    analysisFailed: "Belge analizi başarısız oldu",
    authFailed: "Kimlik doğrulama başarısız oldu",
  },
};

export default tr;
