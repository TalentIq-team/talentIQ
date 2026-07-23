// Lightweight client-side session helpers.
// The authenticated user id normally comes from the JWT; for this Member 3 slice we
// persist the active candidate profile id so the job-search and tracker pages can reuse it.

const PROFILE_KEY = 'talentiq.candidateProfileId'
const ORG_KEY = 'talentiq.organizationId'

export function getCandidateProfileId(): string | null {
  return localStorage.getItem(PROFILE_KEY)
}

export function setCandidateProfileId(id: string): void {
  localStorage.setItem(PROFILE_KEY, id)
}

export function clearCandidateProfileId(): void {
  localStorage.removeItem(PROFILE_KEY)
}

export function getOrganizationId(): string {
  let id = localStorage.getItem(ORG_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(ORG_KEY, id)
  }
  return id
}