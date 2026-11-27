import { useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"
import styles from "./ConfirmDialog.module.scss"

export default function ConfirmDialog({ title, message, confirmLabel, danger = false, onCancel, onConfirm }: {
    title: string; message: string; confirmLabel: string; danger?: boolean
    onCancel: () => void; onConfirm: () => void
}) {
    const ref = useRef<HTMLDialogElement>(null)
    const id = useId()

    useEffect(() => {
        const dialog = ref.current
        dialog?.showModal()
        return () => { if (dialog?.open) dialog.close() }
    }, [])

    return createPortal(<dialog ref={ref} className={styles.modal} role="alertdialog" aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`} onCancel={event => {
            event.preventDefault()
            onCancel()
        }}>
        <h2 id={`${id}-title`}>{title}</h2>
        <p id={`${id}-message`}>{message}</p>
        <div className={styles.actions}>
            <button type="button" onClick={onCancel}>Отмена</button>
            <button type="button" className={danger ? styles.danger : styles.confirm} onClick={onConfirm}>{confirmLabel}</button>
        </div>
    </dialog>, document.body)
}
