import PageTemplate from '../../../components/PageTemplate'

export default function CustomersCreate() {
  return (
    <PageTemplate 
      title="Customers Create" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Customers', path: '/customers' },
        { label: 'Create', path: '/customers/create' }
      ]} 
    />
  )
}

