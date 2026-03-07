import { MainGrid } from '../layout/AppShell';
import { Card } from '../shared/Card';
import styles from './WeeklyBriefView.module.css';

export function WeeklyBriefView() {
  return (
    <MainGrid>
      <div className={styles.placeholder}>
        <Card>
          <div className={styles.content}>
            <h2 className={styles.title}>Weekly Intelligence Brief</h2>
            <p className={styles.subtitle}>
              Coming soon — this view will provide a weekly summary of ecosystem
              activity, funding events, and risk signals.
            </p>
          </div>
        </Card>
      </div>
    </MainGrid>
  );
}
