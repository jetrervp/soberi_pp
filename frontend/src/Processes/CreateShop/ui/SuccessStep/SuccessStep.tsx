import styles from "../CreateShop/CreateShop.module.scss"
import { Link } from "react-router-dom"

export default function SuccessStep({ name }: { name: string }) {
    return <section>
        <h1>Магазин создан!</h1>
        <p>«{name}» появился в разделе интернет-магазинов.</p>
        <div className={styles.actions}>
        <Link className={`${styles.buttonLink} ${styles.secondary}`} to="/Dashboard/myshops">К моим магазинам</Link></div>
    </section>
}
