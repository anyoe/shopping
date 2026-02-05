import type { RequestHandler } from '@builder.io/qwik-city'
import { getLocale } from 'compiled-i18n';

export const onGet: RequestHandler = async ({ redirect, pathname }) => {
    const locale = getLocale()
    throw redirect(301, `/${locale}${pathname}`)
}