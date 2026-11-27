import { isAxiosError } from "axios"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAppSelector } from "../../../App/AppStore"
import { shopApi } from "../api/CreateShopApi"
import { blankShop, initialBlocks } from "../model/CreateShopModel"
import { contactFields, contactHref } from "../model/contacts"
import type { Block, Product, Shop, ShopSettings } from "../model/CreateShopTypes"

export function errorMessage(error: unknown) {
    if (isAxiosError(error)) {
        const message = error.response?.data?.message
        if (Array.isArray(message)) return message.join(". ")
        if (typeof message === "string") return message
    }
    return error instanceof Error && !isAxiosError(error) ? error.message : "Не удалось сохранить или загрузить данные"
}

export function useCreateShop(editorOnly: boolean, manageId?: string, watchInventory = false) {
    const [params, setParams] = useSearchParams()
    const id = manageId ?? params.get("draft")
    const token = useAppSelector(state => state.AuthStore.accessToken)
    const api = useMemo(() => shopApi(token), [token])
    const [shop, setShop] = useState(blankShop)
    const latest = useRef(blankShop)
    const loadedId = useRef<string | null>(null)
    const [step, setStep] = useState(0)
    const [busy, setBusy] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [loadFailure, setLoadFailure] = useState<{ id: string; message: string }>()
    const loadError = loadFailure?.id === id ? loadFailure?.message ?? "" : ""
    const [error, setError] = useState("")
    const [published, setPublished] = useState(false)
    const [saveState, setSaveState] = useState<"idle" | "pending" | "saved" | "failed">("idle")
    const pending = useRef(false)
    const timer = useRef<number | undefined>(undefined)
    const saving = useRef<Promise<void> | null>(null)
    const completionReady = useRef(false)
    const commitProduct = useRef<(() => Product[]) | null>(null)

    useEffect(() => {
        if (!id || loadedId.current === id) return
        let canceled = false
        api.get(id).then(({ data }) => {
            if (canceled) return
            loadedId.current = id
            latest.current = data
            setShop(data)
            setStep(data.status === "ACTIVE" ? 5 : data.setupStep)
            setLoadFailure(undefined)
        }).catch(error => {
            if (!canceled) setLoadFailure({ id, message: errorMessage(error) })
        })
        return () => { canceled = true }
    }, [api, id])

    useEffect(() => () => window.clearTimeout(timer.current), [])

    useEffect(() => {
        if (!watchInventory || !manageId || busy || uploading) return
        const controller = new AbortController()
        let refreshing = false
        async function refresh() {
            const snapshot = latest.current
            if (!manageId || !snapshot.id || refreshing || pending.current || saving.current || document.hidden) return
            refreshing = true
            try {
                const { data } = await api.revision(manageId, controller.signal)
                if (data.revision === snapshot.revision || latest.current !== snapshot || controller.signal.aborted) return
                const result = await api.get(manageId, controller.signal)
                if (!pending.current && !saving.current && latest.current === snapshot && !controller.signal.aborted) {
                    latest.current = result.data
                    setShop(result.data)
                }
            } catch {
                // The next refresh will retry without interrupting product editing.
            } finally {
                refreshing = false
            }
        }
        void refresh()
        const interval = window.setInterval(() => void refresh(), 4000)
        const onFocus = () => void refresh()
        window.addEventListener("focus", onFocus)
        return () => {
            controller.abort()
            window.clearInterval(interval)
            window.removeEventListener("focus", onFocus)
        }
    }, [api, manageId, watchInventory, busy, uploading])

    function update(value: Partial<Shop>) {
        latest.current = { ...latest.current, ...value }
        setShop(latest.current)
    }

    function flush(): Promise<void> {
        window.clearTimeout(timer.current)
        if (saving.current) return saving.current
        if (!pending.current) return Promise.resolve()
        const run = async () => {
            while (pending.current) {
                pending.current = false
                const snapshot = latest.current
                setSaveState("pending")
                try {
                    const { data } = await (editorOnly ? api.saveEditor(snapshot)
                        : manageId ? api.saveProducts(snapshot)
                        : snapshot.setupStep === 2 ? api.saveEditor(snapshot)
                        : api.save(snapshot, snapshot.setupStep))
                    update({ revision: data.revision })
                } catch (error) {
                    pending.current = true
                    setSaveState("failed")
                    throw error
                }
            }
            setSaveState("saved")
        }
        saving.current = run().finally(() => { saving.current = null })
        return saving.current
    }

    function report(error: unknown) { setError(errorMessage(error)) }

    async function retrySave() {
        try {
            await flush()
            setError("")
            return true
        } catch (error) {
            report(error)
            return false
        }
    }

    function schedule(value: Partial<Shop>) {
        setPublished(false)
        update(value)
        pending.current = true
        setSaveState("pending")
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => void retrySave(), 400)
    }

    function withProducts(products: Product[]) {
        const keys = new Set(products.map(product => product.key))
        return {
            products,
            blocks: latest.current.blocks?.map(block => ({
                ...block, productKeys: block.productKeys.filter(key => keys.has(key)),
            })) ?? null,
        }
    }

    async function move(target: number) {
        if (busy || uploading) return
        setBusy(true)
        setError("")
        try {
            if (!latest.current.id) {
                const storageKey = "create-shop-request"
                const key = sessionStorage.getItem(storageKey) ?? crypto.randomUUID()
                sessionStorage.setItem(storageKey, key)
                const { data } = await api.create(key, latest.current)
                update(data)
                loadedId.current = String(data.id)
                setParams({ draft: String(data.id) }, { replace: true })
                sessionStorage.removeItem(storageKey)
                setStep(data.status === "ACTIVE" ? 5 : data.setupStep)
                return
            }

            if (step === 3 && target === 4) {
                const origin = latest.current.origin.trim()
                const cities = latest.current.destinationCities.map(city => city.trim()).filter(Boolean)
                const destinationCities = cities.filter((city, index) =>
                    cities.findIndex(value => value.toLowerCase() === city.toLowerCase()) === index)
                if (!origin || !destinationCities.length)
                    throw new Error("Укажите город отправления и хотя бы один город назначения.")
                update({ origin, destinationCities })
            }

            await flush()
            if (target === 5 || (step === 2 && target === 3)) validateContacts()
            if (target === 5) {
                if (!completionReady.current) {
                    const { data } = await api.save(latest.current, step)
                    update({ revision: data.revision })
                    completionReady.current = true
                }
                await api.complete(latest.current)
                update({ status: "ACTIVE" })
            } else {
                completionReady.current = false
                const products = step === 1 && target > step && commitProduct.current
                    ? withProducts(commitProduct.current())
                    : undefined
                const next = { ...latest.current, ...products }
                if (target === 2 && !next.blocks) next.blocks = initialBlocks(next)
                const { data } = await api.save(next, target)
                update({ ...next, revision: data.revision, setupStep: target })
            }
            setStep(target)
        } catch (error) {
            report(error)
        } finally {
            setBusy(false)
        }
    }

    function validateContacts() {
        for (const block of latest.current.blocks ?? []) {
            if (block.kind !== "contacts") continue
            const invalid = contactFields.find(field => {
                const value = block[field.key]?.trim()
                return value && !contactHref(field, value)
            })
            if (invalid) throw new Error(`Проверьте поле «${invalid.label}» в блоке «${block.title || "Контакты"}».`)
        }
    }

    async function removeShop() {
        if (busy || uploading || !latest.current.id) return false
        setBusy(true)
        window.clearTimeout(timer.current)
        try {
            await saving.current?.catch(() => undefined)
            await api.remove(latest.current.id)
            pending.current = false
            return true
        } catch (error) {
            if (pending.current) setSaveState("failed")
            report(error)
            return false
        } finally {
            setBusy(false)
        }
    }

    async function publish() {
        if (busy || uploading) return
        setBusy(true)
        setPublished(false)
        try {
            await flush()
            validateContacts()
            const { data } = await api.publish(latest.current)
            update({ revision: data.revision })
            setError("")
            setPublished(true)
        } catch (error) {
            report(error)
        } finally {
            setBusy(false)
        }
    }

    async function applyTemplate(sourceId: number) {
        if (busy || uploading) return
        if (sourceId === 0) {
            schedule({ blocks: initialBlocks(latest.current) })
            return
        }
        setBusy(true)
        setError("")
        try {
            await flush()
            const { data } = await api.applyTemplate(latest.current, sourceId)
            update({ blocks: data.blocks, revision: data.revision })
            setPublished(false)
            setSaveState("saved")
        } catch (error) {
            report(error)
        } finally {
            setBusy(false)
        }
    }

    async function saveSettings(settings: ShopSettings) {
        if (busy || uploading || !latest.current.id) return false
        setBusy(true)
        setError("")
        try {
            await flush()
            const { id, revision } = latest.current
            const { data } = await api.saveSettings(id, revision, settings)
            update({ ...data, logo: settings.logo, logoPhotoId: settings.logoPhotoId })
            setPublished(false)
            setSaveState("saved")
            return true
        } catch (error) {
            report(error)
            return false
        } finally {
            setBusy(false)
        }
    }

    async function createCategory(name: string) {
        const { data } = await api.createCategory(latest.current.id, name)
        update({ categories: [...latest.current.categories, data] })
        return data
    }

    function patchBlock(id: string, value: Partial<Block>) {
        const blocks = latest.current.blocks
        if (blocks?.some(block => block.id === id)) {
            schedule({ blocks: blocks.map(block => block.id === id ? { ...block, ...value } : block) })
        }
    }

    async function upload(file: File) {
        setUploading(true)
        try {
            return (await api.upload(latest.current.id, file)).data
        } finally {
            setUploading(false)
        }
    }

    return {
        shop, step, busy, uploading, error, loadError, saveState, published, move, report, upload, retrySave, schedule,
        publish, createCategory, patchBlock, removeShop, saveSettings, applyTemplate,
        templates: api.templates,
        loading: !!id && id !== String(shop.id) && !loadError,
        updateFields: (value: Partial<Shop>) => { completionReady.current = false; update(value) },
        changeProducts: (products: Product[]) => schedule(withProducts(products)),
        registerProduct: (commit: (() => Product[]) | null) => { commitProduct.current = commit },
    }
}
