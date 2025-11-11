import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text,
  TouchableOpacity
} from 'react-native';
import { FONTS, SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  keyboardType = 'default',
  multiline = false,
  containerStyle,
  inputStyle,
  icon,
  onIconPress,
  autoCapitalize = 'none',
  autoCorrect = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colors, shadows, isDark } = useTheme();
  
  const inputStyles = StyleSheet.create({
    container: {
      marginBottom: 20,
      width: '100%',
    },
    label: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginBottom: 6,
      fontWeight: '500',
      fontSize: 13,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.card + '80' : colors.white + 'F0',
      borderRadius: 16,
      paddingHorizontal: 16,
      borderWidth: 1.5,
      borderColor: isDark ? colors.border + '40' : colors.border + '60',
      height: 52,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    multilineInputContainer: {
      height: 120,
      alignItems: 'flex-start',
      paddingVertical: 12,
    },
    input: {
      flex: 1,
      ...FONTS.body4,
      color: colors.textPrimary,
      height: '100%',
      paddingVertical: 0,
      fontSize: 15,
      textAlignVertical: 'center',
    },
    multilineInput: {
      height: '100%',
      textAlignVertical: 'top',
      paddingTop: 0,
    },
    focusedInput: {
      borderColor: colors.primary + '80',
      borderWidth: 2,
      backgroundColor: isDark ? colors.card + 'A0' : colors.white,
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    errorInput: {
      borderColor: colors.error || '#FF6B6B',
      backgroundColor: isDark ? colors.error + '10' : colors.error + '05',
    },
    errorText: {
      color: colors.error || '#FF6B6B',
      ...FONTS.body5,
      marginTop: 6,
      marginLeft: 4,
      fontSize: 12,
    },
    iconContainer: {
      marginRight: 12,
      opacity: 0.7,
    },
    eyeIcon: {
      padding: 8,
      borderRadius: 8,
    },
    iconRight: {
      padding: 8,
      borderRadius: 8,
    },
  });

  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      
      <View style={[
        inputStyles.inputContainer,
        multiline && inputStyles.multilineInputContainer,
        isFocused && inputStyles.focusedInput,
        error && inputStyles.errorInput
      ]}>
        {icon && <View style={inputStyles.iconContainer}>{icon}</View>}
        
        <TextInput
          style={[
            inputStyles.input,
            inputStyle,
            multiline && inputStyles.multilineInput
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={inputStyles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
        
        {onIconPress && icon && (
          <TouchableOpacity 
            style={inputStyles.iconRight} 
            onPress={onIconPress}
            activeOpacity={0.7}
          >
            {icon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={inputStyles.errorText}>{error}</Text>}
    </View>
  );
};

export default Input;