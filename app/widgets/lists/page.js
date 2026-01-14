import PageTemplate from '../../../components/PageTemplate'

export default function WidgetsLists() {
  return (
    <PageTemplate 
      title="Widgets Lists" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Widgets', path: '/widgets' },
        { label: 'Lists', path: '/widgets/lists' }
      ]} 
    />
  )
}

