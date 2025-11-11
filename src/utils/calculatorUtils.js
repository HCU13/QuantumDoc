// src/utils/calculatorUtils.js

/**
 * Hesap makinesi yardımcı fonksiyonları
 */

/**
 * Faktöriyel hesaplama
 * @param {number} n - Faktöriyeli alınacak sayı
 * @returns {number} - Faktöriyel sonucu
 */
export const factorial = (n) => {
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // Overflow protection
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

/**
 * Matematiksel fonksiyonları hesapla
 * @param {string} func - Fonksiyon adı
 * @param {number} value - İşlenecek değer
 * @param {boolean} isRadMode - Radian modu aktif mi
 * @returns {{result: number, funcName: string, error: string|null}} - Sonuç, fonksiyon adı ve hata mesajı
 */
export const calculateFunction = (func, value, isRadMode = false) => {
  let result;
  let funcName;
  
  try {
    switch (func) {
      case 'sin':
        result = Math.sin(isRadMode ? value : (value * Math.PI) / 180);
        funcName = 'sin';
        break;
      case 'cos':
        result = Math.cos(isRadMode ? value : (value * Math.PI) / 180);
        funcName = 'cos';
        break;
      case 'tan':
        result = Math.tan(isRadMode ? value : (value * Math.PI) / 180);
        funcName = 'tan';
        break;
      case 'log':
        if (value <= 0) {
          return { result: 0, funcName: 'log', error: 'Logaritma için sayı pozitif olmalı' };
        }
        result = Math.log10(value);
        funcName = 'log₁₀';
        break;
      case 'ln':
        if (value <= 0) {
          return { result: 0, funcName: 'ln', error: 'Logaritma için sayı pozitif olmalı' };
        }
        result = Math.log(value);
        funcName = 'ln';
        break;
      case 'sqrt':
        if (value < 0) {
          return { result: 0, funcName: '√', error: 'Karekök için sayı negatif olamaz' };
        }
        result = Math.sqrt(value);
        funcName = '√';
        break;
      case 'cube':
        result = Math.pow(value, 3);
        funcName = 'x³';
        break;
      case 'square':
        result = Math.pow(value, 2);
        funcName = 'x²';
        break;
      case '1/x':
        if (value === 0) {
          return { result: 0, funcName: '1/x', error: 'Sıfıra bölme hatası' };
        }
        result = 1 / value;
        funcName = '1/x';
        break;
      case 'exp':
        // e^709 yaklaşık olarak Number.MAX_VALUE'ya ulaşır
        if (Math.abs(value) > 709) {
          return { result: 0, funcName: 'eˣ', error: 'Üs değeri çok büyük (max: ±709)' };
        }
        result = Math.exp(value);
        funcName = 'eˣ';
        break;
      case 'factorial':
        if (value < 0) {
          return { result: 0, funcName: 'x!', error: 'Faktöriyel için sayı negatif olamaz' };
        }
        if (value > 170) {
          return { result: 0, funcName: 'x!', error: 'Faktöriyel için sayı çok büyük (max: 170)' };
        }
        result = factorial(Math.floor(Math.abs(value)));
        funcName = 'x!';
        break;
      default:
        return null;
    }
    
    // Sadece Infinity, -Infinity veya NaN kontrolü yap
    if (!isFinite(result)) {
      if (result === Infinity || result === -Infinity) {
        return { result: result, funcName, error: null };
      }
      return { result: 0, funcName, error: 'Sonuç tanımsız' };
    }
    
    return { result, funcName, error: null };
  } catch (error) {
    return { result: 0, funcName: func, error: 'Hesaplama hatası' };
  }
};

/**
 * Temel matematiksel işlemleri hesapla
 * @param {number} previous - İlk sayı
 * @param {number} current - İkinci sayı
 * @param {string} operation - İşlem operatörü (+, -, ×, ÷, ^)
 * @returns {{result: number, error: string|null}} - İşlem sonucu ve hata mesajı
 */
export const calculateOperation = (previous, current, operation) => {
  let result;
  
  switch (operation) {
    case '+':
      result = previous + current;
      // Sadece NaN kontrolü yap, Infinity'ye izin ver
      if (isNaN(result)) {
        return { result: 0, error: 'Geçersiz işlem' };
      }
      return { result, error: null };
    case '-':
      result = previous - current;
      if (isNaN(result)) {
        return { result: 0, error: 'Geçersiz işlem' };
      }
      return { result, error: null };
    case '×':
      result = previous * current;
      if (isNaN(result)) {
        return { result: 0, error: 'Geçersiz işlem' };
      }
      return { result, error: null };
    case '÷':
      if (current === 0) {
        return { result: 0, error: 'Sıfıra bölme hatası' };
      }
      result = previous / current;
      if (isNaN(result)) {
        return { result: 0, error: 'Geçersiz işlem' };
      }
      return { result, error: null };
    case '^':
      // Çok büyük üsler için özel kontrol (Math.pow overflow)
      if (Math.abs(current) > 1000 && Math.abs(previous) > 1) {
        // Potansiyel overflow - hesaplamayı dene
        result = Math.pow(previous, current);
        if (!isFinite(result)) {
          return { result: 0, error: 'Sonuç çok büyük veya tanımsız' };
        }
      } else {
        result = Math.pow(previous, current);
      }
      if (isNaN(result)) {
        return { result: 0, error: 'Geçersiz işlem' };
      }
      return { result, error: null };
    default:
      return { result: current, error: null };
  }
};

/**
 * Ekranda gösterilecek değeri formatla
 * @param {string} value - Formatlanacak değer
 * @returns {string} - Formatlanmış değer
 */
export const formatDisplay = (value) => {
  if (value.length > 12) {
    const num = parseFloat(value);
    if (Math.abs(num) >= 1e12 || Math.abs(num) < 1e-6) {
      return num.toExponential(6);
    }
    return num.toPrecision(12);
  }
  return value;
};

/**
 * İşlem ifadesini formatla (örn: "80 - 40")
 * @param {number|null} previous - İlk sayı
 * @param {string|null} operation - İşlem operatörü
 * @returns {string} - Formatlanmış ifade
 */
export const formatExpression = (previous, operation) => {
  if (previous === null || operation === null) return '';
  
  const operationSymbols = {
    '+': '+',
    '-': '−',
    '×': '×',
    '÷': '÷',
    '^': '^',
  };
  
  const symbol = operationSymbols[operation] || operation;
  return `${previous} ${symbol}`;
};

/**
 * Sayıyı formatla (binlik ayırıcılar ekle)
 * @param {number|string} num - Formatlanacak sayı
 * @returns {string} - Formatlanmış sayı
 */
export const formatNumber = (num) => {
  // Eğer num undefined, null veya boş string ise
  if (num === null || num === undefined || num === '') {
    return '0';
  }
  
  // String değerleri kontrol et
  if (typeof num === 'string') {
    // Özel durumlar: Error, Hata: ile başlayan mesajlar veya parantez - olduğu gibi döndür
    if (num === 'Error' || num === '(' || num.startsWith('Hata:')) {
      return num;
    }
    
    // Eğer parantez içinde sayı varsa (örn: "(564)", "(5.6)"), olduğu gibi döndür
    if (num.startsWith('(') && num.includes(')')) {
      return num;
    }
    
    // Eğer parantez açılmış ama kapanmamışsa (örn: "(564"), olduğu gibi döndür
    if (num.startsWith('(') && !num.includes(')')) {
      return num;
    }
    
    // Eğer string "." içeriyorsa veya "." ile bitiyorsa - olduğu gibi döndür (kullanıcı hala yazıyor)
    if (num.includes('.') && (num.endsWith('.') || num === '.')) {
      return num;
    }
    
    // Basit sayılar için (kısa string'ler) - olduğu gibi döndür, sadece çok uzunsa formatla
    // Bu sayede kullanıcı yazarken sayılar kaybolmaz
    if (num.length <= 15) {
      // Geçerli bir sayı mı kontrol et
      const parsed = parseFloat(num);
      if (!isNaN(parsed)) {
        // Kısa sayılar için formatlamayı atla, olduğu gibi göster
        // Sadece çok büyük sayılar için formatla
        if (Math.abs(parsed) >= 1e12 || (Math.abs(parsed) < 1e-6 && parsed !== 0)) {
          return parsed.toExponential(6);
        }
        // Normal kısa sayılar için sadece binlik ayırıcı ekle
        const parts = num.split('.');
        if (parts[0] && parts[0].length > 3) {
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return parts.join('.');
      }
    }
    
    // Geçersiz string
    const parsed = parseFloat(num);
    if (isNaN(parsed)) {
      return '0';
    }
    num = parsed;
  }
  
  // Artık num bir number, formatla
  const number = typeof num === 'number' ? num : parseFloat(num);
  
  // NaN kontrolü
  if (isNaN(number)) {
    return '0';
  }
  
  // Infinity kontrolü
  if (number === Infinity) {
    return '∞';
  }
  if (number === -Infinity) {
    return '-∞';
  }
  
  // Çok büyük veya çok küçük sayılar için bilimsel gösterim
  if (Math.abs(number) >= 1e12 || (Math.abs(number) < 1e-6 && number !== 0)) {
    return number.toExponential(6);
  }
  
  // Normal sayıları formatla - string'e çevir
  let numberStr = number.toString();
  
  // Çok uzun sayıları olduğu gibi göster (formatlamayı atla)
  if (numberStr.length > 20) {
    return numberStr;
  }
  
  // Binlik ayırıcı ekle (sadece tam sayı kısmına)
  const parts = numberStr.split('.');
  if (parts[0] && parts[0].length > 3) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return parts.join('.');
};

/**
 * Arcsin (sin⁻¹) hesaplama
 * @param {number} value - İşlenecek değer (-1 ile 1 arası)
 * @param {boolean} isRadMode - Radian modu aktif mi
 * @returns {{result: number, error: string|null}} - Sonuç ve hata mesajı
 */
export const calculateArcSin = (value, isRadMode = false) => {
  if (value < -1 || value > 1) {
    return { result: 0, error: 'Arcsin için değer -1 ile 1 arasında olmalı' };
  }
  const result = isRadMode
    ? Math.asin(value)
    : Math.asin(value) * (180 / Math.PI);
  if (!isFinite(result)) {
    return { result: 0, error: 'Sonuç tanımsız' };
  }
  return { result, error: null };
};

/**
 * Arccos (cos⁻¹) hesaplama
 * @param {number} value - İşlenecek değer (-1 ile 1 arası)
 * @param {boolean} isRadMode - Radian modu aktif mi
 * @returns {{result: number, error: string|null}} - Sonuç ve hata mesajı
 */
export const calculateArcCos = (value, isRadMode = false) => {
  if (value < -1 || value > 1) {
    return { result: 0, error: 'Arccos için değer -1 ile 1 arasında olmalı' };
  }
  const result = isRadMode
    ? Math.acos(value)
    : Math.acos(value) * (180 / Math.PI);
  if (!isFinite(result)) {
    return { result: 0, error: 'Sonuç tanımsız' };
  }
  return { result, error: null };
};

/**
 * Arctan (tan⁻¹) hesaplama
 * @param {number} value - İşlenecek değer
 * @param {boolean} isRadMode - Radian modu aktif mi
 * @returns {{result: number, error: string|null}} - Sonuç ve hata mesajı
 */
export const calculateArcTan = (value, isRadMode = false) => {
  const result = isRadMode
    ? Math.atan(value)
    : Math.atan(value) * (180 / Math.PI);
  if (!isFinite(result)) {
    return { result: 0, error: 'Sonuç tanımsız' };
  }
  return { result, error: null };
};

/**
 * 10 üzeri x hesaplama
 * @param {number} value - Üs değeri
 * @returns {{result: number, error: string|null}} - Sonuç ve hata mesajı
 */
export const calculateTenToX = (value) => {
  const MAX_EXPONENT = 308;
  if (Math.abs(value) > MAX_EXPONENT) {
    return { result: 0, error: 'Üs değeri çok büyük (max: ±308)' };
  }
  const result = Math.pow(10, value);
  if (!isFinite(result)) {
    return { result: 0, error: 'Sonuç çok büyük veya tanımsız' };
  }
  return { result, error: null };
};

/**
 * 2 üzeri x hesaplama
 * @param {number} value - Üs değeri
 * @returns {{result: number, error: string|null}} - Sonuç ve hata mesajı
 */
export const calculateTwoToX = (value) => {
  // 2^1024 çok büyük, ama dene
  if (Math.abs(value) > 1024) {
    return { result: 0, error: 'Üs değeri çok büyük (max: ±1024)' };
  }
  const result = Math.pow(2, value);
  // Infinity'ye izin ver, sadece NaN kontrolü yap
  if (isNaN(result)) {
    return { result: 0, error: 'Geçersiz işlem' };
  }
  return { result, error: null };
};

/**
 * y'inci kök x hesaplama
 * @param {number} y - Kök değeri
 * @param {number} x - Kökü alınacak sayı
 * @returns {{result: number, error: string|null}} - Sonuç ve hata mesajı
 */
export const calculateYRootX = (y, x) => {
  if (y === 0) {
    return { result: 0, error: 'Kök derecesi sıfır olamaz' };
  }
  if (x < 0 && y % 2 === 0) {
    return { result: 0, error: 'Çift dereceli kök için sayı negatif olamaz' };
  }
  const result = Math.pow(x, 1 / y);
  if (!isFinite(result)) {
    return { result: 0, error: 'Sonuç tanımsız' };
  }
  return { result, error: null };
};

/**
 * Pi sabiti
 * @returns {number} - Pi değeri
 */
export const getPi = () => {
  return Math.PI;
};

/**
 * Euler sabiti (e)
 * @returns {number} - Euler sabiti
 */
export const getE = () => {
  return Math.E;
};

/**
 * Yüzde hesaplama
 * @param {number} value - İşlenecek değer
 * @returns {{result: number, error: string|null}} - Sonuç ve hata mesajı
 */
export const calculatePercentage = (value) => {
  const result = value / 100;
  if (!isFinite(result)) {
    return { result: 0, error: 'Sonuç tanımsız' };
  }
  return { result, error: null };
};

