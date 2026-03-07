/**
 * Company filtering — pure function, no data imports.
 */

export function filterCompanies(
  companies,
  { search = '', stage = 'all', region = 'all', sector = 'all', sortBy = 'irs' }
) {
  let filtered = companies;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.sector || []).some((s) => s.toLowerCase().includes(q))
    );
  }

  if (stage !== 'all') {
    const stageMap = {
      seed: ['pre_seed', 'seed'],
      early: ['series_a', 'series_b'],
      growth: ['series_c_plus', 'growth'],
    };
    const stages = stageMap[stage] || [stage];
    filtered = filtered.filter((c) => stages.includes(c.stage));
  }

  if (region !== 'all') {
    filtered = filtered.filter((c) => c.region === region);
  }

  if (sector !== 'all') {
    filtered = filtered.filter((c) => (c.sector || []).includes(sector));
  }

  const sortFns = {
    momentum: (a, b) => (b.momentum || 0) - (a.momentum || 0),
    funding: (a, b) => (b.funding || 0) - (a.funding || 0),
    name: (a, b) => a.name.localeCompare(b.name),
    irs: (a, b) => (b.irs || 0) - (a.irs || 0),
  };

  return [...filtered].sort(sortFns[sortBy] || sortFns.irs);
}
