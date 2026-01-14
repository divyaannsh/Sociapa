import PageTemplate from '../../../../components/PageTemplate'

export default function CustomersView({ params }) {
  return (
    <PageTemplate 
      title={`Customers View - ${params.id}`}
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Customers', path: '/customers' },
        { label: 'View', path: `/customers/view/${params.id}` }
      ]} 
    />
  )
}

