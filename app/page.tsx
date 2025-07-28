import WalletSearch from './components/WalletSearch';

export default async function Home() {
  const address = '0x461894DAAa5b97ae62448eDe13aA65637ee8328d';

  return (
    <main>
      <WalletSearch/>
    </main>
  );
}
