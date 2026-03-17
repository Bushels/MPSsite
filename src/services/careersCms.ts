type CareersEnv = ImportMetaEnv & {
  VITE_CAREERS_API_BASE_URL?: string;
  VITE_CAREERS_JOBS_PATH?: string;
  VITE_CAREERS_APPLY_PATH?: string;
  VITE_CAREERS_TALENT_PATH?: string;
};

const env = import.meta.env as CareersEnv;

const CAREERS_API_BASE_URL = env.VITE_CAREERS_API_BASE_URL?.trim() ?? '';
const CAREERS_JOBS_PATH = env.VITE_CAREERS_JOBS_PATH?.trim() || '/jobs';
const CAREERS_APPLY_PATH = env.VITE_CAREERS_APPLY_PATH?.trim() || '/applications';
const CAREERS_TALENT_PATH = env.VITE_CAREERS_TALENT_PATH?.trim() || '/talent-pool';

export interface CareerOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  schedule: string;
  compensation: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  tags: string[];
}

interface ApplicantBase {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cell?: string;
  address: string;
  city: string;
  province: string;
  postal: string;
  message: string;
  resume: File | null;
}

export interface CareerApplicationInput extends ApplicantBase {
  applicationType: string;
  positionId: string;
  positionTitle: string;
}

export interface TalentPoolInput extends ApplicantBase {
  applicationType: string;
  careerFocus: string;
}

export const fallbackCareerOpenings: CareerOpening[] = [
  {
    id: 'welder-3rd-year',
    title: 'Welder (3rd Year / Journeyperson)',
    department: 'Fabrication',
    location: 'Pierceland, SK',
    employmentType: 'Full-time',
    schedule: 'Shop + field support',
    compensation: 'Premium pay + benefits',
    summary: 'Build and repair critical oil and gas infrastructure with a crew that values craft, pace, and safety.',
    description:
      'You will work across high-spec fabrication, structural packages, and production-critical repairs. The role suits someone who wants consistent shop work with enough field exposure to stay sharp.',
    responsibilities: [
      'Interpret drawings, welding procedures, and build packages accurately.',
      'Execute fit-up, weld, and finishing work to MPS quality expectations.',
      'Support field repairs and shutdown work when project demand requires it.',
    ],
    requirements: [
      '3rd-year apprentice or journeyperson welding experience.',
      'Strong attention to fabrication quality, safety, and production flow.',
      'Comfort working in a team-first environment with tight delivery timelines.',
    ],
    tags: ['CWB mindset', 'Oil & gas', 'Production pace'],
  },
  {
    id: 'pipefitter-fabricator',
    title: 'Pipefitter / Fabrication Technician',
    department: 'Surface Facilities',
    location: 'Pierceland, SK',
    employmentType: 'Full-time',
    schedule: 'Day shift',
    compensation: 'Competitive overtime opportunities',
    summary: 'Own spool, skid, and tie-in packages that move directly into Western Canada field installations.',
    description:
      'This role blends hands-on precision with practical field understanding. You will help build systems that need to fit right the first time and still hold up in real operating conditions.',
    responsibilities: [
      'Fabricate and assemble piping systems, manifolds, and modular packages.',
      'Coordinate with welders and machining support to keep jobs moving cleanly.',
      'Flag constructability issues early and maintain a disciplined work area.',
    ],
    requirements: [
      'Experience with industrial pipe systems or relevant apprenticeship training.',
      'Ability to read isometrics and fabrication drawings.',
      'Reliable execution in a safety-driven production environment.',
    ],
    tags: ['Pipe systems', 'Constructability', 'Shop execution'],
  },
  {
    id: 'field-service-technician',
    title: 'Field Service Technician',
    department: 'Field Operations',
    location: 'Western Canada',
    employmentType: 'Full-time',
    schedule: 'Rotation / travel as required',
    compensation: 'Travel support + field premiums',
    summary: 'Represent MPS on-site for installs, service work, and operational support across demanding facilities.',
    description:
      'You will move between customers, crews, and projects with a calm, capable presence. The ideal candidate is mechanically strong, safety focused, and comfortable working directly with live operating needs.',
    responsibilities: [
      'Support field installs, troubleshooting, maintenance, and urgent service calls.',
      'Document site conditions clearly and communicate next actions to operations.',
      'Maintain customer confidence through dependable, practical execution.',
    ],
    requirements: [
      'Industrial field experience in oil and gas, fabrication support, or maintenance.',
      'Strong communication and problem-solving under active site conditions.',
      'Valid driver’s licence and willingness to travel when required.',
    ],
    tags: ['Travel', 'Customer-facing', 'Operational support'],
  },
];

