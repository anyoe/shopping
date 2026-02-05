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
    const url = event.env.get('SUPABASE_URL')!;
    const anonKey = event.env.get('SUPABASE_ANON_KEY')!;

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
    <div>
      <h1>{_`Hi from Supbase`}</h1>
      <ul>
        {testTable.value.map((row) => (
          <li key={row.id}>{row.test_column}</li>
        ))}
      </ul>
    </div>
  );
});
