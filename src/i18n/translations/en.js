const en = {
  // Dil İsimleri
  languages: {
    en: "English",
    tr: "Turkish",
  },

  // Genel
  common: {
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    skip: "Skip",
    done: "Done",
    loading: "Loading...",
    search: "Search",
    retry: "Retry",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    getStarted: "Get Started",
    continue: "Continue",
    or: "or",
  },

  // Kimlik doğrulama
  auth: {
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password",
    resetPassword: "Reset Password",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    loginInstead: "Login instead",
    registerInstead: "Register instead",
    loginSuccess: "You've successfully logged in!",
    registerSuccess: "Account created successfully!",
    invalidEmail: "Please enter a valid email address",
    passwordRequired: "Password is required",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    nameRequired: "Name is required",
    resetPasswordDesc: "Enter your email to receive a password reset link",
    checkYourEmail: "Check your email for a reset link",
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: "Welcome to DocAI",
      description:
        "Your smart document assistant powered by artificial intelligence",
    },
    upload: {
      title: "Easy Document Upload",
      description:
        "Upload or scan your documents for instant analysis and insights",
    },
    analyze: {
      title: "AI-Powered Analysis",
      description:
        "Get summaries, key points, and insights from your documents automatically",
    },
    ask: {
      title: "Ask Questions",
      description:
        "Chat with your documents and get instant answers to your questions",
    },
  },

  // Ana ekran
  home: {
    welcome: "Hello",
    recentDocuments: "Recent Documents",
    myDocuments: "My Documents",
    noDocuments: "No documents yet",
    uploadDocument: "Upload Document",
    scanDocument: "Scan Document",
  },

  // Belge işlemleri
  document: {
    details: "Document Details",
    summary: "Summary",
    keyPoints: "Key Points",
    askQuestion: "Ask a Question",
    analyze: "Analyze",
    share: "Share",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this document?",
    noSummary: "No summary available for this document",
    noAnalysis: "This document hasn't been analyzed yet",
    processingDocument: "Processing document...",
    uploadingDocument: "Uploading document...",
    documentType: "Document Type",
    documentSize: "Document Size",
    uploadDate: "Upload Date",
    askPlaceholder: "Ask something about this document...",
    thinking: "AI is thinking...",
    positionDocumentInFrame: "Position document within frame",
  },

  // Token/Kredi sistemi
  tokens: {
    yourBalance: "Your Balance",
    buyTokens: "Buy Tokens",
    notEnoughTokens: "Not enough tokens",
    addTokens: "Add Tokens",
    freeTrialUsed: "Free trial already used",
    freeTrialAvailable: "Free trial available",
    tokenUsage: "Token Usage",
    documentAnalysis: "1 token = Document analysis (up to 5 pages)",
    questionAnswering: "0.2 tokens = Ask a question (after first 3 free)",
    largeDocument: "2 tokens = Large document analysis (5+ pages)",
  },

  // Token Paketleri
  packages: {
    tokens20: {
      title: "Basic Package",
      description: "20 tokens for occasional use",
    },
    tokens50: {
      title: "Standard Package",
      description: "50 tokens with 20% savings",
    },
    tokens120: {
      title: "Premium Package",
      description: "120 tokens with 30% savings",
    },
    subscription: {
      title: "Monthly Subscription",
      description: "50 tokens per month + unlimited analysis",
    },
    purchaseSuccess: "Purchase successful!",
    bestValue: "Best Value",
    selectPackage: "Select a package",
  },

  // Profil
  profile: {
    myProfile: "My Profile",
    accountSettings: "Account Settings",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    signOut: "Sign Out",
    signOutConfirm: "Are you sure you want to sign out?",
    myTokens: "My Tokens",
    tokenHistory: "Token History",
    purchaseHistory: "Purchase History",
    help: "Help & Support",
    about: "About DocAI",
    version: "Version",
  },

  // Hata Mesajları
  errors: {
    somethingWentWrong: "Something went wrong",
    connectionError: "Connection error",
    tryAgain: "Please try again",
    cameraPermission: "Camera permission is required to scan documents",
    uploadFailed: "Document upload failed",
    analysisFailed: "Document analysis failed",
    authFailed: "Authentication failed",
  },
};

export default en;
