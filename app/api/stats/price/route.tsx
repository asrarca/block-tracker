import { NextRequest } from 'next/server';
import { EtherscanService } from '../../../services/EtherscanService';

export async function GET(req: NextRequest) {
  const service = new EtherscanService();

  try {
    const priceData = await service.getEtherPrice();
    return service.createSuccessResponse(priceData);
  } catch (error) {
    return service.handleError(error);
  }
}
