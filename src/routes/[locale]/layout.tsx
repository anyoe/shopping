import { routeLoader$ } from '@builder.io/qwik-city';
import { component$, Slot } from '@builder.io/qwik';
import { createClient } from '~/utils/supabase';

export const useUser = routeLoader$(async (event) => {
    const supabase = createClient(event);
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
});

export default component$(() => {
    return <Slot />;
});
