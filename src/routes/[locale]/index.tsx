import { supabaseClient } from "~/utils/supabase";
import { routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

export const useUser = routeLoader$(async (event) => {
    const supbaseAccessToken = event.cookie.get('supabase_access_token')
    if (!supbaseAccessToken) {
        return null;
    }
    const { data, error } = await supabaseClient.auth.getUser(
        supbaseAccessToken.value
    );
    return error ? null : data.user;
});

export default component$(() => {
    const userSig = useUser();
    return (
        <h1>
            Welcome{" "}
            {userSig.value ? userSig.value.email : "guest"}
        </h1>
    )
})