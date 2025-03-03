
import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    "response_error_generic": "An error occurred while searching for your results. Please contact the site administrator."
  }
};

// Create VueI18n instance with options
const i18n = createI18n({
  locale: 'en', // set locale
  messages, // set locale messages
})

export const getI18n = (i18n = {}) => {
  const locale = i18n.locale || 'en';
  const items = lodash.merge(messages, (i18n.messages || {}));
  return createI18n({
    locale, // set locale
    messages: items, // set locale messages
  })
}

export default i18n;
