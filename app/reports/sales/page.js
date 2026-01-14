import PageTemplate from '../../../components/PageTemplate'

export default function ReportsSales() {
  return (
    <PageTemplate 
      title="Reports Sales" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Reports', path: '/reports' },
        { label: 'Sales', path: '/reports/sales' }
      ]} 
    />
  )
}

