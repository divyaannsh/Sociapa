import PageTemplate from '../../../components/PageTemplate'

export default function WidgetsStatistics() {
  return (
    <PageTemplate 
      title="Widgets Statistics" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Widgets', path: '/widgets' },
        { label: 'Statistics', path: '/widgets/statistics' }
      ]} 
    />
  )
}

