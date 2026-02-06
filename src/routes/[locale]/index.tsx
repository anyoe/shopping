import { routeLoader$, useNavigate, server$ } from '@builder.io/qwik-city';
import { component$, useSignal, $ } from '@builder.io/qwik';
import { createClient } from '~/utils/supabase';
import { _, getLocale } from 'compiled-i18n';
import { create, insert, search, type AnyOrama } from '@orama/orama';
import { createTokenizer } from '@orama/tokenizers/mandarin';

export const useUser = routeLoader$(async (event) => {
    const supabase = createClient(event);
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
});

type Product = {
    id: string;
    name: Record<string, string>;
    description: Record<string, string>;
    price: Record<string, number>;
    image: string;
};

type ProductDocument = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
}

let oramaDb: AnyOrama;

export const useProducts = routeLoader$(async (event) => {
    const locale = event.locale();
    const { code } = currencyMap[locale] || currencyMap['en_US'];
    const supabase = createClient(event);
    const { data } = await supabase.from('products').select('*');
    const products: ProductDocument[] = [];

    if (locale === 'zh_CN') {
        oramaDb = await create({
            schema: {
                id: 'string',
                name: 'string',
                description: 'string',
                price: 'number',
                image: 'string',
            },
            components: {
                tokenizer: await createTokenizer(),
            }
        })
    } else {
        oramaDb = await create({
            schema: {
                id: 'string',
                name: 'string',
                description: 'string',
                price: 'number',
                image: 'string',
            },
        })
    }

    if (data) {
        for (const product of data) {
            const productDocument = {
                id: product.id.toString(),
                name: product.name[locale],
                description: product.description[locale],
                price: product.price[code],
                image: product.image,
            }
            products.push(productDocument);
            await insert(oramaDb, productDocument);
        }
    }

    return products;
});

const currencyMap: Record<string, { code: string; factor: number }> = {
    'en_US': { code: 'USD', factor: 100 },
    'zh_CN': { code: 'CNY', factor: 100 },
};


export const execSearch = server$(async (term: string, locale: string) => {
    const response = await search(oramaDb, {
        term,
        properties: '*',
        boost: {
            name: 1.5
        },
        tolerance: locale === 'zh_CN' ? 0 : 2
    });

    return response;
});

export default component$(() => {
    const locale = getLocale();
    const localeIntl = locale.replace('_', '-');

    const termSig = useSignal('');
    const userSig = useUser();
    const productsSig = useProducts();
    const navigate = useNavigate();
    const resultSig = useSignal<ProductDocument[]>(productsSig.value);

    const { code, factor } = currencyMap[locale] || currencyMap['en_US'];

    const onSearch = $(async (term: string) => {
        if (term === '') {
            resultSig.value = productsSig.value;
            return;
        }

        const response = await execSearch(term, locale);
        resultSig.value = response.hits.map(
            (hit) => hit.document as unknown as ProductDocument
        );
    })

    return (
        <div class='full-width-container'>
            <label class='search-label'>
                {_`Search`}
            </label>
            <input
                type='text'
                class='search-input'
                bind:value={termSig}
                onKeyDown$={(e) => {
                    if (e.key === 'Enter') {
                        onSearch(termSig.value);
                    }
                }}
            />
            <div class='product-grid'>
                {resultSig.value.map((product) => {
                    const amount = product.price / factor;
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
                                    alt={product.name}
                                />
                            </div>
                            <div class='product-info'>
                                <span class='product-name'>{product.name}</span>
                                <div class='product-description'>{product.description}</div>
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
                                            onClick$={() => navigate(`/${locale}/sign-in`)}
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