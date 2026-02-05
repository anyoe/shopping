// ... other imports
import { guessLocale, locales } from 'compiled-i18n';
import type { RequestHandler } from '@builder.io/qwik-city';

export const onRequest: RequestHandler = async ({
  pathname,
  cookie,
  headers,
  locale,
}) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const pathLocale = pathSegments[0];

  if (locales.includes(pathLocale)) {
    cookie.delete('locale');
    cookie.set('locale', pathLocale, {});
    locale(pathLocale);
  } else {
    const maybeLocale =
      cookie.get('locale')?.value || headers.get('accept-language');
    locale(guessLocale(maybeLocale));
  }
};
