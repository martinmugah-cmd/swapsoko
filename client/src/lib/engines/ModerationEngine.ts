// ModerationEngine.ts
// Implements Chapter 12: Moderation, Reporting & Safety Engine

import { adminSupabase } from '../trpc';
import { NotificationEngine } from './NotificationEngine';

export interface ModerationDecision {
    reportId: string;
    moderatorId: string;
    decision: 'CLEAR' | 'ACTION' | 'ESCALATE';
    action?: 'WARN' | 'RESTRICT' | 'REMOVE' | 'SUSPEND';
    notes?: string;
    evidenceUrls?: string[];
}

export class ModerationEngine {
    static async processReport(decisionData: ModerationDecision) {
        const { reportId, moderatorId, decision, action, notes } = decisionData;

        // Fetch the report
        const { data: report, error: reportErr } = await adminSupabase
            .from('reports')
            .select('*')
            .eq('id', reportId)
            .single();

        if (reportErr || !report) throw new Error("Report not found or error fetching report.");

        let newStatus = 'resolved';
        let resolutionText = decision;

        // 1. Log the audit event first (History Ledger)
        await adminSupabase.from('audit_logs').insert({
            actor_id: moderatorId,
            action: `MODERATION_DECISION_${decision}`,
            resource_type: report.target_type,
            resource_id: report.target_id,
            details: { reportId, action, notes }
        });

        // 2. Perform Soft Deletion or Action (No Hard Deletes!)
        if (decision === 'CLEAR') {
            newStatus = 'dismissed';
            resolutionText = 'CLEARED: No violation found';
            
            // Notify reporter
            await NotificationEngine.publish({ userId: report.reporter_id, eventType: 'REPORT_UPDATE', title: 'Report Update', message: 'We reviewed your report but found insufficient evidence of a policy violation.', entityType: 'report' });
        } else if (decision === 'ESCALATE') {
            newStatus = 'escalated';
            resolutionText = `ESCALATED: ${notes || 'Needs higher level review'}`;
            // Hand off to Admin Queue
        } else if (decision === 'ACTION' && action) {
            resolutionText = `ACTION: ${action} - ${notes || ''}`;
            
            // Apply the actual action safely using Soft Deletes/Status updates
            await this.applyModerationAction(report, action, moderatorId);

            // Notify reporter
            await NotificationEngine.publish({ userId: report.reporter_id, eventType: 'REPORT_UPDATE', title: 'Report Update', message: 'Action has been taken regarding your recent report. Thank you for keeping SwapSoko safe.', entityType: 'report' });
        }

        // 3. Update the Report state
        await adminSupabase.from('reports').update({
            status: newStatus,
            resolution: resolutionText,
            resolved_at: new Date().toISOString(),
            assigned_to: moderatorId
        }).eq('id', reportId);

        return { success: true, status: newStatus };
    }

    private static async applyModerationAction(report: any, action: string, moderatorId: string) {
        const targetType = report.target_type;
        const targetId = report.target_id;

        // Extract target user id if needed for Trust Engine
        let targetUserId = null;
        let numericId = null;
        if (targetType === 'user') targetUserId = targetId;
        else if (targetType === 'listing') {
            numericId = parseInt(targetId.replace(/-/g, ''));
            const { data: l } = await adminSupabase.from('listings').select('user_id').eq('id', numericId).single();
            if (l) targetUserId = l.user_id;
        } else if (targetType === 'community') {
            numericId = parseInt(targetId.replace(/-/g, ''));
            const { data: c } = await adminSupabase.from('communities').select('creator_id').eq('id', numericId).single();
            if (c) targetUserId = c.creator_id;
        }

        if (action === 'REMOVE') {
            if (targetType === 'listing' && numericId) {
                // SOFT DELETE LISTING
                await adminSupabase.from('listings').update({ 
                    status: 'removed', // Soft delete state
                }).eq('id', numericId);
                if (targetUserId) {
                    await NotificationEngine.publish({ userId: targetUserId, eventType: 'REPORT_UPDATE', title: 'Listing Removed', message: 'Your listing was removed due to a policy violation. You may appeal this decision.', entityType: 'report' });
                }
            } else if (targetType === 'community' && numericId) {
                // SOFT DELETE COMMUNITY
                await adminSupabase.from('communities').update({ 
                    status: 'removed', // Soft delete state
                }).eq('id', numericId);
            } else if (targetType === 'review' && numericId) {
                // SOFT DELETE REVIEW
                 await adminSupabase.from('reviews').update({ 
                    is_visible: false 
                 }).eq('id', numericId);
            }
        } else if (action === 'SUSPEND') {
            if (targetUserId) {
                // SOFT BAN USER
                await adminSupabase.from('profiles').update({ 
                    status: 'suspended' 
                }).eq('user_id', targetUserId);
                await NotificationEngine.publish({ userId: targetUserId, eventType: 'REPORT_UPDATE', title: 'Account Suspended', message: 'Your account has been suspended due to severe policy violations. You may appeal this decision.', entityType: 'report' });
            }
        } else if (action === 'WARN') {
            if (targetUserId) {
                await NotificationEngine.publish({ userId: targetUserId, eventType: 'REPORT_UPDATE', title: 'Official Warning', message: 'You have received an official warning regarding a policy violation. Further violations may result in restrictions.', entityType: 'report' });
            }
        }

        if (targetUserId && ['WARN', 'RESTRICT', 'REMOVE', 'SUSPEND'].includes(action)) {
             await adminSupabase.from('audit_logs').insert({
                 actor_id: 'system',
                 action: 'TRUST_REPUTATION_EVENT',
                 resource_type: 'user',
                 resource_id: targetUserId,
                 details: { reason: `Moderation action applied: ${action}`, severity: action }
             });
        }
    }
}
