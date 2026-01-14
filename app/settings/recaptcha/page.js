import PageTemplate from '../../../components/PageTemplate'

export default function SettingsRecaptcha() {
  return (
    <PageTemplate 
      title="Settings Recaptcha" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Recaptcha', path: '/settings/recaptcha' }
      ]} 
    />
  )
}

