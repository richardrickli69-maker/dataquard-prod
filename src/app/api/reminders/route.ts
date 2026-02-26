/**
 * Reminders API Route
 * POST /api/reminders - Create reminder
 * GET /api/reminders - Fetch user reminders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse JSON with error handling
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { email, domain, scanId } = body;

    // Email validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required and must be string' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Domain validation
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Domain is required and must be string' },
        { status: 400 }
      );
    }

    // Domain length check
    if (domain.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Domain too long (max 255 chars)' },
        { status: 400 }
      );
    }

    // Optional scanId validation
    if (scanId && typeof scanId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ScanId must be a string' },
        { status: 400 }
      );
    }

    // Simulate reminder creation
    const reminderId = `reminder_${Date.now()}`;
    
    // Simulate email sending
    const emailSent = Math.random() > 0.1;
    
    if (emailSent) {
      return NextResponse.json(
        {
          success: true,
          data: {
            reminderId,
            email,
            domain,
            message: 'Reminder created! Follow-up email scheduled in 24 hours.',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create reminder' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Reminder creation error:', error);
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
    console.error('Reminder fetch error:', error);
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

Speichern Sie: **Ctrl+S** ✅

---

## 📊 ANALYTICS ROUTE - KOMPLETTER CODE:

Öffnen Sie VS Code:
```
src/app/api/analytics/route.ts