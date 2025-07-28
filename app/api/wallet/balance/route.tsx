import { NextRequest } from 'next/server';
import { EtherscanService } from '../../../services/EtherscanService';

export async function GET(req: NextRequest) {
  const service = new EtherscanService();
  const address = service.extractAddress(req);

  try {
    const balanceData = await service.getBalance(address);
    return service.createSuccessResponse(balanceData);
  } catch (error) {
    return service.handleError(error);
  }
}
