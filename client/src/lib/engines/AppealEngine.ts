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

export interface DisputeDecision {
    disputeId: string;
    reviewerId: string;
    decision: 'NO_VIOLATION' | 'BUYER_FAVORED' | 'SELLER_FAVORED' | 'PARTIAL_RESOLUTION' | 'TRANSACTION_VOIDED' | 'REMEDIATION_REQUIRED';
    reason: string;
    actions: string;
}

export interface AppealDecision {
    appealId: string;
    reviewerId: string;
    decision: 'UPHELD' | 'REVERSED' | 'MODIFIED';
    notes?: string;
    modifiedAction?: string;
}

export class AppealEngine {
    
    // ==========================================
    // APPEALS (Challenging Platform Decisions)
    // ==========================================
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
            await adminSupabase.from('listings').update({ status: 'active' }).eq('id', numericId);
        } else if (type === 'user') {
            await adminSupabase.from('profiles').update({ status: 'active' }).eq('user_id', targetId);
        }
    }

    private static async modifyModerationAction(originalAction: any, newAction: string) {
        if (newAction === 'WARN' && originalAction.resource_type === 'user') {
             await adminSupabase.from('profiles').update({ status: 'active' }).eq('user_id', originalAction.resource_id);
             await NotificationEngine.publish({ userId: originalAction.resource_id, eventType: 'APPEAL_DECISION', title: 'Official Warning', message: 'Following your appeal, your suspension was reduced to a formal warning.', entityType: 'appeal' });
        }
    }

    // ==========================================
    // DISPUTES (Transaction Problems between Users)
    // ==========================================
    
    static async createDispute(data: DisputeData) {
        // Verify Swap exists and is accepted/completed
        const { data: swap } = await adminSupabase.from('proposals').select('*').eq('id', data.swapId).single();
        if (!swap) throw new Error("Swap not found");
        if (swap.status !== 'accepted' && swap.status !== 'completed') {
             throw new Error("Can only dispute accepted or completed swaps.");
        }

        // Verify participant
        if (swap.from_user_id !== data.openedBy && swap.to_user_id !== data.openedBy) {
             throw new Error("You are not a participant in this swap.");
        }

        const otherUserId = swap.from_user_id === data.openedBy ? swap.to_user_id : swap.from_user_id;

        // Open dispute case
        const { data: disputeCase, error } = await adminSupabase.from('cases').insert({
            case_type: 'TRANSACTION_DISPUTE',
            primary_user_id: data.openedBy,
            status: 'WAITING_FOR_PARTY', // We need the other party's statement
            priority: 'HIGH',
            created_at: new Date().toISOString()
        }).select().single();

        if (error) throw error;

        // Add to swap_disputes
        await adminSupabase.from('swap_disputes').insert({
            case_id: disputeCase.id,
            swap_id: data.swapId,
            opened_by: data.openedBy,
            dispute_type: data.disputeType,
            description: data.description,
            status: 'OPEN',
            created_at: new Date().toISOString()
        });

        // Store Evidence
        if (data.evidenceUrls && data.evidenceUrls.length > 0) {
            for (const url of data.evidenceUrls) {
                 await adminSupabase.from('case_evidence').insert({
                     case_id: disputeCase.id,
                     submitted_by: data.openedBy,
                     evidence_type: 'IMAGE',
                     storage_path: url,
                     created_at: new Date().toISOString()
                 });
            }
        }

        // 1. Log the audit event for timeline
        await adminSupabase.from('case_events').insert({
            case_id: disputeCase.id,
            event_type: 'DISPUTE_OPENED',
            actor_id: data.openedBy,
            details: { reason: data.description }
        });

        // Notify other party
        await NotificationEngine.publish({ 
            userId: otherUserId, 
            eventType: 'SYSTEM_ALERT', 
            title: 'Dispute Opened', 
            message: `A dispute has been opened regarding Swap #${data.swapId}. Please provide your response within 48 hours.`, 
            entityType: 'swap' 
        });

        return { success: true, disputeCaseId: disputeCase.id };
    }

    static async submitDisputeResponse(caseId: string, responderId: string, responseText: string, evidenceUrls?: string[]) {
        // Move case to UNDER_REVIEW
        await adminSupabase.from('cases').update({ status: 'UNDER_REVIEW' }).eq('id', caseId);

        await adminSupabase.from('case_events').insert({
            case_id: caseId,
            event_type: 'PARTY_RESPONSE_SUBMITTED',
            actor_id: responderId,
            details: { statement: responseText }
        });

        if (evidenceUrls && evidenceUrls.length > 0) {
            for (const url of evidenceUrls) {
                 await adminSupabase.from('case_evidence').insert({
                     case_id: caseId,
                     submitted_by: responderId,
                     evidence_type: 'IMAGE',
                     storage_path: url,
                     created_at: new Date().toISOString()
                 });
            }
        }

        return { success: true };
    }

    static async resolveDispute(decisionData: DisputeDecision) {
        const { disputeId, reviewerId, decision, reason, actions } = decisionData;

        // Fetch the dispute
        const { data: disputeRec } = await adminSupabase.from('swap_disputes').select('*, cases(*)').eq('case_id', disputeId).single();
        if (!disputeRec) throw new Error("Dispute not found");

        const swap = await adminSupabase.from('proposals').select('*').eq('id', disputeRec.swap_id).single();
        if (!swap.data) throw new Error("Swap record not found");

        // Close the case
        await adminSupabase.from('cases').update({
            status: 'RESOLVED',
            resolved_at: new Date().toISOString()
        }).eq('id', disputeId);

        await adminSupabase.from('swap_disputes').update({
            status: 'RESOLVED',
            resolved_at: new Date().toISOString()
        }).eq('case_id', disputeId);

        // Record Decision
        await adminSupabase.from('case_events').insert({
            case_id: disputeId,
            event_type: 'DECISION_MADE',
            actor_id: reviewerId,
            details: { decision, reason, actions }
        });

        // Emit Trust Ledger Event if user was ruled against
        let penalizedUserId = null;
        if (decision === 'BUYER_FAVORED') penalizedUserId = swap.data.to_user_id; // assuming from_user_id is buyer for this mock
        if (decision === 'SELLER_FAVORED') penalizedUserId = swap.data.from_user_id; 

        if (penalizedUserId && decision !== 'NO_VIOLATION') {
             await adminSupabase.from('audit_logs').insert({
                 actor_id: 'system',
                 action: 'TRUST_REPUTATION_EVENT',
                 resource_type: 'user',
                 resource_id: penalizedUserId,
                 details: { reason: `Dispute resolved against user: ${reason}`, severity: 'HIGH' }
             });
        }

        // Notify participants
        const buyerMsg = decision === 'BUYER_FAVORED' ? 'The dispute was resolved in your favor.' : 'The dispute decision requires action on your end. Check case details.';
        const sellerMsg = decision === 'SELLER_FAVORED' ? 'The dispute was resolved in your favor.' : 'The dispute decision requires action on your end. Check case details.';

        await NotificationEngine.publish({ userId: swap.data.from_user_id, eventType: 'SYSTEM_ALERT', title: 'Dispute Resolved', message: buyerMsg, entityType: 'swap' });
        await NotificationEngine.publish({ userId: swap.data.to_user_id, eventType: 'SYSTEM_ALERT', title: 'Dispute Resolved', message: sellerMsg, entityType: 'swap' });

        return { success: true };
    }
}
