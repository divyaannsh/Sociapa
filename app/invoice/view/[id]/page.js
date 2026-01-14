import PageTemplate from '../../../../components/PageTemplate'

export default function InvoiceView({ params }) {
  return (
    <PageTemplate 
      title={`Invoice View - ${params.id}`}
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Invoice', path: '/invoice' },
        { label: 'View', path: `/invoice/view/${params.id}` }
      ]} 
    />
  )
}

