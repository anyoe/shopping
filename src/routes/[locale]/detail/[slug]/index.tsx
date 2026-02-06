import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { component$ } from "@builder.io/qwik";
import { routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { createClient } from "~/utils/supabase";
import { useUser, ProductDocument, Product } from "../..";
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

    if (data) {
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
    }

    return product;
});

export default component$(() => {
    const userSig = useUser();
    const navigate = useNavigate();
    const productDetail = useProductDetail();
    const locale = getLocale();

    if (!productDetail.value) {
        return <div>{_`Sorry, looks like we don't have this product`}</div>
    }

    return (
        <div>
            <div>
                <h2>{productDetail.value.name}</h2>
                <div>
                    <div>
                        <span>
                            <div>
                                <img
                                    width={400}
                                    height={400}
                                    src={`/images/${productDetail.value.image}`}
                                    alt={productDetail.value.name}
                                />
                            </div>
                        </span>
                    </div>
                    <div>
                        <div>
                            <h3>{_`Description`}</h3>
                            <div>{productDetail.value.description}</div>
                            <div />
                        </div>
                        <div>
                            {productDetail.value.price}
                            <div>
                                {userSig.value ? (
                                    <button
                                        type='button'
                                        onClick$={() => console.log(_`Add to cart!`)}
                                    >
                                        {_`Add to Cart`}
                                    </button>
                                ) : (
                                    <button
                                        type='button'
                                        onClick$={() => navigate(`/${locale}/sign-in`)}
                                    >
                                        {_`Sign In`}
                                    </button>
                                )}
                                <button type='button'>
                                    <HeartIcon />
                                    <span>
                                        Add to favorites
                                    </span>
                                </button>
                            </div>
                        </div>

                        <section>
                            <h3>Shipping & Returns</h3>
                            <div>
                                <p>
                                    Standard shipping: 3 - 5 working days.
                                    Express shipping: 3 - 3 working days.
                                </p>
                                <p>
                                    shipping costs depend on delivery
                                    address and will be calculated during checkout
                                </p>
                                <p>
                                    Returns are subject to terms. Please
                                    See the{' '}
                                    <span>return page</span>{' '}
                                    for further information.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
})