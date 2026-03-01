// src/app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendPolicyReadyEmail, sendWelcomeEmail, sendReminderEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, domain, policyContent, jobId, name } = body;

    if (!type || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, email' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'policy-ready':
        if (!domain || !policyContent || !jobId) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for policy-ready email' },
            { status: 400 }
          );
        }
        result = await sendPolicyReadyEmail({ email, domain, policyContent, jobId });
        break;

      case 'welcome':
        result = await sendWelcomeEmail({ email, name });
        break;

      case 'reminder':
        result = await sendReminderEmail(email);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}