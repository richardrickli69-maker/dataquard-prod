import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, amount } = body;

    if (!plan || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing plan or amount' },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = Math.random() > 0.05;

    if (success) {
      return NextResponse.json(
        {
          success: true,
          data: {
            paymentId: `test_${Date.now()}`,
            plan,
            amount,
            message: 'Payment successful!',
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment declined' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({});
}