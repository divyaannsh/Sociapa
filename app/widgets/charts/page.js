import PageTemplate from '../../../components/PageTemplate'

export default function WidgetsCharts() {
  return (
    <PageTemplate 
      title="Widgets Charts" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Widgets', path: '/widgets' },
        { label: 'Charts', path: '/widgets/charts' }
      ]} 
    />
  )
}

