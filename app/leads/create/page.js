import PageTemplate from '../../../components/PageTemplate'

export default function LeadsCreate() {
  return (
    <PageTemplate 
      title="Leads Create" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Leads', path: '/leads' },
        { label: 'Create', path: '/leads/create' }
      ]} 
    />
  )
}

