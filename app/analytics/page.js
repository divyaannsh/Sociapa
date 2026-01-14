import PageTemplate from '../../components/PageTemplate'

export default function Analytics() {
  return (
    <PageTemplate 
      title="Analytics" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Analytics', path: '/analytics' }
      ]} 
    />
  )
}

