/** Browser-local controller for one Session's workspace Project Memory. */
const INITIAL_VIEW = Object.freeze({ status: 'cold', snapshot: null, error: null });
const OK = Object.freeze({ ok: true });
const DISPOSED = Object.freeze({
    ok: false,
    error: Object.freeze({ code: 'disposed', message: 'Project Memory controller is disposed' }),
});
/** Human-readable fallback for one business failure. */
function describe(code) {
    switch (code) {
        case 'workspace-unavailable': return 'this session is not attached to a workspace';
        case 'revision-conflict': return 'project memory changed elsewhere';
        case 'content-blank': return 'memory content cannot be blank';
        case 'content-nul': return 'memory content contains a NUL character';
        case 'content-too-long': return 'memory content is too long';
        case 'capacity-reached': return 'the workspace memory limit has been reached';
        case 'memory-not-found': return 'the memory no longer exists';
        default: return code;
    }
}
/** One controller per Session, resolving storage ownership on the Host. */
export class ProjectMemoryController {
    remote;
    sessionId;
    view = INITIAL_VIEW;
    listeners = new Set();
    loadPromise = null;
    operationTail = Promise.resolve();
    disposed = false;
    /**
     * @param remote - generated Project Memory Remote namespace.
     * @param sessionId - Session used to resolve current workspace membership.
     */
    constructor(remote, sessionId) {
        this.remote = remote;
        this.sessionId = sessionId;
    }
    /** Return the current immutable view. */
    getSnapshot = () => this.view;
    /** Subscribe to view replacement. */
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    /**
     * Load once, keeping failures retryable.
     * @returns the settled load result.
     */
    ensure() {
        return this.view.status === 'ready' ? Promise.resolve(OK) : this.refresh();
    }
    /**
     * Re-read the authoritative workspace snapshot.
     * @returns the settled load result.
     */
    refresh() {
        if (this.loadPromise !== null)
            return this.loadPromise;
        this.publish({ status: 'loading', snapshot: this.view.snapshot, error: null });
        const pending = this.load();
        this.loadPromise = pending;
        return pending.finally(() => { this.loadPromise = null; });
    }
    /**
     * Re-read behind queued writes after reconnect or a Host notification.
     * @returns the settled resynchronization result.
     */
    resync() {
        const guarded = () => this.disposed
            ? Promise.resolve(DISPOSED)
            : this.refresh();
        const result = this.operationTail.then(guarded, guarded);
        this.operationTail = result.then(() => undefined);
        return result;
    }
    /**
     * Refresh an open view when a newer revision commits for its workspace.
     * @param workspaceId - workspace named by the Host notification.
     * @param revision - newly committed Host revision.
     */
    changed(workspaceId, revision) {
        const current = this.view.snapshot;
        if (current === null || current.workspaceId !== workspaceId || current.revision >= revision)
            return;
        void this.resync();
    }
    /**
     * Add one explicit user-authored memory.
     * @param content - trimmed and validated by the Host.
     * @returns the settled mutation result.
     */
    add(content) {
        return this.mutate(async (snapshot) => this.commit(await this.remote.add({
            sessionId: this.sessionId, content, ifRevision: snapshot.revision,
        })));
    }
    /**
     * Replace one explicit user-authored memory.
     * @param id - exact entry identity from the current snapshot.
     * @param content - replacement content validated by the Host.
     * @returns the settled mutation result.
     */
    update(id, content) {
        return this.mutate(async (snapshot) => this.commit(await this.remote.update({
            sessionId: this.sessionId, id, content, ifRevision: snapshot.revision,
        })));
    }
    /**
     * Delete one explicit user-authored memory.
     * @param id - exact entry identity from the current snapshot.
     * @returns the settled mutation result.
     */
    remove(id) {
        return this.mutate(async (snapshot) => this.commit(await this.remote.delete({
            sessionId: this.sessionId, id, ifRevision: snapshot.revision,
        })));
    }
    /** Drop subscribers and refuse subsequent work. */
    dispose() {
        this.disposed = true;
        this.listeners.clear();
    }
    /** Perform the list Remote and publish its result. */
    async load() {
        try {
            const carried = await this.remote.list({ sessionId: this.sessionId });
            if (this.disposed)
                return OK;
            if (!carried.ok)
                return this.loadFailed(carried.error.code, carried.error.message);
            if (!carried.value.ok)
                return this.loadFailed(carried.value.error.code, describe(carried.value.error.code));
            this.publishSnapshot(carried.value.value);
            return OK;
        }
        catch (error) {
            if (this.disposed)
                return OK;
            return this.loadFailed('transport', error instanceof Error ? error.message : 'Project Memory list failed');
        }
    }
    /** Serialize one mutation after seeding the current revision. */
    mutate(operation) {
        const guarded = async () => {
            if (this.disposed)
                return DISPOSED;
            const loaded = await this.ensure();
            if (!loaded.ok)
                return loaded;
            if (this.disposed)
                return DISPOSED;
            const snapshot = this.view.snapshot;
            if (snapshot === null)
                return { ok: false, error: { code: 'workspace-unavailable', message: describe('workspace-unavailable') } };
            try {
                return await operation(snapshot);
            }
            catch (error) {
                return { ok: false, error: { code: 'transport', message: error instanceof Error ? error.message : 'Project Memory mutation failed' } };
            }
        };
        const result = this.operationTail.then(guarded, guarded);
        this.operationTail = result.then(() => undefined);
        return result;
    }
    /** Apply a Remote mutation result, including the authoritative conflict snapshot. */
    commit(carried) {
        if (!carried.ok)
            return { ok: false, error: carried.error };
        const result = carried.value;
        if (result.ok) {
            this.publishSnapshot(result.value);
            return OK;
        }
        if (result.error.code === 'revision-conflict')
            this.publishSnapshot(result.error.current);
        return { ok: false, error: { code: result.error.code, message: describe(result.error.code) } };
    }
    /** Publish one load failure while retaining the latest usable snapshot. */
    loadFailed(code, message) {
        const error = Object.freeze({ code, message });
        this.publish({ status: 'error', snapshot: this.view.snapshot, error });
        return { ok: false, error };
    }
    /** Publish a snapshot unless a later revision is already visible. */
    publishSnapshot(snapshot) {
        const current = this.view.snapshot;
        if (current !== null && current.workspaceId === snapshot.workspaceId && current.revision > snapshot.revision)
            return;
        this.publish({ status: 'ready', snapshot, error: null });
    }
    /** Replace the view and contain subscriber failures. */
    publish(view) {
        if (this.disposed)
            return;
        this.view = Object.freeze(view);
        for (const listener of this.listeners) {
            try {
                listener();
            }
            catch (error) {
                console.error('[ui-project-memory] subscriber threw:', error);
            }
        }
    }
}
//# sourceMappingURL=controller.js.map