#!/bin/bash

# 📺 AdMob Reklam Test Scripti
# Bu script reklam sistemini test etmek için kullanılır

echo "🎯 Quorax AdMob Test Scripti"
echo "=============================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Environment kontrolü
echo "📋 1. Environment Kontrolü"
echo "--------------------------"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env dosyası bulundu${NC}"
    
    # AdMob ID'lerini kontrol et
    if grep -q "EXPO_PUBLIC_ADMOB_REWARDED_ANDROID" .env; then
        ANDROID_ID=$(grep "EXPO_PUBLIC_ADMOB_REWARDED_ANDROID" .env | cut -d '=' -f2)
        echo -e "${GREEN}✅ Android Ad Unit ID: ${ANDROID_ID}${NC}"
    else
        echo -e "${RED}❌ Android Ad Unit ID bulunamadı${NC}"
    fi
    
    if grep -q "EXPO_PUBLIC_ADMOB_REWARDED_IOS" .env; then
        IOS_ID=$(grep "EXPO_PUBLIC_ADMOB_REWARDED_IOS" .env | cut -d '=' -f2)
        echo -e "${GREEN}✅ iOS Ad Unit ID: ${IOS_ID}${NC}"
    else
        echo -e "${RED}❌ iOS Ad Unit ID bulunamadı${NC}"
    fi
else
    echo -e "${RED}❌ .env dosyası bulunamadı${NC}"
    echo -e "${YELLOW}⚠️  .env.example dosyasından kopyalayın${NC}"
fi

echo ""

# 2. Package kontrolü
echo "📦 2. Package Kontrolü"
echo "----------------------"

if grep -q "react-native-google-mobile-ads" package.json; then
    VERSION=$(grep "react-native-google-mobile-ads" package.json | cut -d '"' -f4)
    echo -e "${GREEN}✅ react-native-google-mobile-ads yüklü (v${VERSION})${NC}"
else
    echo -e "${RED}❌ react-native-google-mobile-ads yüklü değil${NC}"
    echo -e "${YELLOW}⚠️  npm install react-native-google-mobile-ads${NC}"
fi

echo ""

# 3. Config kontrolü
echo "⚙️  3. Config Kontrolü"
echo "---------------------"

if [ -f "app.json" ]; then
    if grep -q "react-native-google-mobile-ads" app.json; then
        echo -e "${GREEN}✅ AdMob plugin app.json'da tanımlı${NC}"
    else
        echo -e "${RED}❌ AdMob plugin app.json'da bulunamadı${NC}"
    fi
    
    if grep -q "GADApplicationIdentifier" app.json; then
        echo -e "${GREEN}✅ iOS GADApplicationIdentifier tanımlı${NC}"
    else
        echo -e "${RED}❌ iOS GADApplicationIdentifier bulunamadı${NC}"
    fi
else
    echo -e "${RED}❌ app.json bulunamadı${NC}"
fi

echo ""

# 4. Google Services kontrolü
echo "🔐 4. Google Services Kontrolü"
echo "------------------------------"

if [ -f "google-services.json" ]; then
    echo -e "${GREEN}✅ google-services.json bulundu (Android)${NC}"
else
    echo -e "${YELLOW}⚠️  google-services.json bulunamadı (Android)${NC}"
    echo -e "${YELLOW}   Firebase Console'dan indirin${NC}"
fi

if [ -f "ios/GoogleService-Info.plist" ]; then
    echo -e "${GREEN}✅ GoogleService-Info.plist bulundu (iOS)${NC}"
else
    echo -e "${YELLOW}⚠️  GoogleService-Info.plist bulunamadı (iOS)${NC}"
    echo -e "${YELLOW}   Firebase Console'dan indirin${NC}"
fi

echo ""

# 5. Test önerileri
echo "🧪 5. Test Önerileri"
echo "-------------------"
echo ""
echo "Expo Go'da test (Mock reklam):"
echo -e "${YELLOW}  npx expo start${NC}"
echo ""
echo "Development build'de test (Gerçek test reklamları):"
echo -e "${YELLOW}  npx expo run:ios${NC}"
echo -e "${YELLOW}  npx expo run:android${NC}"
echo ""
echo "Debug panel kullanımı:"
echo "  1. Uygulamayı açın"
echo "  2. Sağ alt köşedeki bug ikonuna tıklayın"
echo "  3. 'Ödüllü Reklam Göster' butonuna basın"
echo ""
echo "Konsol loglarını takip edin:"
echo "  📺 - Reklam işlemi"
echo "  ✅ - Başarılı"
echo "  ⚠️  - Uyarı"
echo "  ❌ - Hata"
echo ""

# 6. Özet
echo "📊 Özet"
echo "-------"
echo ""
echo "Detaylı dokümantasyon için:"
echo -e "${GREEN}  docs/ADMOB_SETUP.md${NC}"
echo ""
echo "=============================="
