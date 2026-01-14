import PageTemplate from '../../../components/PageTemplate'

export default function InvoiceCreate() {
  return (
    <PageTemplate 
      title="Invoice Create" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Invoice', path: '/invoice' },
        { label: 'Create', path: '/invoice/create' }
      ]} 
    />
  )
}

