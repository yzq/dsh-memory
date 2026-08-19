/** Browser assembly for the conversation-header Project Memory manager. */
import projectMemoryRemote from 'dsh-memory/remote';
import { ProjectMemoryController } from "./controller.js";
import { ProjectMemoryAction } from "./ProjectMemoryAction.js";
import { en, zh } from "./locales.js";
const NS = 'projectMemory';
/** Required services for Remote access, locale, and slot contribution. */
export const inject = ['slots', 'remote', 'locale'];
/**
 * Register one lazy controller per Session and the memory header action.
 * @param ctx - client root context.
 */
export async function apply(ctx) {
    const disposeRemote = await ctx.remote.$mount(projectMemoryRemote);
    ctx.effect(() => disposeRemote, 'ui-project-memory: remote');
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-project-memory: dictionaries');
    const controllers = new Map();
    const controllerFor = (sessionId) => {
        let controller = controllers.get(sessionId);
        if (controller === undefined) {
            controller = new ProjectMemoryController(ctx.remote.projectMemory, sessionId);
            controllers.set(sessionId, controller);
        }
        return controller;
    };
    ctx.on('connection/reset', () => {
        for (const controller of controllers.values()) {
            if (controller.getSnapshot().status !== 'cold')
                void controller.resync();
        }
    });
    ctx.slots.inject('conversation.session.header.actions', () => {
        const dispose = ctx.slots.register({
            name: 'conversation.session.header.actions',
            id: 'project-memory',
            order: 30,
            locale: NS,
            inject: (sessionId) => {
                const controller = controllerFor(sessionId);
                return {
                    hooks: { projectMemory: controller },
                    ensure: () => controller.ensure(),
                    add: content => controller.add(content),
                    update: (id, content) => controller.update(id, content),
                    remove: id => controller.remove(id),
                };
            },
        }, ProjectMemoryAction);
        return () => {
            dispose();
            for (const controller of controllers.values())
                controller.dispose();
            controllers.clear();
        };
    });
}
//# sourceMappingURL=index.js.map