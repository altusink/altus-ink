import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !['pt', 'en', 'nl', 'fr', 'ru', 'de', 'it', 'es'].includes(locale)) {
        locale = 'pt';
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
