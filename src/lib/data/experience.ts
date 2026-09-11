import type { Experience } from '$lib/types/content';

export const experience: Experience[] = [
  {
    id: 'exp-0',
    role: 'Gesellschafter und Softwareentwickler',
    company: 'S&B Digital UG',
    companyUrl: 'https://sb-digital.de',
    startDate: '2026',
    endDate: undefined,
    description:
      'Als Mitgründer der S&B Digital UG entwickle ich unsere modulare Gastro-Management-Plattform, die Online-Bestellung, Tischservice und Lieferung in einem gemeinsamen System zusammenführt – mit White-Label-Fähigkeit, kundeneigenen Domains und wählbarer Selbsthosting-Infrastruktur.',
    tags: ['Svelte', 'GMP', 'Product Owner']
  },
  {
    id: 'exp-1',
    role: 'Geschäftsführer und Softwareentwickler',
    company: 'Meta Menü',
    companyUrl: 'https://meta-menue.de',
    startDate: '2026-01',
    endDate: undefined,
    description:
      'Entwicklungs-, Design- und Gründererfahrung durch den Aufbau der Plattform meta-menue, die als Vermittler zwischen Distributoren und Großküchen dient.',
    tags: ['SvelteKit', 'PostgreSQL', 'DevOps', 'Projektmanagement']
  },
  {
    id: 'exp-2',
    role: 'Geschäftsführer und Softwareentwickler',
    company: 'LogiQ IT',
    companyUrl: 'https://logiqit.de',
    startDate: '2022-06',
    endDate: undefined,
    description:
      'Gründungserfahrung sowie praxisnahe Systemadministration und Entwicklung durch die Zusammenarbeit mit Kunden an deren digitalen Produkten und Webseiten.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'DevOps', 'Leadership']
  },
  {
    id: 'exp-3',
    role: 'Werkstudent Full-Stack Developer',
    company: 'NetTrek GmbH',
    companyUrl: 'https://nettrek.de',
    startDate: '2025-01',
    endDate: '2026-01',
    description:
      'Als Softwareentwickler habe ich bei NetTrek unterschiedliche Systeme mitentwickelt, darunter KI-RAG-Plattformen als unternehmensweites Wissenssystem und Knowledge Hubs für die Europäische Kommission.',
    tags: ['Next.js', 'Angular.js', 'PostgreSQL', 'n8n', 'RAG']
  }
];
