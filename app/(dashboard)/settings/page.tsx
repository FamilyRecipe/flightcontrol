import { PageHeader } from '@/components/templates/layout/PageHeader'
import { SettingsPage as SettingsPageComponent } from '@/components/settings/SettingsPage'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your API keys, integrations, and preferences"
      />
      <SettingsPageComponent />
    </div>
  )
}

