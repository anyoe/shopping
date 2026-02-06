import { component$, PropFunction } from '@builder.io/qwik';

type Props = {
    active?: boolean;
    onClick$?: PropFunction<() => void>;
};

export const HeartIcon = component$(({ active, onClick$ }: Props) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill={active ? '#ef4444' : 'none'}
            stroke={active ? '#ef4444' : 'currentColor'}
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
            style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: `scale(${active ? 1.1 : 1})`,
                display: 'inline-block',
                verticalAlign: 'middle',
            }}
            onClick$={() => {
                onClick$ && onClick$();
            }}
        >
            <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
        </svg>
    );
});