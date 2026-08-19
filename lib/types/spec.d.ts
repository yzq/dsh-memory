/** Durable storage-domain declaration for workspace-scoped project memories. */
import { z } from 'zod';
import type { ProjectMemoryEntry, ProjectMemoryId } from './types.ts';
/** Runtime schema for one opaque memory id. */
export declare const projectMemoryIdSchema: z.ZodPipe<z.ZodUUID, z.ZodTransform<ProjectMemoryId, string>>;
/** Runtime schema for one durable memory entry. */
export declare const projectMemoryEntrySchema: z.ZodType<ProjectMemoryEntry>;
/** Durable record for one canonical workspace path. */
export declare const projectMemoryRecordSchema: z.ZodObject<{
    revision: z.ZodNumber;
    entries: z.ZodArray<z.ZodType<ProjectMemoryEntry, unknown, z.core.$ZodTypeInternals<ProjectMemoryEntry, unknown>>>;
}, z.core.$strip>;
/** Immutable durable record stored for one canonical workspace path. */
export interface ProjectMemoryRecord {
    /** Monotonic compare-and-set revision. */
    readonly revision: number;
    /** Newest entries first. */
    readonly entries: readonly ProjectMemoryEntry[];
}
/** One memory record per canonical workspace path. */
export declare const projectMemoryDomainSpec: {
    name: string;
    version: number;
    tables: {
        workspaces: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, ProjectMemoryRecord>;
    };
};
//# sourceMappingURL=spec.d.ts.map