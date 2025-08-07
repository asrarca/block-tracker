import WalletSearch from './components/WalletSearch';
import DarkModeToggle from './components/DarkModeToggle';
import { EtherscanService } from './services/EtherscanService';

export default async function Home() {
  const etherscanService = new EtherscanService();
  const price = await etherscanService.getEtherPrice();

  return (
    <main>
      <DarkModeToggle />
      <WalletSearch price={price}/>
    </main>
  );
}
