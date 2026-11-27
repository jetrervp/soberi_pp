import { useRef, useState, type DragEvent } from "react"
import { blockNames } from "../../model/CreateShopModel"
import type { Block } from "../../model/CreateShopTypes"
import styles from "./StorefrontStep.module.scss"


export default function BlockLibrary({ blocks, selected, onAdd, onSelect, onMove, onCopy, onRemove }: {
    blocks: Block[]; selected?: string; onAdd: (kind: Block["kind"]) => void
    onSelect: (id: string) => void; onMove: (id: string, offset: number) => void
    onCopy: (id: string) => void; onRemove: (id: string) => void
}) {
    const dragged = useRef<string | null>(null)
    const [target, setTarget] = useState<{ id: string; side: "before" | "after" }>()
    function dropSide(event: DragEvent<HTMLLIElement>) {
        const rect = event.currentTarget.getBoundingClientRect()
        return event.clientY < rect.top + rect.height / 2 ? "before" : "after"
    }

    return <aside className={styles.tools}>
        <h2>Блоки витрины</h2>
        <div className={styles.library}>{(Object.keys(blockNames) as Block["kind"][]).map(kind =>
            <button type="button" key={kind} disabled={blocks.length >= 40} onClick={() => onAdd(kind)}>+ {kind === "catalog" ? "Создать каталог" : blockNames[kind]}</button>)}</div>
        <h3>Порядок блоков</h3>
        <ol className={styles.order}>{blocks.map((block, index) => <li key={block.id} data-drop={target?.id === block.id ? target.side : undefined}
            onDragOver={event => {
                if (!dragged.current || dragged.current === block.id) return
                event.preventDefault()
                const side = dropSide(event)
                if (target?.id !== block.id || target.side !== side) setTarget({ id: block.id, side })
            }} onDragLeave={event => {
                if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setTarget(undefined)
            }} onDrop={event => {
                if (!dragged.current) return
                event.preventDefault()
                const from = blocks.findIndex(item => item.id === dragged.current)
                if (from !== -1 && from !== index) {
                    const insertion = index + Number(dropSide(event) === "after") - Number(from < index)
                    if (insertion !== from) onMove(blocks[from].id, insertion - from)
                }
                dragged.current = null
                setTarget(undefined)
            }}>
            <button type="button" className={styles.dragHandle} draggable title="Перетащить блок или переместить клавишами Alt + ↑ / ↓" aria-label="Переместить блок" aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                onKeyDown={event => {
                    if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return
                    event.preventDefault()
                    const offset = event.key === "ArrowUp" ? -1 : 1
                    if (index + offset >= 0 && index + offset < blocks.length) onMove(block.id, offset)
                }}
                onDragStart={event => {
                    if (event.currentTarget.matches(":disabled")) { event.preventDefault(); return }
                    dragged.current = block.id
                    event.dataTransfer.setData("text/plain", block.id)
                    event.dataTransfer.effectAllowed = "move"
                }} onDragEnd={() => { dragged.current = null; setTarget(undefined) }}>⠿</button>
            <button type="button" aria-pressed={block.id === selected} onClick={() => onSelect(block.id)}>
                {block.title || blockNames[block.kind]}
            </button>
            <div className={styles.blockActions}>
                <button type="button" disabled={blocks.length >= 40} onClick={() => onCopy(block.id)}>Копировать</button>
                <button type="button" onClick={() => onRemove(block.id)}>Удалить</button>
            </div>
        </li>)}</ol>
    </aside>
}
