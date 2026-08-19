/**
 * Client-safe Project Memory value, request, result, and event vocabulary.
 * @module dsh-memory/types
 */
import type { Branded } from '@deepseek-ai/dsh-brand';
/** Opaque identity of one session — host-free re-declaration of the shared brand. */
export type SessionId = Branded<'SessionId'>;
/** Opaque identity of one workspace — host-free re-declaration of the shared brand. */
export type WorkspaceId = Branded<'WorkspaceId'>;
/** Opaque identity of one workspace memory entry. */
export type ProjectMemoryId = Branded<'ProjectMemoryId'>;
/** User-facing entry point that created the current entry. */
export type ProjectMemoryOrigin = 'tool' | 'command' | 'ui';
/** One durable, user-maintained workspace fact. */
export interface ProjectMemoryEntry {
    /** Stable UUID used by update and delete operations. */
    readonly id: ProjectMemoryId;
    /** Exact trimmed user-authored content. */
    readonly content: string;
    /** ISO-8601 creation instant. */
    readonly createdAt: string;
    /** ISO-8601 instant of the latest content change. */
    readonly updatedAt: string;
    /** Entry point that last created or replaced the content. */
    readonly origin: ProjectMemoryOrigin;
}
/** Immutable current view of one workspace's memories. */
export interface ProjectMemorySnapshot {
    /** Stable workspace identity used by change notifications. */
    readonly workspaceId: WorkspaceId;
    /** Current human-readable workspace title. */
    readonly workspaceTitle: string;
    /** Monotonic compare-and-set revision; zero means no row has been written. */
    readonly revision: number;
    /** Current deployment limit used by management surfaces. */
    readonly maxEntries: number;
    /** Current Unicode code-point limit for one entry. */
    readonly maxEntryChars: number;
    /** Newest entries first. */
    readonly entries: readonly ProjectMemoryEntry[];
}
/** Successful Project Memory operation. */
export interface ProjectMemorySuccess<T> {
    readonly ok: true;
    readonly value: T;
}
/** The addressed Session is not attached to a registered workspace. */
export interface ProjectMemoryWorkspaceUnavailable {
    readonly code: 'workspace-unavailable';
    readonly sessionId: SessionId;
}
/** A mutation was based on an obsolete workspace snapshot. */
export interface ProjectMemoryRevisionConflict {
    readonly code: 'revision-conflict';
    readonly current: ProjectMemorySnapshot;
}
/** Memory content contains no non-whitespace character. */
export interface ProjectMemoryContentBlank {
    readonly code: 'content-blank';
}
/** Memory content contains a NUL character. */
export interface ProjectMemoryContentNul {
    readonly code: 'content-nul';
}
/** Memory content exceeds the configured Unicode code-point limit. */
export interface ProjectMemoryContentTooLong {
    readonly code: 'content-too-long';
    readonly maxChars: number;
    readonly actualChars: number;
}
/** The configured entry count has been reached. */
export interface ProjectMemoryCapacityReached {
    readonly code: 'capacity-reached';
    readonly maxEntries: number;
}
/** An update or delete named no current entry. */
export interface ProjectMemoryNotFound {
    readonly code: 'memory-not-found';
    readonly id: ProjectMemoryId;
}
/** Closed business-failure vocabulary returned across the Remote boundary. */
export type ProjectMemoryFailure = ProjectMemoryWorkspaceUnavailable | ProjectMemoryRevisionConflict | ProjectMemoryContentBlank | ProjectMemoryContentNul | ProjectMemoryContentTooLong | ProjectMemoryCapacityReached | ProjectMemoryNotFound;
/** Rejected Project Memory operation. */
export interface ProjectMemoryRejected<E extends ProjectMemoryFailure = ProjectMemoryFailure> {
    readonly ok: false;
    readonly error: E;
}
/** Business result returned by every Project Memory Remote method. */
export type ProjectMemoryResult<E extends ProjectMemoryFailure = ProjectMemoryFailure> = ProjectMemorySuccess<ProjectMemorySnapshot> | ProjectMemoryRejected<E>;
/** List request resolved through one Session's workspace membership. */
export interface ProjectMemoryListRequest {
    readonly sessionId: SessionId;
}
/** Add request with the revision observed by the caller. */
export interface ProjectMemoryAddRequest extends ProjectMemoryListRequest {
    readonly content: string;
    readonly ifRevision: number;
}
/** Update request with the exact entry id and observed workspace revision. */
export interface ProjectMemoryUpdateRequest extends ProjectMemoryAddRequest {
    readonly id: ProjectMemoryId;
}
/** Delete request with the exact entry id and observed workspace revision. */
export interface ProjectMemoryDeleteRequest extends ProjectMemoryListRequest {
    readonly id: ProjectMemoryId;
    readonly ifRevision: number;
}
declare module '@deepseek-ai/cordis' {
    interface Events {
        /**
         * One workspace memory mutation committed durably. Forwarded to Web
         * clients so open memory views can refresh.
         * @param payload - workspace identity and committed revision.
         * @mode emit
         */
        'project-memory/changed'(payload: {
            workspaceId: WorkspaceId;
            revision: number;
        }): void;
    }
}
//# sourceMappingURL=types.d.ts.map