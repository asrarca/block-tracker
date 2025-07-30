import WalletSearch from './components/WalletSearch';
import DarkModeToggle from './components/DarkModeToggle';

export default async function Home() {
  return (
    <main>
      <DarkModeToggle />
      <WalletSearch/>
    </main>
  );
}
