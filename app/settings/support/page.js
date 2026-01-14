import PageTemplate from '../../../components/PageTemplate'

export default function SettingsSupport() {
  return (
    <PageTemplate 
      title="Settings Support" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Support', path: '/settings/support' }
      ]} 
    />
  )
}

