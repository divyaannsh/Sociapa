import PageTemplate from '../../../components/PageTemplate'

export default function ReportsTimesheets() {
  return (
    <PageTemplate 
      title="Reports Timesheets" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Reports', path: '/reports' },
        { label: 'Timesheets', path: '/reports/timesheets' }
      ]} 
    />
  )
}

