import { routeLoader$ } from '@builder.io/qwik-city';
import { component$ } from '@builder.io/qwik';
import { createClient } from '~/utils/supabase';
import { _, getLocale } from 'compiled-i18n';

export const useUser = routeLoader$(async (event) => {
    const supabase = createClient(event);
    const { data: { user } } = await supabase.auth.getUser();
    return user;
});

export default component$(() => {
    const userSig = useUser();
    const locale = getLocale();

    return (
        <h1>
            {_`Welcome`}{locale === 'zh_CN' ? '' : ' '}
            {userSig.value ? userSig.value.email : 'guest'}
        </h1>
    )
})