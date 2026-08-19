/**
 * Explicit, workspace-scoped project memory with one storage owner shared by
 * Remote, command, model-tool, and prompt-context entry points.
 * @module dsh-memory
 */
import { Context, Service } from '@deepseek-ai/cordis';
import s from '@deepseek-ai/schemastery';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { ProjectMemoryAddRequest, ProjectMemoryDeleteRequest, ProjectMemoryId, ProjectMemoryListRequest, ProjectMemoryResult, ProjectMemoryUpdateRequest, ProjectMemoryWorkspaceUnavailable } from './types.ts';
export type * from './types.ts';
export { projectMemoryDomainSpec, projectMemoryEntrySchema, projectMemoryIdSchema, projectMemoryRecordSchema, } from './spec.ts';
export type { ProjectMemoryRecord } from './spec.ts';
/** Deployment-varying Project Memory limits and context policy. */
export interface Config {
    /** Maximum number of entries stored for one workspace. */
    readonly maxEntriesPerWorkspace?: number;
    /** Maximum Unicode code points stored in one entry. */
    readonly maxEntryChars?: number;
    /** Whether current workspace memories enter dynamic request context. */
    readonly injectContext?: boolean;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        projectMemory: ProjectMemoryService;
    }
}
/**
 * Brand one raw UUID or Remote id as a Project Memory identity.
 * @param id - validated UUID or opaque id received from a typed boundary.
 * @returns the branded Project Memory identity.
 */
export declare function ProjectMemoryId(id: string): ProjectMemoryId;
/** Storage owner and all first-party Project Memory entry points. */
export declare class ProjectMemoryService extends TypertRemoteService {
    static inject: string[];
    /** Loader validation for bounded storage and context injection. */
    static Config: s<Config>;
    private readonly resolved;
    private table?;
    private operationTail;
    private mutationAdmissionOpen;
    /**
     * @param ctx - Host context carrying storage, workspace, prompt, tool, and command services.
     * @param config - resolved deployment limits and injection policy.
     */
    constructor(ctx: Context, config: Config);
    /** Open the durable domain and register every consumer over this service. */
    protected [Service.init](): Promise<void>;
    /** Reject stored rows that exceed the deployment limits selected at boot. */
    private validateStoredRows;
    /**
     * Read the current snapshot resolved from a Session's workspace membership.
     * @param request - Session whose attached workspace is addressed.
     * @returns the immutable current snapshot or `workspace-unavailable`.
     */
    list(request: ProjectMemoryListRequest): Promise<ProjectMemoryResult<ProjectMemoryWorkspaceUnavailable>>;
    /**
     * Add one newest-first entry through the Web Remote.
     * @param request - content and observed workspace revision.
     * @returns the committed snapshot or an explicit business failure.
     */
    add(request: ProjectMemoryAddRequest): Promise<ProjectMemoryResult>;
    /**
     * Replace one entry through the Web Remote without changing list order.
     * @param request - entry id, replacement content, and observed revision.
     * @returns the committed snapshot or an explicit business failure.
     */
    update(request: ProjectMemoryUpdateRequest): Promise<ProjectMemoryResult>;
    /**
     * Delete one entry through the Web Remote.
     * @param request - entry id and observed revision.
     * @returns the committed snapshot or an explicit business failure.
     */
    delete(request: ProjectMemoryDeleteRequest): Promise<ProjectMemoryResult>;
    /** Read the current snapshot for an exact live agent. */
    private listForAgent;
    /** Resolve a Session id to its currently attached workspace. */
    private workspaceForSession;
    /** Resolve an agent through the same durable workspace membership account. */
    private workspaceForAgent;
    /** Read and detach one workspace snapshot from storage-owned values. */
    private readWorkspace;
    /** Resolve a Session then enter the single mutation transaction path. */
    private mutateForSession;
    /** Resolve an Agent then enter the single mutation transaction path. */
    private mutateForAgent;
    /** Serialize one compare-and-set mutation through durable commit and notification. */
    private mutateWorkspace;
    /** Forward one post-durability notification without retroactively failing the write. */
    private emitChanged;
    /** Queue one mutation and reject new admission once service teardown begins. */
    private enqueue;
    /** Register the bounded dynamic context provider. */
    private registerContext;
    /** Register the single multi-action model tool. */
    private registerTool;
    /** Require a Host-attested direct human message in the current root-agent turn. */
    private requireDirectHumanMutation;
    /** Register the direct `/memory` command. */
    private registerCommand;
    /** Parse and execute one human command through the same mutation path. */
    private executeCommand;
    /** Require the domain table after service initialization. */
    private requireTable;
}
export default ProjectMemoryService;
//# sourceMappingURL=index.d.ts.map