import PageTemplate from '../../components/PageTemplate'

export default function Payment() {
  return (
    <PageTemplate 
      title="Payment" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Payment', path: '/payment' }
      ]} 
    />
  )
}

