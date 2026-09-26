// Notification Engine Core

export type NotificationType =
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'OFFER_COUNTERED'
  | 'MESSAGE_RECEIVED'
  | 'VOICE_NOTE_RECEIVED'
  | 'MULTISWAP_PROPOSED'
  | 'MULTISWAP_ACCEPTED'
  | 'MULTISWAP_COUNTERED'
  | 'MULTISWAP_BROKEN'
  | 'SWAP_COMPLETED'
  | 'REPORT_UPDATE'
  | 'APPEAL_UPDATE'
  | 'SYSTEM';

export type NotificationSeverity = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface SwapSokoEvent {
  id: string;
  eventType: NotificationType;
  actorId: string;
  entityType: 'offer' | 'message' | 'multiswap' | 'swap' | 'report' | 'user';
  entityId: string;
  payload?: any;
  timestamp: number;
}

export interface SwapSokoNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  severity: NotificationSeverity;
  isRead: boolean;
  createdAt: number;
  actorId?: string;
}

export interface NotificationPreferences {
  offersInApp: boolean;
  messagesInApp: boolean;
  multiswapInApp: boolean;
  recommendationsInApp: boolean;
  securityInApp: boolean; // Cannot be fully disabled
}

export const NotificationEngine = {
  // Simulating an event bus where features publish events
  processEvent(event: SwapSokoEvent, recipientId: string, preferences: NotificationPreferences): SwapSokoNotification | null {
    // 1. Check preferences
    if (this.shouldSuppress(event.eventType, preferences)) {
      return null;
    }

    // 2. Map Event to Notification Payload (Templating)
    const notification = this.createNotificationFromEvent(event, recipientId);

    // 3. Return notification for delivery
    return notification;
  },

  shouldSuppress(type: NotificationType, prefs: NotificationPreferences): boolean {
    if (type.startsWith('OFFER_') && !prefs.offersInApp) return true;
    if (type === 'MESSAGE_RECEIVED' && !prefs.messagesInApp) return true;
    if (type.startsWith('MULTISWAP_') && !prefs.multiswapInApp) return true;
    return false; // Deliver by default if no strict rule blocks it
  },

  createNotificationFromEvent(event: SwapSokoEvent, recipientId: string): SwapSokoNotification {
    let title = 'Notification';
    let body = 'You have a new alert.';
    let severity: NotificationSeverity = 'NORMAL';

    switch (event.eventType) {
      case 'OFFER_RECEIVED':
        title = 'New swap offer';
        body = `User ${event.actorId.replace('user_', '')} sent you a swap offer.`;
        break;
      case 'OFFER_ACCEPTED':
        title = 'Offer accepted';
        body = `User ${event.actorId.replace('user_', '')} accepted your offer.`;
        severity = 'HIGH';
        break;
      case 'MULTISWAP_PROPOSED':
        title = 'Multi-swap found';
        body = 'A new multi-swap cycle has been proposed to you.';
        severity = 'HIGH';
        break;
      case 'MESSAGE_RECEIVED':
        title = 'New Message';
        body = 'You received a new message.';
        break;
      default:
        title = event.eventType.replace('_', ' ');
    }

    return {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientId,
      type: event.eventType,
      title,
      body,
      entityType: event.entityType,
      entityId: event.entityId,
      severity,
      isRead: false,
      createdAt: event.timestamp,
      actorId: event.actorId
    };
  }
};
