import PageTemplate from '../../../components/PageTemplate'

export default function WidgetsTables() {
  return (
    <PageTemplate 
      title="Widgets Tables" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Widgets', path: '/widgets' },
        { label: 'Tables', path: '/widgets/tables' }
      ]} 
    />
  )
}

