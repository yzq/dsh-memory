import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Conversation-header entry and modal editor for workspace Project Memory. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, IconDataOutline16, IconEditOutline16, IconPlusOutline16, IconTrashOutline16, Modal, Tooltip, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './ProjectMemoryAction.module.css';
/** Translate one controller failure into owned product copy. */
function errorKey(code) {
    switch (code) {
        case 'workspace-unavailable': return 'error.workspace';
        case 'revision-conflict': return 'error.conflict';
        case 'content-blank': return 'error.blank';
        case 'content-too-long': return 'error.tooLong';
        case 'capacity-reached': return 'error.capacity';
        case 'memory-not-found': return 'error.notFound';
        default: return 'error.generic';
    }
}
/**
 * Render the Project Memory header trigger and direct management dialog.
 * @param props - Session runtime, observable controller, mutations, and copy.
 * @returns the always-visible trigger plus a modal while open.
 */
export function ProjectMemoryAction({ useProjectMemory, ensure, add, update, remove, t, }) {
    const view = useProjectMemory(state => state);
    const snapshot = view.snapshot;
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [editing, setEditing] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [confirming, setConfirming] = useState(null);
    const [pending, setPending] = useState(false);
    const [failure, setFailure] = useState(null);
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        return () => { alive.current = false; };
    }, []);
    useEffect(() => {
        if (open)
            void ensure();
    }, [ensure, open]);
    const settle = useCallback((result, onSuccess) => {
        if (!alive.current)
            return;
        setPending(false);
        if (result.ok) {
            setFailure(null);
            onSuccess?.();
            return;
        }
        setFailure(t(errorKey(result.error.code)));
    }, [t]);
    const submitAdd = useCallback(() => {
        setPending(true);
        setFailure(null);
        void add(draft).then(result => settle(result, () => { setDraft(''); }));
    }, [add, draft, settle]);
    const submitEdit = useCallback((id) => {
        setPending(true);
        setFailure(null);
        void update(id, editDraft).then(result => settle(result, () => { setEditing(null); }));
    }, [editDraft, settle, update]);
    const submitDelete = useCallback((id) => {
        setPending(true);
        setFailure(null);
        void remove(id).then(result => settle(result, () => { setConfirming(null); }));
    }, [remove, settle]);
    const openEditor = useCallback((id, content) => {
        setEditing(id);
        setEditDraft(content);
        setConfirming(null);
        setFailure(null);
    }, []);
    const count = snapshot?.entries.length ?? 0;
    const atCapacity = snapshot !== null && count >= snapshot.maxEntries;
    const loadFailure = view.status === 'error' && view.error !== null
        ? t(errorKey(view.error.code))
        : null;
    return (_jsxs(_Fragment, { children: [_jsx(Tooltip, { label: t('action.open'), side: "bottom", children: _jsxs("button", { type: "button", className: css.trigger, "aria-label": t('action.open'), onClick: () => { setOpen(true); }, children: [_jsx(IconDataOutline16, { size: 14 }), count > 0 && _jsx("span", { className: css.triggerCount, children: count })] }) }), _jsx(Modal, { open: open, onClose: () => { setOpen(false); }, title: t('dialog.title'), closeLabel: t('dialog.close'), description: t('dialog.description'), className: css.dialog, contentClassName: css.dialogContent, children: _jsxs("div", { className: css.body, children: [_jsxs("div", { className: css.summary, children: [_jsx("span", { children: snapshot === null ? '' : snapshot.workspaceTitle }), _jsx("span", { children: t('count', { count, max: snapshot?.maxEntries ?? '–' }) })] }), _jsx("p", { className: css.warning, children: t('warning') }), _jsxs("label", { className: css.addField, children: [_jsx("span", { className: css.visuallyHidden, children: t('add.label') }), _jsx("textarea", { value: draft, rows: 3, maxLength: snapshot?.maxEntryChars, placeholder: t('add.placeholder'), disabled: pending || atCapacity, onChange: (event) => { setDraft(event.target.value); } }), _jsx(Button, { size: "sm", icon: _jsx(IconPlusOutline16, { size: 14 }), disabled: pending || atCapacity || draft.trim().length === 0, onClick: submitAdd, children: t('add.submit') })] }), view.status === 'loading' && snapshot === null && _jsx("p", { className: css.status, children: t('status.loading') }), loadFailure !== null && _jsx("p", { className: css.error, role: "alert", children: loadFailure }), failure !== null && _jsx("p", { className: css.error, role: "alert", children: failure }), snapshot !== null && snapshot.entries.length === 0 && _jsx("p", { className: css.empty, children: t('empty') }), snapshot !== null && snapshot.entries.length > 0 && (_jsx("ul", { className: css.entries, children: snapshot.entries.map(entry => (_jsx("li", { className: css.entry, children: editing === entry.id
                                    ? (_jsxs("div", { className: css.editor, children: [_jsx("textarea", { value: editDraft, rows: 3, maxLength: snapshot.maxEntryChars, autoFocus: true, onChange: (event) => { setEditDraft(event.target.value); } }), _jsxs("div", { className: css.actions, children: [_jsx(Button, { size: "sm", variant: "outline", disabled: pending, onClick: () => { setEditing(null); }, children: t('entry.cancel') }), _jsx(Button, { size: "sm", disabled: pending || editDraft.trim().length === 0, onClick: () => { submitEdit(entry.id); }, children: t('entry.save') })] })] }))
                                    : (_jsxs(_Fragment, { children: [_jsx("p", { className: css.content, children: entry.content }), _jsxs("div", { className: css.meta, children: [_jsx("span", { children: t('entry.updated', { date: entry.updatedAt.slice(0, 10) }) }), _jsxs("div", { className: css.actions, children: [_jsx(Button, { size: "sm", variant: "ghost", icon: _jsx(IconEditOutline16, { size: 14 }), disabled: pending, onClick: () => { openEditor(entry.id, entry.content); }, children: t('entry.edit') }), confirming === entry.id
                                                                ? (_jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", variant: "outline", disabled: pending, onClick: () => { setConfirming(null); }, children: t('entry.cancel') }), _jsx(Button, { size: "sm", disabled: pending, onClick: () => { submitDelete(entry.id); }, children: t('entry.confirmDelete') })] }))
                                                                : (_jsx(Button, { size: "sm", variant: "ghost", icon: _jsx(IconTrashOutline16, { size: 14 }), disabled: pending, onClick: () => { setConfirming(entry.id); setEditing(null); setFailure(null); }, children: t('entry.delete') }))] })] })] })) }, entry.id))) }))] }) })] }));
}
//# sourceMappingURL=ProjectMemoryAction.js.map