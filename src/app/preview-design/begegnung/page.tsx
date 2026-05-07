// Dev-only preview — delete before production
import { AppNav } from '@/components/layout/AppNav'
import { BegegnungClient } from '@/app/begegnung/BegegnungClient'
import { MOCK_MICHAEL, MOCK_VIEWER } from '../_mockData'

export default function PreviewBegegnung() {
  const mockMatch = {
    id: 'preview-match-michael',
    user1_id: MOCK_VIEWER.user_id,
    user2_id: MOCK_MICHAEL.user_id,
  }

  const mockConnection = {
    id: 'preview-connection-michael',
    status: 'active',
    requested_by: MOCK_VIEWER.user_id,
    started_at: new Date().toISOString(),
  }

  return (
    <div className="bg-creme" style={{ height: '100dvh', overflow: 'hidden' }}>
      <AppNav />
      <main className="md:pl-64 h-full overflow-hidden">
        <BegegnungClient
          activeMatch={mockMatch}
          activeConnection={mockConnection}
          otherProfile={MOCK_MICHAEL}
          initialMessages={[]}
          currentUserId={MOCK_VIEWER.user_id}
          tier="membership"
        />
      </main>
    </div>
  )
}
