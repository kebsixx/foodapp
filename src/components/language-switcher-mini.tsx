import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../providers/language-provider';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const LanguageSwitcherMini: React.FC = () => {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          language === 'id' && styles.activeLanguage,
        ]}
        onPress={() => changeLanguage('id')}>
        <Text
          style={[
            styles.languageText,
            language === 'id' && styles.activeLanguageText,
          ]}>
          ID
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.languageButton,
          language === 'en' && styles.activeLanguage,
        ]}
        onPress={() => changeLanguage('en')}>
        <Text
          style={[
            styles.languageText,
            language === 'en' && styles.activeLanguageText,
          ]}>
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  activeLanguage: {
    backgroundColor: '#997C70',
    borderColor: '#997C70',
  },
  languageText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  activeLanguageText: {
    color: '#fff',
  },
});

export default LanguageSwitcherMini; 