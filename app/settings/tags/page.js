import PageTemplate from '../../../components/PageTemplate'

export default function SettingsTags() {
  return (
    <PageTemplate 
      title="Settings Tags" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Tags', path: '/settings/tags' }
      ]} 
    />
  )
}

