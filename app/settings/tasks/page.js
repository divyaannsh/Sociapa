import PageTemplate from '../../../components/PageTemplate'

export default function SettingsTasks() {
  return (
    <PageTemplate 
      title="Settings Tasks" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Tasks', path: '/settings/tasks' }
      ]} 
    />
  )
}

