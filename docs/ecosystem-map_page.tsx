// app/ecosystem-map/page.tsx
// Battle Born Intelligence — Ecosystem Map page

import ResourceMatrix from '@/components/ResourceMatrix';

export const metadata = {
  title: 'Ecosystem Map | Battle Born Intelligence',
  description: 'Nevada Innovation Resource Matrix — 67 organizations mapped by Kauffman SME/IDE track and ICP stage score',
};

export default function EcosystemMapPage() {
  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <ResourceMatrix />
    </div>
  );
}
