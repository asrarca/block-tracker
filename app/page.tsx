import WalletSearch from './components/WalletSearch';
import DarkModeToggle from './components/DarkModeToggle';
import { EtherscanService } from './services/EtherscanService';

export default async function Home() {
  const service = new EtherscanService();
  const price = await service.getEtherPrice();

  return (
    <main>
      <DarkModeToggle />
      <WalletSearch price={price}/>
    </main>
  );
}
