import { Input } from "../../../../widgets/UI"
import type { Shop } from "../../model/CreateShopTypes"
import styles from "./DeliveryStep.module.scss"

export default function DeliveryStep({ shop, update }: { shop: Shop; update: (value: Partial<Shop>) => void }) {
    const cities = shop.destinationCities.length ? shop.destinationCities : [""]

    return <section className={styles.delivery}>
        <h1>Доставка</h1>
        <label>Город отправления
            <Input required maxLength={100} placeholder="Например, Екатеринбург" value={shop.origin}
                onChange={origin => update({ origin })} />
        </label>
        <fieldset className={styles.destinations}>
            <legend>Города назначения</legend>
            {cities.map((city, index) => <div className={styles.city} key={index}>
                <label>Город назначения {index + 1}
                    <Input maxLength={500} value={city} placeholder="Введите город"
                        onChange={value => update({ destinationCities: cities.map((item, position) => position === index ? value : item) })} />
                </label>
                {cities.length > 1 && <button type="button" aria-label={`Убрать город назначения ${index + 1}`}
                    onClick={() => update({ destinationCities: cities.filter((_, position) => position !== index) })}>Убрать</button>}
            </div>)}
            {cities.length < 50 && <button type="button" disabled={!cities.at(-1)?.trim()}
                onClick={() => update({ destinationCities: [...cities, ""] })}>Добавить город</button>}
        </fieldset>
    </section>
}
