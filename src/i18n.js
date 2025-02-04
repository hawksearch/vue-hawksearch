import { createI18n } from 'vue-i18n';
import lodash from 'lodash';

// Базовые переводы
const defaultMessages = {
    en: {
        response_error_generic:
            'An error occurred while searching for your results. Please contact the site administrator.',
    },
};

// Создание базового i18n
const i18n = createI18n({
    locale: 'en',
    messages: defaultMessages,
});

export const getI18n = (customI18n = {}) => {
    const locale = customI18n.locale || 'en';
    const messages = lodash.merge({}, defaultMessages, customI18n.messages || {});
    return createI18n({
        locale,
        messages,
    });
};

export default i18n;
