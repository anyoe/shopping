import { component$, useSignal } from '@builder.io/qwik';
import { supabaseClient } from '~/utils/supabase';
import { _ } from 'compiled-i18n'

export default component$(() => {
    const emailSig = useSignal('');
    const passwordSig = useSignal('');
    const messageSig = useSignal('');

    return (
        <div>
            <label for='email' class='...'>
                {_`Your email`}
            </label>
            <input type='email' id='email' value={emailSig.value}
                onInput$={(_, el) => emailSig.value = el.value} />

            <label for='password' class='...'>
                {_`Password`}
            </label>
            <input type='password' id='password' bind:value={passwordSig} />

            {!!messageSig.value && <div>{messageSig.value}</div>}

            <button onClick$={async () => {
                const { error } = await supabaseClient.auth.signUp({
                    email: emailSig.value,
                    password: passwordSig.value,
                });
                messageSig.value = error
                    ? _`Error` + error.message
                    : _`Success. Please check your email/spam folder`;
            }}>
                {_`Sign up`}
            </button>
        </div>
    );
});
