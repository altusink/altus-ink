import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['pt', 'en', 'nl', 'fr', 'ru', 'de', 'it', 'es'],

    // Used when no locale matches
    defaultLocale: 'pt'
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
