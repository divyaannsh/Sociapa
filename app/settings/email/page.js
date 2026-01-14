import PageTemplate from '../../../components/PageTemplate'

export default function SettingsEmail() {
  return (
    <PageTemplate 
      title="Settings Email" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Email', path: '/settings/email' }
      ]} 
    />
  )
}

