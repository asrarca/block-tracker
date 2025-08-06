import WalletSearch from './components/WalletSearch';
import DarkModeToggle from './components/DarkModeToggle';
import { EtherscanService } from './services/EtherscanService';
import { TokenDataService } from './services/TokenDataService';
import { TokenMetaData } from '@/app/types/TokenMetaData';

export default async function Home() {
  const etherscanService = new EtherscanService();
  const price = await etherscanService.getEtherPrice();

  const tokendataService = new TokenDataService();
  const tokensCache: Map<string, TokenMetaData> = await tokendataService.getAllTokens();

  return (
    <main>
      <DarkModeToggle />
      <WalletSearch price={price} tokensCache={tokensCache}/>
    </main>
  );
}
