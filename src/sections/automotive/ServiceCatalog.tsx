import { LiteCard } from '../../components/LiteCard';
import { automotiveServices } from '../../data/automotive';
import { trackEvent } from '../../services/analytics';
import styles from './ServiceCatalog.module.css';

export interface ServiceCatalogProps {
  bookingHref: string;
  selectedServiceIds: readonly string[];
  onSelectService: (serviceId: string) => void;
}

export const ServiceCatalog = ({
  bookingHref,
  selectedServiceIds,
  onSelectService,
}: Readonly<ServiceCatalogProps>) => (
  <section id="services" className={styles.section} aria-labelledby="service-catalog-title">
    <div className={styles.header}>
      <span className={styles.eyebrow}>Service catalog</span>
      <h2 id="service-catalog-title" className={styles.title}>
        Choose the work and see the usual time and price range first.
      </h2>
      <p className={styles.copy}>
        Tap a card to prefill the booking flow, or browse the list like a shop menu before you
        decide what to book.
      </p>
    </div>

    <div className={styles.grid}>
      {automotiveServices.map((service) => {
        const isSelected = selectedServiceIds.includes(service.id);

        return (
          <button
            key={service.id}
            type="button"
            className={styles.cardButton}
            onClick={() => {
              onSelectService(service.id);
              trackEvent('auto_service_selected', {
                service: service.id,
                price: service.priceLabel,
                sgi: service.sgiRelated,
              });
            }}
            aria-pressed={isSelected}
          >
            <LiteCard className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}>
              <div className={styles.cardTop}>
                <span className={styles.serviceName}>{service.name}</span>
                {service.sgiRelated ? (
                  <span className={styles.sgiBadge}>SGI</span>
                ) : (
                  <span className={styles.duration}>{service.durationLabel}</span>
                )}
              </div>

              <p className={styles.description}>{service.description}</p>

              <div className={styles.cardBottom}>
                <div className={styles.priceBlock}>
                  <span className={styles.priceLabel}>Estimated range</span>
                  <strong className={styles.priceValue}>{service.priceLabel}</strong>
                </div>
                <div className={styles.ctaHint}>
                  <span>{isSelected ? 'Selected' : 'Select & book'}</span>
                  <span className={styles.arrow}>+</span>
                </div>
              </div>
            </LiteCard>
          </button>
        );
      })}
    </div>

    <a
      href={bookingHref}
      className={styles.catalogCta}
      onClick={() => trackEvent('auto_catalog_cta_click', {})}
    >
      Jump to the booking wizard
    </a>
  </section>
);
