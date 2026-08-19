/** Package-owned invariant companion. @module dsh-memory/invariant */
const PACKAGE_NAME = 'dsh-memory';
/** Cordis companion plugin name. */
export const name = 'project-memory-invariant';
/** Services required before the companion can reserve and check ownership. */
export const inject = ['invariants'];
/**
 * No runtime invariant: one service owns every mutation and the storage-domain
 * schema validates durable rows when the domain opens.
 */
const install = Object.assign(() => { }, { inject: ['projectMemory'] });
/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
/* jscpd:ignore-end */
//# sourceMappingURL=invariant.js.map