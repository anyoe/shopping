import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$, useNavigate, useLocation } from "@builder.io/qwik-city";
import { createClient } from "~/utils/supabase";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { ProductDocument, Product } from "../..";
import { useUser } from "../../layout";
import { HeartIcon } from "~/components/HeartIcon";
import { _, getLocale } from "compiled-i18n";

export const useProductDetail = routeLoader$(async (event) => {
    const supabase = createClient(event);

    const { params, status } = event;
    const { data }: PostgrestSingleResponse<Product[]> = await supabase
        .from('products')
        .select('*')
        .eq('slug->>en_US', params.slug);

    const locale = event.locale();
    let product: ProductDocument | null = null;

    if (data && data.length > 0) {
        product = {
            id: data[0].id,
            name: data[0].name[locale],
            description: data[0].description[locale],
            price: data[0].price[locale],
            image: data[0].image,
            slug: data[0].slug[locale]
        }
    } else {
        status(404);
        return {
            product: null,
            isFavorite: false
        }
    }

    let isFavorite = false;
    const user = await event.resolveValue(useUser);
    if (user) {
        const favoritesResponse = await supabase
            .from('favorites')
            .select('*')
            .match({
                user_id: user.id,
                product_id: product.id
            });
        isFavorite = !!favoritesResponse.data &&
            favoritesResponse.data.length > 0;
    }

    return {
        product,
        isFavorite
    };
});

export const changeFavorite = server$(
    async function (
        productId: number,
        isFavorite: boolean
    ) {
        const supabase = createClient(this);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Unauthorized');

        if (isFavorite) {
            await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    product_id: productId
                });
        } else {
            await supabase
                .from('favorites')
                .delete()
                .match({
                    user_id: user.id,
                    product_id: productId
                });
        }
    }
);

export default component$(() => {
    const userSig = useUser();
    const navigate = useNavigate();
    const loc = useLocation();
    const productDetailLoader = useSignal(useProductDetail().value);
    const locale = getLocale();

    if (!productDetailLoader.value.product) {
        return <div>{_`Sorry, looks like we don't have this product`}</div>
    }

    const product = productDetailLoader.value.product;
    const isFavorite = productDetailLoader.value.isFavorite;

    return (
        <div class="full-width-container" style={{ padding: '2rem 1rem' }}>
            <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>{product.name}</h2>
                <div style={{ display: 'flex', gap: '4rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <img
                            width={400}
                            height={400}
                            src={`/images/${product.image}`}
                            alt={product.name}
                            style={{ borderRadius: '1rem', width: '100%', height: 'auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </div>
                    <div style={{ flex: '1 1 400px' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>{_`Description`}</h3>
                            <div style={{ color: '#4b5563', lineHeight: '1.6' }}>{product.description}</div>
                        </div>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                                {product.price}
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                {userSig.value ? (
                                    <button
                                        type='button'
                                        class="add-to-cart-btn"
                                        style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                                        onClick$={() => console.log(_`Add to cart!`)}
                                    >
                                        {_`Add to Cart`}
                                    </button>
                                ) : (
                                    <button
                                        type='button'
                                        class="sign-in-btn"
                                        style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                                        onClick$={() => navigate(`/${locale}/sign-in`)}
                                    >
                                        {_`Sign In`}
                                    </button>
                                )}
                                <button
                                    type='button'
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}
                                    onClick$={async () => {
                                        if (userSig.value) {
                                            const newFavoriteStatus = !isFavorite;
                                            await changeFavorite(Number(product.id), newFavoriteStatus);
                                            // Trigger a re-run of the route loaders to update UI
                                            // or we could use another signal if we wanted pure client-side update
                                            // However, for simplicity and ensuring sync with DB, re-fetching is fine 
                                            // or manually updating the signal if we had one.
                                            // Given we use the loader directly now, we might need a local signal or navigate(loc.url.href)
                                            navigate(loc.url.href);
                                        }
                                        productDetailLoader.value = {
                                            ...productDetailLoader.value,
                                            isFavorite: !isFavorite
                                        }
                                    }}
                                >
                                    <HeartIcon active={isFavorite} />
                                    <span style={{ fontWeight: '500', color: '#374151' }}>{_`Add to favorites`}</span>
                                </button>
                            </div>
                        </div>

                        <section style={{ marginTop: '4rem', borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.25rem' }}>Shipping & Returns</h3>
                            <div style={{ fontSize: '0.95rem', color: '#6b7280' }}>
                                <p style={{ marginBottom: '0.75rem' }}>Standard shipping: 3 - 5 working days.</p>
                                <p style={{ marginBottom: '0.75rem' }}>Express shipping: 1 - 3 working days.</p>
                                <p style={{ marginBottom: '0.75rem' }}>Shipping costs depend on delivery address and will be calculated during checkout.</p>
                                <p>
                                    Returns are subject to terms. Please
                                    See the <span style={{ textDecoration: 'underline', color: '#4f46e5', cursor: 'pointer' }}>return page</span> for further information.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
});