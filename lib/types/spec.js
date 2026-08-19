/** Durable storage-domain declaration for workspace-scoped project memories. */
import { z } from 'zod';
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
const nonNegativeSafeInteger = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
/** Runtime schema for one opaque memory id. */
export const projectMemoryIdSchema = z.uuid().transform(value => value);
/** Runtime schema for one durable memory entry. */
export const projectMemoryEntrySchema = z.object({
    id: projectMemoryIdSchema,
    content: z.string().min(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    origin: z.union([z.literal('tool'), z.literal('command'), z.literal('ui')]),
}).refine(entry => Date.parse(entry.updatedAt) >= Date.parse(entry.createdAt), {
    path: ['updatedAt'],
    message: 'project memory updatedAt must not precede createdAt',
});
/** Durable record for one canonical workspace path. */
export const projectMemoryRecordSchema = z.object({
    revision: nonNegativeSafeInteger,
    entries: z.array(projectMemoryEntrySchema),
}).superRefine((record, ctx) => {
    const ids = new Set();
    record.entries.forEach((entry, index) => {
        if (ids.has(entry.id)) {
            ctx.addIssue({
                code: 'custom',
                path: ['entries', index, 'id'],
                message: `duplicate project memory id '${entry.id}'`,
            });
        }
        ids.add(entry.id);
    });
});
/** One memory record per canonical workspace path. */
export const projectMemoryDomainSpec = defineDomain({
    name: 'project_memory',
    version: 0,
    tables: {
        workspaces: domainTable(projectMemoryRecordSchema),
    },
});
//# sourceMappingURL=spec.js.map