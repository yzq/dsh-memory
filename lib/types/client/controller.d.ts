/** Browser-local controller for one Session's workspace Project Memory. */
import type { SessionId } from '@deepseek-ai/dsh-client-connection/client';
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { ProjectMemoryId, ProjectMemoryResult, ProjectMemorySnapshot } from 'dsh-memory/types';
/** Remote methods required by the browser controller. */
export interface ProjectMemoryRemote {
    list: (request: {
        sessionId: SessionId;
    }) => Promise<RemoteResult<ProjectMemoryResult>>;
    add: (request: {
        sessionId: SessionId;
        content: string;
        ifRevision: number;
    }) => Promise<RemoteResult<ProjectMemoryResult>>;
    update: (request: {
        sessionId: SessionId;
        id: ProjectMemoryId;
        content: string;
        ifRevision: number;
    }) => Promise<RemoteResult<ProjectMemoryResult>>;
    delete: (request: {
        sessionId: SessionId;
        id: ProjectMemoryId;
        ifRevision: number;
    }) => Promise<RemoteResult<ProjectMemoryResult>>;
}
/** Load state of this Session's workspace snapshot. */
export type ProjectMemoryStatus = 'cold' | 'loading' | 'ready' | 'error';
/** Immutable view published to the header action. */
export interface ProjectMemoryView {
    readonly status: ProjectMemoryStatus;
    readonly snapshot: ProjectMemorySnapshot | null;
    readonly error: {
        readonly code: string;
        readonly message: string;
    } | null;
}
/** Settled controller action. */
export type ProjectMemoryActionResult = {
    readonly ok: true;
} | {
    readonly ok: false;
    readonly error: {
        readonly code: string;
        readonly message: string;
    };
};
/** One controller per Session, resolving storage ownership on the Host. */
export declare class ProjectMemoryController implements HostObservable<ProjectMemoryView> {
    private readonly remote;
    private readonly sessionId;
    private view;
    private readonly listeners;
    private loadPromise;
    private operationTail;
    private disposed;
    /**
     * @param remote - generated Project Memory Remote namespace.
     * @param sessionId - Session used to resolve current workspace membership.
     */
    constructor(remote: ProjectMemoryRemote, sessionId: SessionId);
    /** Return the current immutable view. */
    getSnapshot: () => ProjectMemoryView;
    /** Subscribe to view replacement. */
    subscribe: (listener: () => void) => (() => void);
    /**
     * Load once, keeping failures retryable.
     * @returns the settled load result.
     */
    ensure(): Promise<ProjectMemoryActionResult>;
    /**
     * Re-read the authoritative workspace snapshot.
     * @returns the settled load result.
     */
    refresh(): Promise<ProjectMemoryActionResult>;
    /**
     * Re-read behind queued writes after reconnect or a Host notification.
     * @returns the settled resynchronization result.
     */
    resync(): Promise<ProjectMemoryActionResult>;
    /**
     * Refresh an open view when a newer revision commits for its workspace.
     * @param workspaceId - workspace named by the Host notification.
     * @param revision - newly committed Host revision.
     */
    changed(workspaceId: ProjectMemorySnapshot['workspaceId'], revision: number): void;
    /**
     * Add one explicit user-authored memory.
     * @param content - trimmed and validated by the Host.
     * @returns the settled mutation result.
     */
    add(content: string): Promise<ProjectMemoryActionResult>;
    /**
     * Replace one explicit user-authored memory.
     * @param id - exact entry identity from the current snapshot.
     * @param content - replacement content validated by the Host.
     * @returns the settled mutation result.
     */
    update(id: ProjectMemoryId, content: string): Promise<ProjectMemoryActionResult>;
    /**
     * Delete one explicit user-authored memory.
     * @param id - exact entry identity from the current snapshot.
     * @returns the settled mutation result.
     */
    remove(id: ProjectMemoryId): Promise<ProjectMemoryActionResult>;
    /** Drop subscribers and refuse subsequent work. */
    dispose(): void;
    /** Perform the list Remote and publish its result. */
    private load;
    /** Serialize one mutation after seeding the current revision. */
    private mutate;
    /** Apply a Remote mutation result, including the authoritative conflict snapshot. */
    private commit;
    /** Publish one load failure while retaining the latest usable snapshot. */
    private loadFailed;
    /** Publish a snapshot unless a later revision is already visible. */
    private publishSnapshot;
    /** Replace the view and contain subscriber failures. */
    private publish;
}
//# sourceMappingURL=controller.d.ts.map