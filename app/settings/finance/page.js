import PageTemplate from '../../../components/PageTemplate'

export default function SettingsFinance() {
  return (
    <PageTemplate 
      title="Settings Finance" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Finance', path: '/settings/finance' }
      ]} 
    />
  )
}

