import { FluidNav } from './components/FluidNav';
import { HeroUltimate } from './sections/HeroUltimate';
import { ClientStream } from './sections/ClientStream';
import { ServicesPrecision } from './sections/ServicesPrecision';
import { ElectromagneticStats } from './sections/ElectromagneticStats';
import { Certifications } from './sections/Certifications';
import { AboutMPS } from './sections/AboutMPS';
import { CareersForge } from './sections/CareersForge';
import { ContactBeacon } from './sections/ContactBeacon';
import { FilmGrain } from './components/FilmGrain';
import { CustomCursor } from './components/CustomCursor';
import { useLenis } from './hooks/useLenis';
import { useAdaptiveGlass } from './hooks/useAdaptiveGlass';
import styles from './App.module.css';

function App() {
  // Foundation systems
  useLenis();          // Buttery smooth scroll (desktop only)
  useAdaptiveGlass();  // Dynamic CSS variables driving all glass surfaces

  return (
    <CustomCursor>
      <div className={styles.container}>
        <FilmGrain />
        <FluidNav />
        <main>
          <HeroUltimate />
          <ClientStream />
          <ServicesPrecision />
          <ElectromagneticStats />
          <Certifications />
          <AboutMPS />
          <CareersForge />
          <ContactBeacon />
        </main>
      </div>
    </CustomCursor>
  );
}

export default App;
