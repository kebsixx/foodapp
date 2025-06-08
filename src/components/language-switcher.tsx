import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../providers/language-provider';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.languageOptions}>
        <TouchableOpacity 
          style={[
            styles.languageButton, 
            language === 'id' && styles.activeButton
          ]}
          onPress={() => changeLanguage('id')}
        >
          <Ionicons 
            name="flag" 
            size={20} 
            color={language === 'id' ? '#fff' : '#666'} 
            style={styles.icon}
          />
          <Text style={[
            styles.buttonText,
            language === 'id' && styles.activeText
          ]}>
            ID
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.languageButton, 
            language === 'en' && styles.activeButton
          ]}
          onPress={() => changeLanguage('en')}
        >
          <Ionicons 
            name="globe" 
            size={20} 
            color={language === 'en' ? '#fff' : '#666'} 
            style={styles.icon}
          />
          <Text style={[
            styles.buttonText,
            language === 'en' && styles.activeText
          ]}>
            EN
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {language === 'id' ? 'Bahasa Indonesia' : 'English'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: 90,
  },
  activeButton: {
    backgroundColor: '#997C70',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  activeText: {
    color: '#fff',
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default LanguageSwitcher; 