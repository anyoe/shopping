import { routeLoader$ } from '@builder.io/qwik-city';
import { component$ } from '@builder.io/qwik';
import { createClient } from '~/utils/supabase';

export const useUser = routeLoader$(async (event) => {
    const supabase = createClient(event);
    const { data: { user } } = await supabase.auth.getUser();
    return user;
});

export default component$(() => {
    const userSig = useUser();
    return (
        <h1>
            Welcome{' '}
            {userSig.value ? userSig.value.email : 'guest'}
        </h1>
    )
})