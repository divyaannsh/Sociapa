import PageTemplate from '../../../components/PageTemplate'

export default function ReportsLeads() {
  return (
    <PageTemplate 
      title="Reports Leads" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Reports', path: '/reports' },
        { label: 'Leads', path: '/reports/leads' }
      ]} 
    />
  )
}

