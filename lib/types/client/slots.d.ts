/** Slot contract for the conversation-header Project Memory action. */
import type { HostObservable, InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ProjectMemoryId } from 'dsh-memory/types';
import type { ProjectMemoryActionResult, ProjectMemoryView } from './controller.ts';
/** Injected business face for one Session's Project Memory manager. */
export interface ProjectMemoryInjected {
    hooks: {
        /** Current workspace snapshot bound as `useProjectMemory`. */
        projectMemory: HostObservable<ProjectMemoryView>;
    };
    /** Load this Session's workspace memory. */
    ensure: () => Promise<ProjectMemoryActionResult>;
    /** Add a memory using the observed revision. */
    add: (content: string) => Promise<ProjectMemoryActionResult>;
    /** Replace one memory using the observed revision. */
    update: (id: ProjectMemoryId, content: string) => Promise<ProjectMemoryActionResult>;
    /** Delete one memory using the observed revision. */
    remove: (id: ProjectMemoryId) => Promise<ProjectMemoryActionResult>;
}
/** Full props for the session-header Project Memory action. */
export type ProjectMemoryActionProps = PropsRuntime<'conversation.session.header.actions'> & PropsLocale<'projectMemory'> & InjectFace<ProjectMemoryInjected>;
//# sourceMappingURL=slots.d.ts.map