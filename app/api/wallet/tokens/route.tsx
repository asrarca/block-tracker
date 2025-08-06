import { NextRequest } from 'next/server';
import { AlchemyService } from '../../../services/AlchemyService';

export async function GET(req: NextRequest) {
  const service = new AlchemyService();
  const address = service.extractAddress(req);

  try {
    const balanceData = await service.getTokenBalance(address);
    return service.createSuccessResponse(balanceData);
  } catch (error) {
    return service.handleError(error);
  }
}
