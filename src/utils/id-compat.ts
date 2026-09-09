// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// ID COMPATIBILITY UTILITIES
// Version: 2026.09
// ============================================================
//
// Совместимость со старыми сервисами проекта.
// Не заменяет src/utils/id.ts.
// Не содержит собственной логики генерации случайных ID.
// Все значения создаются через существующие функции id.ts.
//

import {
publicId,
createPublicationId,
createReportId,
createEventId,
createVisitorId,
createCommentId,
createNotificationId,
createActivityId,
} from "./id";

// ============================================================
// GENERIC ID
// ============================================================

export function generateId(
prefix = "to"
): string {
return publicId(prefix);
}

// ============================================================
// PUBLICATION
// ============================================================

export function generatePublicationId(): string {
return createPublicationId();
}

export function generatePublicationNumber(): string {
return `#${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

// ============================================================
// REVIEW
// ============================================================

export function createReviewId(): string {
return publicId("review");
}

export function createReviewReplyId(): string {
return publicId("review_reply");
}

export function createReviewReportId(): string {
return publicId("review_report");
}

export function createReviewHistoryId(): string {
return publicId("review_history");
}

// ============================================================
// GENERIC CREATE ID
// ============================================================

export function createId(
prefix = "to"
): string {
return publicId(prefix);
}

// ============================================================
// EXISTING ID ALIASES
// ============================================================

export {
createPublicationId,
createReportId,
createEventId,
createVisitorId,
createCommentId,
createNotificationId,
createActivityId,
};

// ============================================================
// END
// ============================================================
