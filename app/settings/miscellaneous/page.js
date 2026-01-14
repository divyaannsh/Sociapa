import PageTemplate from '../../../components/PageTemplate'

export default function SettingsMiscellaneous() {
  return (
    <PageTemplate 
      title="Settings Miscellaneous" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Miscellaneous', path: '/settings/miscellaneous' }
      ]} 
    />
  )
}

