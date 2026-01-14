import PageTemplate from '../../../components/PageTemplate'

export default function SettingsLocalization() {
  return (
    <PageTemplate 
      title="Settings Localization" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Localization', path: '/settings/localization' }
      ]} 
    />
  )
}

