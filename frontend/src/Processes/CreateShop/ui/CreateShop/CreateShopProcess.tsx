import { useId, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import ConfirmDialog from "../../../../widgets/UI/ConfirmDialog"
import { useCreateShop } from "../../actions/CreateShopActions"
import { initialBlocks } from "../../model/CreateShopModel"
import ShopSettingsPanel from "../DetailsStep/ShopSettingsPanel"
import DetailsStep from "../DetailsStep/DetailsStep"
import ProductsStep from "../ProductsStep/ProductsStep"
import TemplatePicker from "../StorefrontStep/TemplatePicker"
import StorefrontStep from "../StorefrontStep/StorefrontStep"
import DeliveryStep from "../DeliveryStep/DeliveryStep"
import PaymentStep from "../PaymentStep/PaymentStep"
import SuccessStep from "../SuccessStep/SuccessStep"
import styles from "./CreateShop.module.scss"

const shopsPath = "/Dashboard/myshops"
const tabs = { settings: "Настройки магазина", products: "Добавление товара", storefront: "Редактирование витрины" }
type ManageTab = keyof typeof tabs

export default function CreateShopProcess({ editorOnly = false, manageId }: { editorOnly?: boolean; manageId?: string }) {
    const [tab, setTab] = useState<ManageTab>("settings")
    const [switching, setSwitching] = useState(false)
    const [confirmShopRemoval, setConfirmShopRemoval] = useState(false)
    const tabId = useId()
    const editingStorefront = editorOnly || (!!manageId && tab === "storefront")
    const draft = useCreateShop(editingStorefront, manageId, tab === "products")
    const { shop, step } = draft
    const navigate = useNavigate()
    const managePath = `${shopsPath}/${shop.id}`
    const fullWidth = !!manageId || editingStorefront || step === 2

    const saveStatus = <div className={styles.status} aria-live="polite">
        {draft.saveState === "pending" && "Сохраняем…"}
        {draft.published ? "Витрина опубликована" : draft.saveState === "saved" &&
            (editingStorefront || step === 2 ? "Черновик сохранён" : "Сохранено")}
        {draft.saveState === "failed" && <button type="button" onClick={() => void draft.retrySave()}>
            Повторить сохранение
        </button>}
        {draft.error && <p role="alert">{draft.error}</p>}
    </div>

    const editor = <StorefrontStep name={shop.name} logo={shop.logo} blocks={shop.blocks ?? []} products={shop.products} categories={shop.categories}
        status={saveStatus} onChange={blocks => draft.schedule({ blocks })}
        upload={draft.upload} onPatch={draft.patchBlock} onError={draft.report} />

    async function switchTab(next: ManageTab) {
        if (next === tab || switching || draft.busy || draft.uploading) return
        setSwitching(true)
        try {
            if (await draft.retrySave()) setTab(next)
        } finally {
            setSwitching(false)
        }
    }

    const storefrontPanel = shop.blocks === null ? <div className={styles.notice}>
        <button type="button" onClick={() => draft.schedule({ blocks: initialBlocks(shop) })}>Создать витрину</button>
        {saveStatus}
    </div> : <>
        {editor}
        <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={() => void draft.retrySave()}>Сохранить черновик</button>
            {shop.status === "ACTIVE" &&
                <button type="button" onClick={() => void draft.publish()}>Опубликовать витрину</button>}
        </div>
    </>

    return <main className={styles.page}>
        <div className={`${styles.wizard} ${fullWidth ? styles.fullWidth : ""}`}>
            {draft.loading ? <p className={styles.notice} role="status">Загружаем магазин…</p>
            : draft.loadError ? <p className={styles.notice} role="alert">{draft.loadError}</p>
            : manageId ? <>
                <div className={styles.notice}>
                    <Link to={shopsPath}>К моим магазинам</Link>
                    <h1>{shop.name}</h1>
                    <p>{shop.description}</p>
                </div>
                {shop.status === "ACTIVE" ? <>
                    <div className={styles.manageToolbar}>
                        <div className={styles.tabs} role="group" aria-label="Разделы управления магазином">
                            {(Object.keys(tabs) as ManageTab[]).map(key => <button type="button" key={key}
                                aria-pressed={tab === key} aria-controls={`${tabId}-${key}`}
                                disabled={switching || draft.busy || draft.uploading}
                                onClick={() => void switchTab(key)}>{tabs[key]}</button>)}
                        </div>
                        <Link className={`${styles.buttonLink} ${styles.secondary}`} to={`/store/${encodeURIComponent(shop.slug)}`}>
                            Открыть публичную витрину
                        </Link>
                    </div>
                    <fieldset id={`${tabId}-products`} className={`${styles.fields} ${styles.productPanel}`} hidden={tab !== "products"}
                        disabled={switching || draft.uploading || draft.busy || tab !== "products"}>
                        <ProductsStep inventory products={shop.products} categories={shop.categories} onCreateCategory={draft.createCategory}
                            register={draft.registerProduct}
                            onChange={draft.changeProducts} upload={draft.upload} onError={draft.report} />
                    </fieldset>
                    <fieldset id={`${tabId}-storefront`} className={styles.fields} hidden={tab !== "storefront"}
                        disabled={switching || draft.uploading || draft.busy || tab !== "storefront"}>
                        {storefrontPanel}
                    </fieldset>
                    <fieldset id={`${tabId}-settings`} className={`${styles.fields} ${styles.productPanel}`} hidden={tab !== "settings"}
                        disabled={switching || draft.uploading || draft.busy || tab !== "settings"}>
                        <ShopSettingsPanel shop={shop} save={draft.saveSettings} />
                    </fieldset>
                </> : shop.status === "DRAFT" ?
                    <Link to={`/createShop?draft=${shop.id}`}>Продолжить создание</Link> :
                    <p className={styles.notice}>Управление товарами доступно после публикации магазина.</p>}
                <div className={styles.actions}>
                    <button type="button" className={styles.danger} disabled={switching || draft.busy || draft.uploading}
                        onClick={() => setConfirmShopRemoval(true)}>Удалить магазин</button>
                    {confirmShopRemoval && <ConfirmDialog title="Удалить магазин?"
                        message={`Магазин «${shop.name}» будет удалён вместе с товарами и витриной.`}
                        confirmLabel="Удалить" danger onCancel={() => setConfirmShopRemoval(false)} onConfirm={async () => {
                            setConfirmShopRemoval(false)
                            if (await draft.removeShop()) navigate(shopsPath, { replace: true })
                        }} />}
                </div>
                {(tab !== "storefront" || shop.status !== "ACTIVE") && saveStatus}
            </>
            : editorOnly ? <fieldset className={styles.fields} disabled={draft.uploading || draft.busy}>
                {!shop.id ? <p className={styles.notice}>Выберите магазин в CRM</p>
                    : storefrontPanel}
                <div className={styles.actions}>
                    <button type="button" className={styles.secondary} onClick={async () => {
                        if (await draft.retrySave()) navigate(shop.id ? managePath : shopsPath)
                    }}>К управлению магазином</button>
                </div>
            </fieldset>
            : step === 5 ? <div className={styles.stepTransition}><SuccessStep name={shop.name} /></div>
            : <form key={step} className={styles.stepTransition} onSubmit={event => {
                event.preventDefault()
                void draft.move(step + 1)
            }}>
                <p className={styles.progress}>Шаг {step + 1} из 6</p>
                <fieldset className={styles.fields} disabled={draft.busy || draft.uploading}>
                    {step === 0 && <DetailsStep shop={shop} update={draft.updateFields} />}
                    {step === 1 && <ProductsStep products={shop.products} categories={shop.categories} onCreateCategory={draft.createCategory}
                        register={draft.registerProduct}
                        onChange={draft.changeProducts} upload={draft.upload} onError={draft.report} />}
                    {step === 2 && <>
                        <TemplatePicker shopId={shop.id} hasBlocks={Boolean(shop.blocks?.length)}
                            load={draft.templates} apply={draft.applyTemplate} />
                        {editor}
                    </>}
                    {step === 3 && <DeliveryStep shop={shop} update={draft.updateFields} />}
                    {step === 4 && <PaymentStep shop={shop} update={draft.updateFields} />}
                    <div className={styles.actions}>
                        {step ? <button type="button" className={styles.secondary}
                            onClick={() => void draft.move(step - 1)}>Назад</button>
                            : <Link className={`${styles.buttonLink} ${styles.secondary}`} to={shopsPath}>Назад</Link>}
                        <button type="submit">{step === 4 ? "Создать магазин" : "Далее"}</button>
                    </div>
                </fieldset>
                {step !== 2 && saveStatus}
            </form>}
        </div>
    </main>
}