export const isCareersIntegrationConfigured = () => Boolean(CAREERS_API_BASE_URL);

const buildUrl = (path: string) => {
  const base = CAREERS_API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: string; error?: string }).message
        || (payload as { message?: string; error?: string }).error;
      if (message) return message;
    }
  }

  const text = await response.text().catch(() => '');
  return text || `Request failed with status ${response.status}`;
};

const normalizeCareerOpening = (job: Record<string, unknown>, index: number): CareerOpening => ({
  id: String(job.id ?? job.slug ?? job.title ?? `role-${index}`),
  title: String(job.title ?? 'Untitled role'),
  department: String(job.department ?? job.category ?? 'General'),
  location: String(job.location ?? 'Western Canada'),
  employmentType: String(job.employmentType ?? job.type ?? 'Full-time'),
  schedule: String(job.schedule ?? 'Project based'),
  compensation: String(job.compensation ?? 'Competitive compensation'),
  summary: String(job.summary ?? job.shortDescription ?? 'Details available upon application.'),
  description: String(job.description ?? job.summary ?? 'Details available upon application.'),
  responsibilities: Array.isArray(job.responsibilities)
    ? job.responsibilities.map((item) => String(item))
    : [],
  requirements: Array.isArray(job.requirements)
    ? job.requirements.map((item) => String(item))
    : [],
  tags: Array.isArray(job.tags)
    ? job.tags.map((item) => String(item))
    : [],
});

export const listCareerOpenings = async (signal?: AbortSignal): Promise<CareerOpening[]> => {
  if (!isCareersIntegrationConfigured()) {
    return fallbackCareerOpenings;
  }

  const response = await fetch(buildUrl(CAREERS_JOBS_PATH), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const payload = await response.json();
  const jobs = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { jobs?: unknown[] }).jobs)
      ? (payload as { jobs: unknown[] }).jobs
      : [];

  return jobs.map((job, index) => normalizeCareerOpening(job as Record<string, unknown>, index));
};

const appendSharedFields = (
  formData: FormData,
  input: CareerApplicationInput | TalentPoolInput,
) => {
  formData.append('firstName', input.firstName);
  formData.append('lastName', input.lastName);
  formData.append('email', input.email);
  formData.append('phone', input.phone);
  formData.append('cell', input.cell || '');
  formData.append('address', input.address);
  formData.append('city', input.city);
  formData.append('province', input.province);
  formData.append('postal', input.postal);
  formData.append('message', input.message);
  formData.append('applicationType', input.applicationType);

  if (input.resume) {
    formData.append('resume', input.resume);
  }
};

export const submitCareerApplication = async (input: CareerApplicationInput) => {
  if (!isCareersIntegrationConfigured()) {
    throw new Error(
      'The careers backend proxy is not configured yet. Wire the secure CMS bridge before enabling live applications.',
    );
  }

  const formData = new FormData();
  appendSharedFields(formData, input);
  formData.append('positionId', input.positionId);
  formData.append('positionTitle', input.positionTitle);

  const response = await fetch(buildUrl(CAREERS_APPLY_PATH), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
};

export const submitTalentPoolInterest = async (input: TalentPoolInput) => {
  if (!isCareersIntegrationConfigured()) {
    throw new Error(
      'The careers backend proxy is not configured yet. Wire the secure CMS bridge before enabling live resume intake.',
    );
  }

  const formData = new FormData();
  appendSharedFields(formData, input);
  formData.append('careerFocus', input.careerFocus);

  const response = await fetch(buildUrl(CAREERS_TALENT_PATH), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
};
