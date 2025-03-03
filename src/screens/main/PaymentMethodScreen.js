import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export const PaymentMethodScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [saving, setSaving] = useState(false);

  // Örnek kayıtlı kartlar
  const savedCards = [
    {
      id: '1',
      type: 'visa',
      lastFourDigits: '4242',
      expiryDate: '12/24',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      lastFourDigits: '8765',
      expiryDate: '09/25',
      isDefault: false,
    },
  ];

  const handleSaveCard = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      // Burada kart kaydetme işlemi yapılacak
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Card added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = (cardId) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Kart silme işlemi
          }
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]} variant="h2">
        Payment Methods
      </Text>
      <View style={styles.backButton} />
    </View>
  );

  const renderSavedCards = () => (
    <View style={styles.savedCardsSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Saved Cards
      </Text>

      {savedCards.map((card) => (
        <View
          key={card.id}
          style={[styles.cardItem, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.cardInfo}>
            <View style={styles.cardTypeContainer}>
              <Ionicons
                name={card.type === 'visa' ? 'card' : 'card-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.cardType, { color: theme.colors.text }]}>
                {card.type.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.cardNumber, { color: theme.colors.text }]}>
              •••• {card.lastFourDigits}
            </Text>
            <Text style={[styles.cardExpiry, { color: theme.colors.textSecondary }]}>
              Expires {card.expiryDate}
            </Text>
          </View>

          <View style={styles.cardActions}>
            {card.isDefault && (
              <View
                style={[
                  styles.defaultBadge,
                  { backgroundColor: theme.colors.primary + '15' },
                ]}
              >
                <Text style={{ color: theme.colors.primary }}>Default</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => handleDeleteCard(card.id)}
              style={[
                styles.deleteButton,
                { backgroundColor: theme.colors.error + '15' },
              ]}
            >
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAddCard = () => (
    <View style={styles.addCardSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Add New Card
      </Text>

      <View style={[styles.cardForm, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Card Number
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.background,
              },
            ]}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={theme.colors.textSecondary}
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Expiry Date
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                },
              ]}
              placeholder="MM/YY"
              placeholderTextColor={theme.colors.textSecondary}
              value={expiryDate}
              onChangeText={setExpiryDate}
              maxLength={5}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              CVV
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                },
              ]}
              placeholder="123"
              placeholderTextColor={theme.colors.textSecondary}
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Card Holder Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.background,
              },
            ]}
            placeholder="JOHN DOE"
            placeholderTextColor={theme.colors.textSecondary}
            value={cardHolderName}
            onChangeText={setCardHolderName}
            autoCapitalize="characters"
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {renderHeader()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {renderSavedCards()}
          {renderAddCard()}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Button
            title={saving ? 'Saving...' : 'Save Card'}
            onPress={handleSaveCard}
            disabled={saving}
            loading={saving}
            theme={theme}
            style={styles.saveButton}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  savedCardsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardItem: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 13,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardSection: {
    gap: 12,
  },
  cardForm: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    height: 50,
  },
});