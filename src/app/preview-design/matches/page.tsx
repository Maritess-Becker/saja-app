// Dev-only preview — delete before production
import { AppNav } from '@/components/layout/AppNav'
import { MatchesClient } from '@/app/matches/MatchesClient'
import { MOCK_THOMAS, MOCK_VIEWER } from '../_mockData'

export default function PreviewMatches() {
  const mockMatches = [
    {
      id: 'preview-match-thomas',
      user1_id: MOCK_VIEWER.user_id,
      user2_id: MOCK_THOMAS.user_id,
      status: 'matched' as const,
      created_at: new Date().toISOString(),
      other_profile: MOCK_THOMAS,
      connections: [],
    },
  ]

  return (
    <div className="min-h-screen bg-mondlicht">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <MatchesClient
          matches={mockMatches}
          currentUserId={MOCK_VIEWER.user_id}
          tier="membership"
        />
      </main>
    </div>
  )
}
