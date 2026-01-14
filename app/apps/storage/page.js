import PageTemplate from '../../../components/PageTemplate'

export default function AppsStorage() {
  return (
    <PageTemplate 
      title="Apps Storage" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Apps', path: '/apps' },
        { label: 'Storage', path: '/apps/storage' }
      ]} 
    />
  )
}

