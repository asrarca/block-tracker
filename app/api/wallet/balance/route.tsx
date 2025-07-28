import { NextRequest, NextResponse } from 'next/server';
import config from '../../../config';

const address_asrar = '0x461894DAAa5b97ae62448eDe13aA65637ee8328d';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address') || address_asrar;

  if (!address) {
    return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
  }

  const url = `${config.ETHERSCAN_API_URL}?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=${config.ETHERSCAN_API_KEY}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    const data = await res.json();

    if (data.status !== '1') {
      return NextResponse.json({ error: 'Failed to fetch wallet balance' }, { status: 500 });
    }

    const balanceInEth = parseFloat(data.result) / 1e18;

    return NextResponse.json({
      address,
      balance: balanceInEth.toFixed(6),
      unit: 'ETH',
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}