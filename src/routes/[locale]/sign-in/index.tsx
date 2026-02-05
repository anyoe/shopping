import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { createClient } from '~/utils/supabase';
import { _ } from 'compiled-i18n'

export const useSignInAction = routeAction$(
    async (form, event) => {
        const supabase = createClient(event);
        const email = form.email.toString();
        const password = form.password.toString();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                message: error.message
            };
        }

        if (data.session) {
            event.cookie.set('supabase_auth_token', data.session.access_token, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                secure: true,
            });
        }

        throw event.redirect(303, `/${event.params.locale}/`);
    },
    zod$({
        email: z.string().email(),
        password: z.string().min(6),
    })
);

export default component$(() => {
    const action = useSignInAction();

    return (
        <Form action={action}>
            <div>
                <label for='email'>
                    {_`Your email`}
                </label>
                <input type='email' id='email' name="email" />
            </div>

            <div>
                <label for='password'>
                    {_`Password`}
                </label>
                <input type='password' id='password' name="password" />
            </div>

            <button type="submit">
                {_`Sign in`}
            </button>
        </Form>
    );
});