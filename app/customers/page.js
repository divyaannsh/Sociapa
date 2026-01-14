import PageTemplate from '../../components/PageTemplate'

export default function Customers() {
  return (
    <PageTemplate 
      title="Customers" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Customers', path: '/customers' }
      ]} 
    />
  )
}

