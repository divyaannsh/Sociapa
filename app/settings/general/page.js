import PageTemplate from '../../../components/PageTemplate'

export default function SettingsGeneral() {
  return (
    <PageTemplate 
      title="Settings General" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'General', path: '/settings/general' }
      ]} 
    />
  )
}

