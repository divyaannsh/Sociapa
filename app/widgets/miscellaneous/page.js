import PageTemplate from '../../../components/PageTemplate'

export default function WidgetsMiscellaneous() {
  return (
    <PageTemplate 
      title="Widgets Miscellaneous" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Widgets', path: '/widgets' },
        { label: 'Miscellaneous', path: '/widgets/miscellaneous' }
      ]} 
    />
  )
}

