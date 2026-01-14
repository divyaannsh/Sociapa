import PageTemplate from '../../../components/PageTemplate'

export default function ReportsProject() {
  return (
    <PageTemplate 
      title="Reports Project" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Reports', path: '/reports' },
        { label: 'Project', path: '/reports/project' }
      ]} 
    />
  )
}

