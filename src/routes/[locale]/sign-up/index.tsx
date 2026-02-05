import { component$ } from '@builder.io/qwik';
import { Form, routeAction$, zod$, z } from '@builder.io/qwik-city';
import { createClient } from '~/utils/supabase';
import { _ } from 'compiled-i18n'

export const useSignUpAction = routeAction$(
    async (form, event) => {
        const supabase = createClient(event);

        const email = form.email.toString();
        const password = form.password.toString();

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                message: error.message
            };
        }

        return {
            success: true,
            message: _`Success. Please check your email/spam folder`
        };
    },
    zod$({
        email: z.string().email(),
        password: z.string().min(6),
    })
);

export default component$(() => {
    const action = useSignUpAction();

    return (
        <div>
            <Form action={action}>
                <label for='email'>
                    {_`Your email`}
                </label>
                <input type='email' id='email' name="email" />

                <label for='password'>
                    {_`Password`}
                </label>
                <input type='password' id='password' name="password" />

                {action.value?.message && <div>{action.value.message}</div>}

                <button type="submit">
                    {_`Sign up`}
                </button>
            </Form>
        </div>
    );
});
