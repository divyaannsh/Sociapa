import PageTemplate from '../../../components/PageTemplate'

export default function SettingsLeads() {
  return (
    <PageTemplate 
      title="Settings Leads" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Leads', path: '/settings/leads' }
      ]} 
    />
  )
}

