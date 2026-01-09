import { NextRequest, NextResponse } from 'next/server';
import { leads, notifications } from '@/lib/cms/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST: Creating test lead...');
    
    const testLead = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      company: 'Test Company',
      notes: 'This is a test lead',
      consent_data_processing: true,
      status: 'new' as const,
      crm_synced: false,
      consent_marketing: false,
    };
    
    const result = await leads.create(testLead);
    const newId = (result as any)?.row?.id || (result as any)?.id;
    
    console.log('🧪 TEST: Lead created with ID:', newId);
    
    // Create notification
    const notificationResult = await notifications.create({
      type: 'contact_form',
      title: 'Test Notification',
      message: 'This is a test notification',
      link: '/admin/leads',
    });
    
    console.log('🧪 TEST: Notification created:', notificationResult);
    
    return NextResponse.json({
      success: true,
      leadId: newId,
      notification: notificationResult,
    });
  } catch (error: any) {
    console.error('🧪 TEST ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error?.message,
      details: error,
    }, { status: 500 });
  }
}









