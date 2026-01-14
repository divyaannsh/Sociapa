import PageTemplate from '../../../components/PageTemplate'

export default function SettingsSEO() {
  return (
    <PageTemplate 
      title="Settings SEO" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'SEO', path: '/settings/seo' }
      ]} 
    />
  )
}

