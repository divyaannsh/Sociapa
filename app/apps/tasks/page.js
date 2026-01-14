import PageTemplate from '../../../components/PageTemplate'

export default function AppsTasks() {
  return (
    <PageTemplate 
      title="Apps Tasks" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Apps', path: '/apps' },
        { label: 'Tasks', path: '/apps/tasks' }
      ]} 
    />
  )
}

