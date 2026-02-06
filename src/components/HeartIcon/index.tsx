import { component$, PropFunction } from "@builder.io/qwik";

type Props = {
    active?: boolean;
    onClick$?: PropFunction<() => void>;
};

export const HeartIcon = component$(({ active, onClick$ }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 flex-shrink-0"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={active ? "red" : "none"}
            stroke="currentColor"
            stroke-width="2"
            onClick$={() => {
                onClick$ && onClick$();
            }}
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 12 3c-1.76 0-3.5.96-4.5 2.5S2 8.54 2 11c0 2.29 1.51 4.04 3 5.5" />
        </svg>
    );
});