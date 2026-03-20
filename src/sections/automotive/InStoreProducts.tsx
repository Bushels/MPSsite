import { LiteCard } from '../../components/LiteCard';
import { productShowcase, storeBrandHighlights } from '../../data/automotive';
import styles from './InStoreProducts.module.css';

export interface InStoreProductsProps {
  bookingHref: string;
}

export const InStoreProducts = ({ bookingHref }: Readonly<InStoreProductsProps>) => (
  <section
    id="products"
    className={styles.section}
    aria-labelledby="in-store-products-title"
  >
    <div className={styles.layout}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>In-store products</span>
        <h2 id="in-store-products-title" className={styles.title}>
          A shelf preview for the brands and pickup items customers already expect from the shop.
        </h2>
        <p className={styles.copy}>
          Keep booking first, then let customers see the oils, filters, DEF, wipers, and seasonal
          essentials they can grab when they come through Pierceland.
        </p>

        <div className={styles.brandCloud} aria-label="Example in-store brands">
          {storeBrandHighlights.map((brand) => (
            <span key={brand} className={styles.brandChip}>
              {brand}
            </span>
          ))}
        </div>

        <div className={styles.note}>
          Starter brand lineup shown for layout mockup. Swap these to your actual shelf brands
          before launch or before the Wix store goes live.
        </div>

        <a href={bookingHref} className={styles.primaryAction}>
          Book service first
        </a>
      </div>

      <div className={styles.grid}>
        {productShowcase.map((group) => (
          <LiteCard key={group.id} className={styles.card} glowColor="rgba(255, 142, 122, 0.26)">
            <span className={styles.cardLabel}>{group.availabilityLabel}</span>
            <h3>{group.title}</h3>
            <p className={styles.cardCopy}>{group.description}</p>

            <div className={styles.listBlock}>
              <span className={styles.listLabel}>Popular pickup items</span>
              <ul className={styles.list}>
                {group.products.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.brandRow}>
              {group.brands.map((brand) => (
                <span key={brand} className={styles.inlineBrand}>
                  {brand}
                </span>
              ))}
            </div>
          </LiteCard>
        ))}
      </div>
    </div>
  </section>
);
