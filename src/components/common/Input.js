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
      marginBottom: SIZES.padding * 0.7,
      width: '100%',
    },
    label: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.gray : colors.white,
      borderRadius: SIZES.radius,
      paddingHorizontal: SIZES.padding * 0.7,
      borderWidth: 1,
      borderColor: colors.gray,
      height: 55,
      ...shadows.light,
    },
    input: {
      flex: 1,
      ...FONTS.body3,
      color: colors.textPrimary,
      height: '100%',
      paddingVertical: 10,
    },
    multilineInput: {
      height: 100,
      textAlignVertical: 'top',
      paddingTop: 10,
    },
    focusedInput: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    errorInput: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
      ...FONTS.body5,
      marginTop: 5,
      marginLeft: 5,
    },
    iconContainer: {
      marginRight: 10,
    },
    eyeIcon: {
      padding: 5,
    },
    iconRight: {
      padding: 5,
    },
  });

  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      
      <View style={[
        inputStyles.inputContainer,
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
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
        
        {onIconPress && icon && (
          <TouchableOpacity style={inputStyles.iconRight} onPress={onIconPress}>
            {icon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={inputStyles.errorText}>{error}</Text>}
    </View>
  );
};

export default Input;