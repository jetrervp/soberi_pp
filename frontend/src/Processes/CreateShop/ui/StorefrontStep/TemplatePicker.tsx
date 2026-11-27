import { useEffect, useState } from "react"
import ConfirmDialog from "../../../../widgets/UI/ConfirmDialog"
import type { StorefrontTemplate } from "../../model/CreateShopTypes"
import styles from "./StorefrontStep.module.scss"

export default function TemplatePicker({ shopId, hasBlocks, load, apply }: {
    shopId: number; hasBlocks: boolean
    load: (signal: AbortSignal) => Promise<{ data: StorefrontTemplate[] }>
    apply: (id: number) => Promise<void>
}) {
    const [templates, setTemplates] = useState<StorefrontTemplate[]>()
    const [source, setSource] = useState("")
    const [error, setError] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [confirmOpen, setConfirmOpen] = useState(false)
    useEffect(() => {
        const controller = new AbortController()
        void load(controller.signal).then(({ data }) => {
            if (!controller.signal.aborted) setTemplates(data.filter(template => template.id !== shopId))
        }).catch(() => {
            if (!controller.signal.aborted) setError(true)
        })
        return () => controller.abort()
    }, [shopId, load, attempt])

    return <div className={styles.templatePicker}>
        <label>Готовая витрина
            <select value={source} onChange={event => setSource(event.currentTarget.value)}>
                <option value="">Выберите витрину</option>
                <option value="0">Базовая витрина</option>
                {templates?.map(template => <option value={template.id} key={template.id}>{template.name}</option>)}
            </select>
        </label>
        <button type="button" disabled={!source} onClick={() => {
            if (hasBlocks) setConfirmOpen(true)
            else void apply(Number(source))
        }}>Применить</button>
        {confirmOpen && <ConfirmDialog title="Применить готовую витрину?"
            message="Текущие блоки будут заменены выбранным макетом." confirmLabel="Применить"
            onCancel={() => setConfirmOpen(false)} onConfirm={() => {
                setConfirmOpen(false)
                void apply(Number(source))
            }} />}
        {error ? <button type="button" onClick={() => { setError(false); setAttempt(attempt + 1) }}>Повторить загрузку</button>
            : !templates && <small role="status">Загружаем ваши витрины…</small>}
    </div>
}
