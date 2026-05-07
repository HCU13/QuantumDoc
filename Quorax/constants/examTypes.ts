// Her subject'in kendi dili var (ALES → Türkçe, SAT → English) — i18n gerektirmez
export interface ExamSubject {
  id: string;
  label: string;
  promptHint: string; // Bu bölüme özel AI yönlendirmesi
  subjectPlaceholder: string; // Bu bölüm seçilince text input placeholder'ı (sınav dili)
}

export interface ExamType {
  id: string;
  label: string;
  flag: string;
  country: string;
  countryKey: string;
  promptHint: string; // Sınav stilini AI'ya anlatan genel prompt
  topicPlaceholder: string; // Serbest konu girişi placeholder'ı (subjects boşsa gösterilir)
  // subjects boşsa → sadece serbest text göster (AP, A-Levels, GCSE, IB gibi sınavlar)
  subjects: ExamSubject[];
}

export interface ExamCountry {
  id: string;
  nameKey: string;
  flag: string;
  exams: ExamType[];
}

export const EXAM_COUNTRIES: ExamCountry[] = [
  // ─── GENEL ─────────────────────────────────────────────────────────────────
  {
    id: "none",
    nameKey: "examLab.examTypes.countries.none",
    flag: "🌐",
    exams: [
      {
        id: "general",
        label: "General",
        flag: "🌐",
        country: "none",
        countryKey: "examLab.examTypes.countries.none",
        promptHint: "General academic style, balanced difficulty, clear 4-choice MCQ format.",
        topicPlaceholder: "examLab.examTypes.placeholders.general",
        subjects: [],
      },
    ],
  },

  // ─── TÜRKİYE ───────────────────────────────────────────────────────────────
  {
    id: "tr",
    nameKey: "examLab.examTypes.countries.tr",
    flag: "🇹🇷",
    exams: [
      {
        id: "yks-tyt",
        label: "YKS TYT",
        flag: "🇹🇷",
        country: "tr",
        countryKey: "examLab.examTypes.countries.tr",
        promptHint:
          "YKS TYT (Temel Yeterlilik Testi) sınav stilinde sorular üret. Türk lise müfredatı, 4 şıklı çoktan seçmeli. Dil: Türkçe.",
        topicPlaceholder: "examLab.examTypes.placeholders.tyt",
        subjects: [
          {
            id: "turkce",
            label: "Türkçe",
            promptHint: "TYT Türkçe bölümü: paragraf anlama, ana düşünce, kelime anlamı, sözcük türleri, cümle bilgisi, anlatım bozukluğu, yazım kuralları. Soru ifadeleri Türkçe bölümüne özgü olsun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_turkce",
          },
          {
            id: "temel-mat",
            label: "Temel Matematik",
            promptHint: "TYT Temel Matematik bölümü: sayılar, sayı basamakları, bölünebilme, EBOB-EKOK, oran-orantı, yüzde-faiz, kesirler, tam sayılar, ondalık sayılar, kümeler, mantık, fonksiyonlar, denklemler, eşitsizlikler. İşlem gerektiren sorular olsun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_mat",
          },
          {
            id: "geometri",
            label: "Geometri",
            promptHint: "TYT Geometri: temel geometri kavramları, üçgenler, dörtgenler, çokgenler, çember ve daire, koordinat sistemi, dönüşümler. Şekil betimlemeli sorular olabilir.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_geometri",
          },
          {
            id: "tarih",
            label: "Tarih",
            promptHint: "TYT Sosyal Bilimler — Tarih: Türk tarihi (Osmanlı'dan Cumhuriyet'e), dünya tarihi, inkılaplar. 5 soru formatına uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_tarih",
          },
          {
            id: "cografya",
            label: "Coğrafya",
            promptHint: "TYT Sosyal Bilimler — Coğrafya: Türkiye fiziki ve beşeri coğrafyası, iklim, nüfus, ekonomi, bölgeler. 5 soru formatına uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_cografya",
          },
          {
            id: "felsefe",
            label: "Felsefe",
            promptHint: "TYT Sosyal Bilimler — Felsefe: felsefenin tanımı, felsefi akımlar, filozoflar ve görüşleri, mantık, etik. 5 soru formatına uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_felsefe",
          },
          {
            id: "din",
            label: "Din Kültürü",
            promptHint: "TYT Sosyal Bilimler — Din Kültürü: İslam'ın temel kavramları, ibadetler, Hz. Muhammed, diğer dinler, ahlak. 5 soru formatına uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_din",
          },
          {
            id: "fizik",
            label: "Fizik",
            promptHint: "TYT Fen Bilimleri — Fizik: kuvvet-hareket, enerji, dalgalar, elektrik, optik. 7 soru formatına uygun, lise düzeyi.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_fizik",
          },
          {
            id: "kimya",
            label: "Kimya",
            promptHint: "TYT Fen Bilimleri — Kimya: atom yapısı, periyodik tablo, kimyasal bağlar, maddenin halleri, karışımlar, asit-baz. 7 soru formatına uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_kimya",
          },
          {
            id: "biyoloji",
            label: "Biyoloji",
            promptHint: "TYT Fen Bilimleri — Biyoloji: hücre, canlıların sınıflandırılması, insan vücudu, ekosistem, kalıtım temelleri. 6 soru formatına uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.tyt_biyoloji",
          },
        ],
      },
      {
        id: "yks-ayt",
        label: "YKS AYT",
        flag: "🇹🇷",
        country: "tr",
        countryKey: "examLab.examTypes.countries.tr",
        promptHint:
          "YKS AYT (Alan Yeterlilik Testi) sınav stilinde sorular üret. Lise son sınıf düzeyi, alan bazlı, 4 şıklı çoktan seçmeli. Dil: Türkçe.",
        topicPlaceholder: "examLab.examTypes.placeholders.ayt",
        subjects: [
          {
            id: "mat",
            label: "Matematik",
            promptHint: "AYT Matematik: polinomlar, ikinci dereceden denklemler, üslü-köklü ifadeler, logaritma, trigonometri, türev, integral, limit, karmaşık sayılar, diziler-seriler, olasılık, istatistik, permütasyon-kombinasyon. İleri düzey, 40 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ayt_mat",
          },
          {
            id: "fizik",
            label: "Fizik",
            promptHint: "AYT Fizik: kuvvet ve hareket, iş-güç-enerji, dalgalar, optik, elektrik, manyetizma, modern fizik. İleri düzey, hesap ve kavram sorularını dengeli dağıt.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ayt_fizik",
          },
          {
            id: "kimya",
            label: "Kimya",
            promptHint: "AYT Kimya: atom ve periyodik sistem, kimyasal bağlar, gazlar, çözeltiler, kimyasal denge, asit-baz, elektrokimya, organik kimya, termokimya. İleri düzey.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ayt_kimya",
          },
          {
            id: "biyoloji",
            label: "Biyoloji",
            promptHint: "AYT Biyoloji: hücre biyolojisi, mitoz-mayoz, kalıtım ve genetik, evrim, ekosistem ve ekoloji, bitki ve hayvan fizyolojisi, biyoteknoloji. İleri düzey.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ayt_biyoloji",
          },
          {
            id: "edebiyat",
            label: "Türk Dili ve Edebiyatı",
            promptHint: "AYT Edebiyat: şiir türleri ve dönemleri, nesir türleri, edebi akımlar, önemli eserler ve yazarlar, Divan edebiyatı, Tanzimat-Servetifünun-Cumhuriyet dönemi edebiyatı.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ayt_edebiyat",
          },
          {
            id: "tarih",
            label: "Tarih (1+2)",
            promptHint: "AYT Tarih: Osmanlı kuruluş-yükselme-duraklama-çöküş dönemi, 19. yy ıslahatları, Kurtuluş Savaşı, Türk inkılap tarihi, Atatürk ilkeleri, Türkiye Cumhuriyeti tarihi.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ayt_tarih",
          },
          {
            id: "cografya",
            label: "Coğrafya (1+2)",
            promptHint: "AYT Coğrafya: Türkiye ve dünya fiziki coğrafyası, iklim sistemleri, nüfus ve yerleşme, ekonomik faaliyetler, bölgesel coğrafya, çevre sorunları.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ayt_cografya",
          },
          {
            id: "felsefe",
            label: "Felsefe Grubu",
            promptHint: "AYT Felsefe Grubu: felsefe, psikoloji, sosyoloji, mantık. Felsefi akımlar, önemli filozoflar, psikolojik kuramlar, toplumsal yapı kavramları.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ayt_felsefe",
          },
        ],
      },
      {
        id: "lgs",
        label: "LGS",
        flag: "🇹🇷",
        country: "tr",
        countryKey: "examLab.examTypes.countries.tr",
        promptHint:
          "LGS (Liselere Geçiş Sınavı) stilinde sorular üret. 8. sınıf düzeyi, günlük hayatla bağlantılı, 4 şıklı çoktan seçmeli. Dil: Türkçe.",
        topicPlaceholder: "examLab.examTypes.placeholders.lgs",
        subjects: [
          {
            id: "turkce",
            label: "Türkçe",
            promptHint: "LGS Türkçe: okuduğunu anlama, kelime anlamı, sözcük türleri, cümle bilgisi, paragraf soruları. 8. sınıf düzeyi, 20 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.lgs_turkce",
          },
          {
            id: "matematik",
            label: "Matematik",
            promptHint: "LGS Matematik: sayılar-işlemler, cebir, geometri, veri-istatistik, olasılık. 8. sınıf müfredatı, 20 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.lgs_mat",
          },
          {
            id: "fen",
            label: "Fen Bilimleri",
            promptHint: "LGS Fen Bilimleri: madde ve özellikleri, kuvvet-enerji, dalgalar-ses-ışık, hücre-kalıtım, canlılar, çevre. 8. sınıf müfredatı, 20 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.lgs_fen",
          },
          {
            id: "inkilap",
            label: "İnkılap Tarihi",
            promptHint: "LGS T.C. İnkılap Tarihi ve Atatürkçülük: Kurtuluş Savaşı, inkılaplar, Atatürk ilkeleri, çok partili hayata geçiş. 8. sınıf düzeyi, 10 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.lgs_inkilap",
          },
          {
            id: "din",
            label: "Din Kültürü",
            promptHint: "LGS Din Kültürü ve Ahlak Bilgisi: ibadetler, İslam ahlakı, Hz. Muhammed'in hayatı, diğer din ve kültürler. 8. sınıf düzeyi, 10 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.lgs_din",
          },
          {
            id: "ingilizce",
            label: "İngilizce",
            promptHint: "LGS İngilizce: 8. sınıf düzeyi kelime ve gramer, okuma anlama, günlük diyaloglar. Sorular Türkçe sorulabilir, şıklar ve metinler İngilizce. 10 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.lgs_ing",
          },
        ],
      },
      {
        id: "kpss",
        label: "KPSS",
        flag: "🇹🇷",
        country: "tr",
        countryKey: "examLab.examTypes.countries.tr",
        promptHint:
          "KPSS (Kamu Personel Seçme Sınavı) stilinde sorular üret. 4 şıklı çoktan seçmeli. Dil: Türkçe.",
        topicPlaceholder: "examLab.examTypes.placeholders.kpss",
        subjects: [
          {
            id: "turkce",
            label: "Türkçe",
            promptHint: "KPSS Genel Yetenek — Türkçe: paragraf anlama, ana fikir, dil bilgisi, kelime anlamı, atasözü-deyim, yazım-noktalama. 30 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.kpss_turkce",
          },
          {
            id: "matematik",
            label: "Matematik",
            promptHint: "KPSS Genel Yetenek — Matematik: sayılar, bölünebilme, EBOB-EKOK, oran-orantı, yüzde, faiz, hız-mesafe-zaman, temel cebir. 26 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.kpss_mat",
          },
          {
            id: "geometri",
            label: "Geometri",
            promptHint: "KPSS Genel Yetenek — Geometri: açılar, üçgenler, dörtgenler, çember, alan-hacim, koordinat geometrisi. 4 soru bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.kpss_geometri",
          },
          {
            id: "tarih",
            label: "Tarih",
            promptHint: "KPSS Genel Kültür — Tarih: Osmanlı tarihi, Kurtuluş Savaşı, Atatürk inkılapları, Türkiye Cumhuriyeti tarihi, dünya tarihi özet. Genel kültür bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.kpss_tarih",
          },
          {
            id: "cografya",
            label: "Coğrafya",
            promptHint: "KPSS Genel Kültür — Coğrafya: Türkiye'nin coğrafi özellikleri, iklim, nüfus, ekonomik faaliyetler, bölgeler. Genel kültür bölümüne uygun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.kpss_cografya",
          },
          {
            id: "vatandaslik",
            label: "Vatandaşlık",
            promptHint: "KPSS Genel Kültür — Vatandaşlık: Türkiye Cumhuriyeti Anayasası, temel hak ve özgürlükler, yasama-yürütme-yargı organları, seçim sistemi, AB süreci.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.kpss_vatandaslik",
          },
        ],
      },
      {
        id: "ales",
        label: "ALES",
        flag: "🇹🇷",
        country: "tr",
        countryKey: "examLab.examTypes.countries.tr",
        promptHint:
          "ALES (Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı) stilinde sorular üret. Akademik yetenek ölçer, 4 şıklı çoktan seçmeli. Dil: Türkçe.",
        topicPlaceholder: "examLab.examTypes.placeholders.ales",
        subjects: [
          {
            id: "sayisal",
            label: "Sayısal",
            promptHint: "ALES Sayısal bölümü: matematiksel akıl yürütme, sayı dizileri, oran-orantı, hız-zaman-mesafe, yüzde-faiz, problem çözme, yorumlama. Soyut düşünme ve çok adımlı akıl yürütme gerektiren sorular. Cevaplar kesinlikle sayısal değer veya dört şıktan biri olsun.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ales_sayisal",
          },
          {
            id: "sozel",
            label: "Sözel",
            promptHint: "ALES Sözel bölümü: kelime anlamı, eş anlam-karşıt anlam, cümle tamamlama, anlam ilişkileri, paragraf anlama, dil bilgisi, mantıksal çıkarım. Akademik dil düzeyi.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ales_sozel",
          },
        ],
      },
    ],
  },

  // ─── ABD ───────────────────────────────────────────────────────────────────
  {
    id: "us",
    nameKey: "examLab.examTypes.countries.us",
    flag: "🇺🇸",
    exams: [
      {
        id: "sat",
        label: "SAT",
        flag: "🇺🇸",
        country: "us",
        countryKey: "examLab.examTypes.countries.us",
        promptHint:
          "SAT (College Board, digital format) style questions. 4-choice MCQ, American high school level. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.sat",
        subjects: [
          {
            id: "reading-writing",
            label: "Reading & Writing",
            promptHint: "SAT Reading & Writing module: evidence-based reading comprehension, vocabulary in context, rhetorical analysis, grammar (subject-verb agreement, punctuation, sentence boundaries, transitions). Academic passage style.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.sat_rw",
          },
          {
            id: "math-algebra",
            label: "Math – Algebra",
            promptHint: "SAT Math — Algebra: linear equations, systems of equations, linear inequalities, linear functions, ratios, percentages, proportions. Multi-step problem solving.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.sat_algebra",
          },
          {
            id: "math-advanced",
            label: "Math – Advanced",
            promptHint: "SAT Math — Advanced: quadratic functions, polynomial equations, exponential growth/decay, radical equations, absolute value, complex numbers.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.sat_advanced",
          },
          {
            id: "math-data",
            label: "Math – Data & Geometry",
            promptHint: "SAT Math — Data Analysis & Geometry: statistics, probability, scatterplots, two-way tables, area, volume, trigonometry, circle theorems.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.sat_data",
          },
        ],
      },
      {
        id: "act",
        label: "ACT",
        flag: "🇺🇸",
        country: "us",
        countryKey: "examLab.examTypes.countries.us",
        promptHint:
          "ACT exam style questions. 4-choice MCQ, practical application focused. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.act",
        subjects: [
          {
            id: "english",
            label: "English",
            promptHint: "ACT English: grammar, punctuation, sentence structure, rhetorical skills — usage, mechanics, style and organization. 50 questions style.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.act_english",
          },
          {
            id: "math",
            label: "Mathematics",
            promptHint: "ACT Math: pre-algebra, elementary algebra, intermediate algebra, coordinate geometry, plane geometry, trigonometry. 45 questions, calculator allowed.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.act_math",
          },
          {
            id: "reading",
            label: "Reading",
            promptHint: "ACT Reading: prose fiction, social sciences, humanities, natural sciences passages. Detail, main idea, inference, vocabulary in context questions.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.act_reading",
          },
          {
            id: "science",
            label: "Science",
            promptHint: "ACT Science: data representation, research summaries, conflicting viewpoints — biology, earth/space science, chemistry, physics interpretation.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.act_science",
          },
        ],
      },
      {
        id: "gre",
        label: "GRE",
        flag: "🇺🇸",
        country: "us",
        countryKey: "examLab.examTypes.countries.us",
        promptHint:
          "GRE (Graduate Record Examination) style. Graduate-level, 4-choice MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.gre",
        subjects: [
          {
            id: "verbal",
            label: "Verbal Reasoning",
            promptHint: "GRE Verbal Reasoning: text completion (1-3 blanks), sentence equivalence, reading comprehension. Graduate-level academic vocabulary, analytical reading. Complex passage-based questions.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.gre_verbal",
          },
          {
            id: "quant",
            label: "Quantitative Reasoning",
            promptHint: "GRE Quantitative Reasoning: arithmetic, algebra, geometry, data analysis and interpretation. Multi-step problem solving at graduate entrance level. Include quantitative comparison questions.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.gre_quant",
          },
        ],
      },
      {
        // AP'de öğrenci kendi dersini seçiyor (40 farklı ders var) — chip listesi değil serbest text
        id: "ap",
        label: "AP Exam",
        flag: "🇺🇸",
        country: "us",
        countryKey: "examLab.examTypes.countries.us",
        promptHint:
          "AP (Advanced Placement) exam style. College-level rigor, subject-specific depth, 4-choice MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.ap",
        subjects: [], // Serbest text: öğrenci hangi AP dersini istiyorsa yazar
      },
    ],
  },

  // ─── İNGİLTERE ─────────────────────────────────────────────────────────────
  {
    id: "uk",
    nameKey: "examLab.examTypes.countries.uk",
    flag: "🇬🇧",
    exams: [
      {
        // A-Levels'da öğrenci 3-4 ders seçiyor, listesi yüzlerce — serbest text
        id: "a-levels",
        label: "A-Levels",
        flag: "🇬🇧",
        country: "uk",
        countryKey: "examLab.examTypes.countries.uk",
        promptHint:
          "A-Level exam style (UK, age 16-18). Subject-specific, analytical, high depth, 4-choice MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.alevels",
        subjects: [], // Serbest text: öğrenci hangi A-Level dersini çalışıyorsa yazar
      },
      {
        // GCSE'de 8-10 ders, seçmeli çok geniş — serbest text
        id: "gcse",
        label: "GCSE",
        flag: "🇬🇧",
        country: "uk",
        countryKey: "examLab.examTypes.countries.uk",
        promptHint:
          "GCSE style (UK, age 14-16). Applied knowledge, 4-choice MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.gcse",
        subjects: [], // Serbest text: öğrenci hangi GCSE dersini çalışıyorsa yazar
      },
    ],
  },

  // ─── HİNDİSTAN ─────────────────────────────────────────────────────────────
  {
    id: "in",
    nameKey: "examLab.examTypes.countries.in",
    flag: "🇮🇳",
    exams: [
      {
        id: "jee",
        label: "JEE",
        flag: "🇮🇳",
        country: "in",
        countryKey: "examLab.examTypes.countries.in",
        promptHint:
          "JEE (Joint Entrance Examination) style. Engineering entrance, highly analytical, multi-step problem solving, 4-choice MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.jee",
        subjects: [
          {
            id: "physics",
            label: "Physics",
            promptHint: "JEE Physics: mechanics (kinematics, Newton's laws, work-energy, rotation, gravitation), waves, thermodynamics, electrostatics, current electricity, magnetism, optics, modern physics. Multi-step analytical problems, numerical heavy.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.jee_physics",
          },
          {
            id: "chemistry",
            label: "Chemistry",
            promptHint: "JEE Chemistry: Physical (thermodynamics, equilibrium, electrochemistry, kinetics), Inorganic (periodic table, bonding, p/d-block elements), Organic (mechanisms, named reactions, biomolecules). Concept and calculation mixed.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.jee_chemistry",
          },
          {
            id: "mathematics",
            label: "Mathematics",
            promptHint: "JEE Mathematics: algebra (complex numbers, matrices, sequences), calculus (limits, derivatives, integrals, differential equations), coordinate geometry, trigonometry, vectors and 3D geometry. Rigorous analytical problems.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.jee_math",
          },
        ],
      },
      {
        id: "neet",
        label: "NEET",
        flag: "🇮🇳",
        country: "in",
        countryKey: "examLab.examTypes.countries.in",
        promptHint:
          "NEET (National Eligibility cum Entrance Test) style. Medical entrance, application-based, 4-choice MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.neet",
        subjects: [
          {
            id: "botany",
            label: "Botany",
            promptHint: "NEET Botany (45 questions style): plant morphology, anatomy, reproduction in plants, plant physiology (photosynthesis, respiration, plant hormones), genetics, ecology, biodiversity.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.neet_botany",
          },
          {
            id: "zoology",
            label: "Zoology",
            promptHint: "NEET Zoology (45 questions style): animal kingdom, structural organisation, human physiology (digestion, circulation, respiration, excretion, reproduction), genetics and evolution, biotechnology.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.neet_zoology",
          },
          {
            id: "physics",
            label: "Physics",
            promptHint: "NEET Physics (45 questions style): mechanics, thermodynamics, electrostatics, current electricity, optics, modern physics. Conceptual and application-based MCQ.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.neet_physics",
          },
          {
            id: "chemistry",
            label: "Chemistry",
            promptHint: "NEET Chemistry (45 questions style): Physical (states of matter, thermodynamics, equilibrium, solutions), Inorganic (periodic table, bonding, metallurgy), Organic (functional groups, reactions, biomolecules, polymers).",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.neet_chemistry",
          },
        ],
      },
    ],
  },

  // ─── ULUSLARARASI ──────────────────────────────────────────────────────────
  {
    id: "intl",
    nameKey: "examLab.examTypes.countries.intl",
    flag: "🌍",
    exams: [
      {
        id: "ielts",
        label: "IELTS",
        flag: "🌍",
        country: "intl",
        countryKey: "examLab.examTypes.countries.intl",
        promptHint:
          "IELTS Academic exam style. English proficiency assessment MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.ielts",
        subjects: [
          {
            id: "reading",
            label: "Reading",
            promptHint: "IELTS Academic Reading: True/False/Not Given, Yes/No/Not Given, matching headings, matching features, sentence/summary completion, multiple choice. Based on academic passages. Include passage excerpt in the question.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ielts_reading",
          },
          {
            id: "listening",
            label: "Listening",
            promptHint: "IELTS Listening style MCQ: based on short conversations or monologues (describe the scenario in the question). Multiple choice format. Everyday and academic settings.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ielts_listening",
          },
          {
            id: "vocabulary",
            label: "Vocabulary",
            promptHint: "IELTS Vocabulary: academic word list (AWL), collocations, word formation, vocabulary in context, formal vs informal register. Academic level English.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ielts_vocab",
          },
          {
            id: "grammar",
            label: "Grammar",
            promptHint: "IELTS Grammar: tense accuracy, conditionals, passive voice, relative clauses, prepositions, articles, subject-verb agreement in academic context.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.ielts_grammar",
          },
        ],
      },
      {
        id: "toefl",
        label: "TOEFL",
        flag: "🌍",
        country: "intl",
        countryKey: "examLab.examTypes.countries.intl",
        promptHint:
          "TOEFL iBT style. Academic English, 4-choice MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.toefl",
        subjects: [
          {
            id: "reading",
            label: "Reading",
            promptHint: "TOEFL Reading: factual information, negative factual, inference, rhetorical purpose, vocabulary in context, sentence insertion, prose summary. Based on academic university-level passages.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.toefl_reading",
          },
          {
            id: "listening",
            label: "Listening",
            promptHint: "TOEFL Listening style MCQ: based on academic lectures or campus conversations (include brief scenario description). Main idea, detail, inference, attitude questions.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.toefl_listening",
          },
          {
            id: "vocabulary",
            label: "Vocabulary",
            promptHint: "TOEFL Vocabulary: academic vocabulary in context, word choice, paraphrase recognition, discipline-specific terms used in university settings.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.toefl_vocab",
          },
          {
            id: "grammar",
            label: "Grammar",
            promptHint: "TOEFL Grammar: academic sentence structure, grammatical correctness, usage in formal academic context, error identification.",
            subjectPlaceholder: "examLab.examTypes.subjectPlaceholders.toefl_grammar",
          },
        ],
      },
      {
        // IB'de öğrenci 6 farklı gruptan birer ders seçiyor — serbest text
        id: "ib",
        label: "IB",
        flag: "🌍",
        country: "intl",
        countryKey: "examLab.examTypes.countries.intl",
        promptHint:
          "IB (International Baccalaureate) Diploma Programme style. Critical thinking, interdisciplinary, 4-choice MCQ. Language: English.",
        topicPlaceholder: "examLab.examTypes.placeholders.ib",
        subjects: [], // Serbest text: öğrenci hangi IB dersini çalışıyorsa yazar (HL/SL dahil)
      },
    ],
  },
];

export const ALL_EXAM_TYPES: ExamType[] = EXAM_COUNTRIES.flatMap((c) => c.exams);

export const getExamTypeById = (id: string): ExamType | undefined =>
  ALL_EXAM_TYPES.find((e) => e.id === id);

export const EXAM_TYPE_STORAGE_KEY = "@quorax_exam_type";
export const SAVED_EXAM_STORAGE_KEY = "@quorax_saved_exam";
