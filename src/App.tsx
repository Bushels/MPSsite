import { FluidNav } from './components/FluidNav';
import { HeroRevamped } from './sections/HeroRevamped';
import { ServicesShowcase } from './sections/ServicesShowcase';
import { ImpactStats } from './sections/ImpactStats';
import { AboutValues } from './sections/AboutValues';
import { ContactCTA } from './sections/ContactCTA';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.container}>
      <FluidNav />
      <main>
        <HeroRevamped />
        <ServicesShowcase />
        <ImpactStats />
        <AboutValues />
        <ContactCTA />
      </main>
    </div>
  );
}

export default App;
