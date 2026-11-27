import { useEffect, useRef, useState, type PointerEvent } from "react"
import { blockSpan, imageMode } from "../../model/CreateShopModel"
import type { Block, Product } from "../../model/CreateShopTypes"
import Storefront from "./Storefront"
import styles from "./StorefrontStep.module.scss"

export default function StorefrontPreview({ name, logo, blocks, products, selected, onSelect, onResize }: {
    name: string; logo: string | null; blocks: Block[]; products: Product[]; selected?: string
    onSelect: (id: string) => void; onResize: (id: string, span: number) => void
}) {
    const [mobile, setMobile] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const preview = useRef<HTMLDivElement>(null)
    const gesture = useRef<{ id: string; start: number; width: number; span: number } | null>(null)

    function start(event: PointerEvent<HTMLButtonElement>, block: Block) {
        const layout = event.currentTarget.parentElement?.parentElement
        if (!layout) return
        const gap = parseFloat(getComputedStyle(layout).columnGap) || 0
        gesture.current = { id: block.id, start: event.clientX, width: (layout.clientWidth + gap) / 12, span: blockSpan(block) }
        event.currentTarget.setPointerCapture(event.pointerId)
        event.preventDefault()
    }

    function resize(event: PointerEvent<HTMLButtonElement>, block: Block) {
        const drag = gesture.current
        if (!drag || drag.id !== block.id || !drag.width) return
        const span = Math.max(1, Math.min(12, drag.span + Math.round((event.clientX - drag.start) / drag.width)))
        if (span !== blockSpan(block)) onResize(block.id, span)
    }

    useEffect(() => {
        const sync = () => setFullscreen(document.fullscreenElement === preview.current)
        document.addEventListener("fullscreenchange", sync)
        return () => document.removeEventListener("fullscreenchange", sync)
    }, [])

    return <div ref={preview} className={styles.workarea}>
        <div className={styles.toolbar}>
            <button type="button" aria-pressed={mobile} onClick={() => setMobile(value => !value)}>
                {mobile ? "Вид компьютера" : "Мобильный вид"}
            </button>
            {document.fullscreenEnabled && <button type="button" onClick={() => {
                const action = fullscreen ? document.exitFullscreen() : preview.current?.requestFullscreen()
                void action?.catch(() => undefined)
            }}>{fullscreen ? "Выйти из полноэкранного режима" : "На весь экран"}</button>}
        </div>
        <div className={mobile ? styles.mobile : undefined}>
            <Storefront name={name} logo={logo} blocks={blocks} products={products} preview selected={selected} onSelect={onSelect}
                controls={block => block.id === selected && !mobile && !(block.kind === "image" && block.photo && imageMode(block) === "wide") &&
                    <button type="button" className={styles.resize} aria-label="Изменить ширину блока"
                        title="Перетащите край блока, чтобы изменить ширину"
                        onPointerDown={event => start(event, block)} onPointerMove={event => resize(event, block)}
                        onLostPointerCapture={() => { gesture.current = null }}
                        onKeyDown={event => {
                            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                                event.preventDefault()
                                onResize(block.id, Math.max(1, Math.min(12, blockSpan(block) + (event.key === "ArrowRight" ? 1 : -1))))
                            }
                        }}>↔</button>} />
        </div>
        {!blocks.length && <p className={styles.empty}>Добавьте блок из библиотеки.</p>}
    </div>
}
