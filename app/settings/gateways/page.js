import PageTemplate from '../../../components/PageTemplate'

export default function SettingsGateways() {
  return (
    <PageTemplate 
      title="Settings Gateways" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Gateways', path: '/settings/gateways' }
      ]} 
    />
  )
}

