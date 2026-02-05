import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { createServerClient } from 'supabase-auth-helpers-qwik'
import { _ } from 'compiled-i18n';

type TestRow = {
  id: number;
  created_at: string;
  test_column: string;
};

export const useTestTable = routeLoader$(
  async (event) => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const supbaseClient = createServerClient(
      url,
      anonKey,
      event
    );

    const { data } = await supbaseClient.from('test').select('*');

    return data as TestRow[];
  }
)

export default component$(() => {
  const testTable = useTestTable();

  return (
    <>
      <h1>{_`Hi from Supbase`}</h1>
      {testTable.value.map((row) => (
        <div key={row.id}>{row.test_column}</div>
      ))}
    </>
  );
});
