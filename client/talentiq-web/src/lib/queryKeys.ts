export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  candidate: {
    profile: (id?: string | null) => ['candidate', 'profile', id || 'current'] as const,
    applications: (profileId?: string | null) => ['candidate', 'applications', profileId || 'all'] as const,
  },
  jobs: {
    list: (filters?: Record<string, any>) => ['jobs', 'list', filters || {}] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    pipeline: (id: string) => ['jobs', 'pipeline', id] as const,
  },
  applications: {
    detail: (id: string) => ['applications', 'detail', id] as const,
  },
  interviews: {
    list: (jobId?: string) => ['interviews', 'list', jobId || 'all'] as const,
  },
  analytics: {
    kpis: ['analytics', 'kpis'] as const,
    funnel: ['analytics', 'funnel'] as const,
  },
  talentPool: {
    list: ['talentPool', 'list'] as const,
    reports: (entryId: string) => ['talentPool', 'reports', entryId] as const,
  },
} as const
