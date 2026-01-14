import PageTemplate from '../../../components/PageTemplate'

export default function AppsCalendar() {
  return (
    <PageTemplate 
      title="Apps Calendar" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Apps', path: '/apps' },
        { label: 'Calendar', path: '/apps/calendar' }
      ]} 
    />
  )
}

