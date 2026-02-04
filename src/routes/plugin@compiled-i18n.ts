// ... other imports
import { guessLocale, locales } from "compiled-i18n";
import type { RequestHandler } from "@builder.io/qwik-city";

/**
 * Handle incoming requests to determine and set the appropriate locale.
 * This function checks for a 'locale' query parameter, then a `locale` cookie,
 * and finally falls back to the 'Accept-Language' header.
 */
export const onRequest: RequestHandler = async ({
  pathname,
  cookie,
  headers,
  locale,
}) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const pathLocale = pathSegments[0];

  // Allow overriding locale with query param `locale`
  if (locales.includes(pathLocale)) {
    cookie.delete("locale");
    cookie.set("locale", pathLocale, {});
    locale(pathLocale);
  } else {
    // Choose locale based on cookie or accept-language header
    const maybeLocale =
      cookie.get("locale")?.value || headers.get("accept-language");
    locale(guessLocale(maybeLocale));
  }
};
