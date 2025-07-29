import { NextRequest } from 'next/server';
import { EtherscanService } from '../../../services/EtherscanService';

export async function GET(req: NextRequest) {
  const service = new EtherscanService();
  const address = service.extractAddress(req);
  const chainId = service.extractChainId(req);

  try {
    const transactionsData = await service.getTransactions(address, chainId);
    return service.createSuccessResponse(transactionsData);
  } catch (error) {
    return service.handleError(error);
  }
}
