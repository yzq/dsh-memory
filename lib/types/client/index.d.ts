/** Browser assembly for the conversation-header Project Memory manager. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
export type { ProjectMemoryActionResult, ProjectMemoryRemote, ProjectMemoryStatus, ProjectMemoryView, } from './controller.ts';
export type { ProjectMemoryActionProps, ProjectMemoryInjected } from './slots.ts';
export type { ProjectMemoryKey } from './locales.ts';
/** Required services for Remote access, locale, and slot contribution. */
export declare const inject: string[];
/**
 * Register one lazy controller per Session and the memory header action.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): Promise<void>;
//# sourceMappingURL=index.d.ts.map