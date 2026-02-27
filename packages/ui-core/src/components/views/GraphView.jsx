import OntologyGraphView from '../graph/OntologyGraphView.jsx';

export default function GraphView({ viewProps }) {
  const { setSelectedCompany, data, allScored } = viewProps;

  const handleSelectCompany = (id) => {
    const company = data.companies.find(c => c.id === id);
    if (company) {
      const scored = allScored.find(c => c.id === id);
      setSelectedCompany(scored || company);
    }
  };

  return <OntologyGraphView onSelectCompany={handleSelectCompany} />;
}
