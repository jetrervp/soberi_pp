import { useState, type ReactNode } from "react"
import { blockNames } from "../../model/CreateShopModel"
import type { Block, Category, Product } from "../../model/CreateShopTypes"
import BlockLibrary from "./BlockLibrary"
import BlockProperties from "./BlockProperties"
import StorefrontPreview from "./StorefrontPreview"
import styles from "./StorefrontStep.module.scss"

export default function StorefrontStep({ name, logo, blocks, products, categories, status, onChange, onPatch, upload, onError }: {
    name: string; logo: string | null; blocks: Block[]; products: Product[]; categories: Category[]; onChange: (blocks: Block[]) => void
    onPatch: (id: string, changes: Partial<Block>) => void
    status: ReactNode; upload: (file: File) => Promise<Pick<Product, "photoId" | "photo">>; onError: (error: unknown) => void
}) {
    const [selectedId, setSelected] = useState<string>()
    const selected = blocks.find(block => block.id === selectedId) ?? blocks[0]

    return <section className={styles.studio}>
        <header className={styles.heading}>
            <h1>Оформите витрину</h1>
            {status}
        </header>
        <div className={styles.builder}>
            <BlockLibrary blocks={blocks} selected={selected?.id} onSelect={setSelected} onAdd={kind => {
                const id = crypto.randomUUID()
                onChange([...blocks, {
                    id, kind, title: blockNames[kind], text: "",
                    color: kind === "hero" ? "#deebe2" : "#ffffff",
                    productKeys: kind === "catalog" ? products.map(product => product.key) : [],
                }])
                setSelected(id)
            }} onMove={(id, offset) => {
                const index = blocks.findIndex(block => block.id === id)
                const next = [...blocks]
                const [block] = next.splice(index, 1)
                next.splice(index + offset, 0, block)
                onChange(next)
            }} onCopy={id => {
                const index = blocks.findIndex(block => block.id === id)
                const copy = { ...blocks[index], id: crypto.randomUUID() }
                const next = [...blocks]
                next.splice(index + 1, 0, copy)
                onChange(next)
                setSelected(copy.id)
            }} onRemove={id => onChange(blocks.filter(block => block.id !== id))} />
            <StorefrontPreview name={name} logo={logo} blocks={blocks} products={products} selected={selected?.id} onSelect={setSelected}
                onResize={(id, span) => onPatch(id, { span })} />
            <BlockProperties key={selected?.id} block={selected} products={products} categories={categories} onError={onError}
                onPhoto={async (id, file, background) => {
                    const { photoId, photo } = await upload(file)
                    onPatch(id, background ? { bgPhotoId: photoId, bgPhoto: photo } : { photoId, photo })
                }}
                onChange={value => { if (selected) onPatch(selected.id, value) }} />
        </div>
    </section>
}
