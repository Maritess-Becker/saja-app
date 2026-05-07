// Dev-only preview — delete before production
import { AppNav } from '@/components/layout/AppNav'
import { DiscoverClient } from '@/app/discover/DiscoverClient'
import { MOCK_LUKAS, MOCK_VIEWER } from '../_mockData'

export default function PreviewEntdecken() {
  return (
    <div className="min-h-screen bg-creme">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <DiscoverClient
          initialProfiles={[MOCK_LUKAS]}
          currentUserId={MOCK_VIEWER.user_id}
          isInConnection={false}
          tier="membership"
          viewerSexualityVisible={false}
          viewerProfile={MOCK_VIEWER}
          onboardingPhase={3}
          serendipityIds={[]}
          trialActive={true}
          trialDaysLeft={14}
          receivedLights={[]}
        />
      </main>
    </div>
  )
}
