// AppealEngine.ts
// Implements Chapter 13: Appeal & Dispute Resolution Engine

import { adminSupabase } from '../trpc';
import { NotificationEngine } from './NotificationEngine';

export interface AppealData {
    caseId: string;
    appellantId: string;
    reason: string;
    evidenceUrls?: string[];
}

export interface DisputeData {
    swapId: string;
    openedBy: string;
    disputeType: string;
    description: string;
    evidenceUrls?: string[];
}

export interface AppealDecision {
    appealId: string;
    reviewerId: string;
    decision: 'UPHELD' | 'REVERSED' | 'MODIFIED';
    notes?: string;
    modifiedAction?: string;
}

export class AppealEngine {
    static async createAppeal(data: AppealData) {
        // Find original moderation action
        const { data: auditLog } = await adminSupabase
            .from('audit_logs')
            .select('*')
            .eq('id', data.caseId)
            .single();
            
        if (!auditLog) throw new Error("Original case not found");

        // Open an appeal
        const { data: appeal, error } = await adminSupabase.from('cases').insert({
            case_type: 'APPEAL',
            primary_user_id: data.appellantId,
            status: 'OPEN',
            priority: 'MEDIUM',
            created_at: new Date().toISOString()
        }).select().single();

        if (error) throw error;

        await adminSupabase.from('appeals').insert({
            case_id: appeal.id,
            original_action_id: data.caseId,
            appellant_id: data.appellantId,
            appeal_reason: data.reason,
            status: 'OPEN',
            created_at: new Date().toISOString()
        });

        // 1. Log the audit event
        await adminSupabase.from('audit_logs').insert({
            actor_id: data.appellantId,
            action: `APPEAL_SUBMITTED`,
            resource_type: 'appeal',
            resource_id: appeal.id,
            details: { reason: data.reason }
        });

        return { success: true, appealId: appeal.id };
    }

    static async processAppeal(decisionData: AppealDecision) {
        const { appealId, reviewerId, decision, notes, modifiedAction } = decisionData;

        // Verify the appeal is not assigned to the original moderator
        const { data: appealRecord } = await adminSupabase.from('appeals').select('*, cases(*)').eq('case_id', appealId).single();
        if (!appealRecord) throw new Error("Appeal not found");
        
        const originalActionId = appealRecord.original_action_id;
        const { data: originalAuditLog } = await adminSupabase.from('audit_logs').select('*').eq('id', originalActionId).single();
        
        if (originalAuditLog && originalAuditLog.actor_id === reviewerId) {
             throw new Error("Cannot review an appeal for a decision you made.");
        }

        // Apply decision
        let resolutionText = decision;
        
        if (decision === 'REVERSED') {
            await this.reverseModerationAction(originalAuditLog);
            resolutionText = `REVERSED: ${notes || ''}`;
            await NotificationEngine.publish({ userId: appealRecord.appellant_id, eventType: 'APPEAL_DECISION', title: 'Appeal Decision: Reversed', message: 'Your appeal was reviewed and the original decision has been reversed. Any restrictions have been lifted.', entityType: 'appeal' });
        } else if (decision === 'MODIFIED') {
            await this.modifyModerationAction(originalAuditLog, modifiedAction!);
            resolutionText = `MODIFIED to ${modifiedAction}: ${notes || ''}`;
            await NotificationEngine.publish({ userId: appealRecord.appellant_id, eventType: 'APPEAL_DECISION', title: 'Appeal Decision: Modified', message: `Your appeal was reviewed. The decision was modified to: ${modifiedAction}.`, entityType: 'appeal' });
        } else {
            resolutionText = `UPHELD: ${notes || ''}`;
            await NotificationEngine.publish({ userId: appealRecord.appellant_id, eventType: 'APPEAL_DECISION', title: 'Appeal Decision: Upheld', message: 'Your appeal was reviewed. The original decision has been upheld.', entityType: 'appeal' });
        }

        // Close the case
        await adminSupabase.from('cases').update({
            status: 'RESOLVED',
            resolved_at: new Date().toISOString()
        }).eq('id', appealId);
        
        await adminSupabase.from('appeals').update({
            status: 'RESOLVED',
            decision: decision,
            decision_reason: notes,
            resolved_at: new Date().toISOString(),
            assigned_to: reviewerId
        }).eq('case_id', appealId);

        // Audit Log
        await adminSupabase.from('audit_logs').insert({
            actor_id: reviewerId,
            action: `APPEAL_DECISION_${decision}`,
            resource_type: 'appeal',
            resource_id: appealId,
            details: { notes, modifiedAction }
        });

        return { success: true };
    }

    private static async reverseModerationAction(originalAction: any) {
        if (!originalAction || !originalAction.resource_type || !originalAction.resource_id) return;
        
        const type = originalAction.resource_type;
        const targetId = originalAction.resource_id;

        if (type === 'listing') {
            const numericId = parseInt(targetId.replace(/-/g, ''));
            // Restore listing
            await adminSupabase.from('listings').update({ status: 'active' }).eq('id', numericId);
        } else if (type === 'user') {
            // Unsuspend user
            await adminSupabase.from('profiles').update({ status: 'active' }).eq('user_id', targetId);
        }
    }

    private static async modifyModerationAction(originalAction: any, newAction: string) {
        // e.g., downgrade SUSPEND to WARN
        if (newAction === 'WARN' && originalAction.resource_type === 'user') {
             await adminSupabase.from('profiles').update({ status: 'active' }).eq('user_id', originalAction.resource_id);
             await NotificationEngine.publish({ userId: originalAction.resource_id, eventType: 'APPEAL_DECISION', title: 'Official Warning', message: 'Following your appeal, your suspension was reduced to a formal warning.', entityType: 'appeal' });
        }
    }
}
