import PageTemplate from '../../../../components/PageTemplate'

export default function LeadsView({ params }) {
  return (
    <PageTemplate 
      title={`Leads View - ${params.id}`}
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Leads', path: '/leads' },
        { label: 'View', path: `/leads/view/${params.id}` }
      ]} 
    />
  )
}

