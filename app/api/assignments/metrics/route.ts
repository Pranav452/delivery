import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import type { AssignmentMetrics } from '@/types';

export async function GET() {
  try {
    // Fetch all assignments
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('*');

    if (error) throw error;

    // Calculate metrics
    const totalAssigned = assignments?.length || 0;
    const successful = assignments?.filter(a => a.status === 'success').length || 0;
    const successRate = totalAssigned > 0 ? (successful / totalAssigned) * 100 : 0;

    // Calculate average time
    const times = assignments?.map(a => new Date(a.timestamp).getTime()) || [];
    const averageTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;

    // Count failure reasons
    const failureReasons = assignments
      ?.filter(a => a.status === 'failed' && a.reason)
      .reduce((acc: { reason: string; count: number; }[], curr) => {
        const reason = curr.reason as string;
        const existing = acc.find(r => r.reason === reason);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ reason, count: 1 });
        }
        return acc;
      }, []) || [];

    const metrics: AssignmentMetrics = {
      totalAssigned,
      successRate,
      averageTime,
      failureReasons,
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
