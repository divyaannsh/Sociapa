import PageTemplate from '../../../components/PageTemplate'

export default function AppsEmail() {
  return (
    <PageTemplate 
      title="Apps Email" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Apps', path: '/apps' },
        { label: 'Email', path: '/apps/email' }
      ]} 
    />
  )
}

