import { routeLoader$, useNavigate } from '@builder.io/qwik-city';
import { component$ } from '@builder.io/qwik';
import { createClient } from '~/utils/supabase';
import { _, getLocale } from 'compiled-i18n';

export const useUser = routeLoader$(async (event) => {
    const supabase = createClient(event);
    const { data: { user } } = await supabase.auth.getUser();
    return user;
});

type Product = {
    id: string;
    name: Record<string, string>;
    description: Record<string, string>;
    price: Record<string, number>;
    image: string;
};

export const useProducts = routeLoader$(async (event) => {
    const supabase = createClient(event);
    const { data } = await supabase.from('products').select('*');
    return data as Product[];
});

const currencyMap: Record<string, { code: string; factor: number }> = {
    'en_US': { code: 'USD', factor: 100 },
    'zh_CN': { code: 'CNY', factor: 100 },
};

export default component$(() => {
    const locale = getLocale();
    const localeIntl = locale.replace('_', '-');

    const userSig = useUser();
    const productsSig = useProducts();
    const navigate = useNavigate();

    const { code, factor } = currencyMap[locale] || currencyMap['en_US'];

    return (
        <div class='full-width-container'>
            <div class='product-grid'>
                {productsSig.value.map((product) => {
                    const amount = (product.price[code] || product.price['USD']) / factor;
                    const formattedPrice = new Intl.NumberFormat(localeIntl, {
                        style: 'currency',
                        currency: code
                    }).format(amount);

                    return (
                        <div key={product.id} class='product-card'>
                            <div class='product-image-wrapper'>
                                <img
                                    loading="eager"
                                    class="product-image"
                                    src={`/images/${product.image}`}
                                    alt={product.name[locale] || product.name['en_US']}
                                />
                            </div>
                            <div class='product-info'>
                                <span class='product-name'>{product.name[locale] || product.name['en_US']}</span>
                                <div class='product-description'>{product.description[locale] || product.description['en_US']}</div>
                                <div class='product-footer'>
                                    <span class='product-price'>{formattedPrice}</span>
                                    {userSig.value ? (
                                        <button
                                            type='button'
                                            class='add-to-cart-btn'
                                            onClick$={() => console.log(_`Add to cart!`)}
                                        >
                                            {_`Add to Cart`}
                                        </button>
                                    ) : (
                                        <button
                                            type='button'
                                            class='sign-in-btn'
                                            onClick$={() => navigate('/sign-in')}
                                        >
                                            {_`Sign in`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
});