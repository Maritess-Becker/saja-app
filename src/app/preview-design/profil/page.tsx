// Dev-only preview — delete before production
import { AppNav } from '@/components/layout/AppNav'
import { ProfileSelfView } from '@/app/profile/ProfileSelfView'
import { MOCK_VIEWER } from '../_mockData'

export default function PreviewProfil() {
  return (
    <div className="min-h-screen bg-mondweiss">
      <AppNav />
      <main className="md:pl-64 pb-20 md:pb-0">
        <div className="max-w-lg mx-auto pb-32">
          <ProfileSelfView profile={MOCK_VIEWER} tier="membership" />
        </div>
      </main>
    </div>
  )
}
