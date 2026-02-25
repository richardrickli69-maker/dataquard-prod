import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, domain, scanId } = body;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Simulate creating reminder in database
    // In production: Save to Supabase reminders table
    
    const reminderId = `reminder_${Date.now()}`;
    
    // Simulate email sending
    const emailSent = Math.random() > 0.1; // 90% success rate
    
    if (emailSent) {
      return NextResponse.json(
        {
          success: true,
          data: {
            reminderId,
            email,
            domain,
            message: 'Reminder created! We will send you a follow-up email in 24 hours.',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create reminder' },
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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Simulate fetching reminders from database
    // In production: Query from Supabase reminders table
    
    const reminders = [
      {
        id: 'reminder_1',
        email: user.email,
        domain: 'example.ch',
        status: 'sent',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: {
          reminders,
          totalReminders: reminders.length,
          sentCount: reminders.filter((r) => r.status === 'sent').length,
        },
      },
      { status: 200 }
    );
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
```