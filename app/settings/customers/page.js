import PageTemplate from '../../../components/PageTemplate'

export default function SettingsCustomers() {
  return (
    <PageTemplate 
      title="Settings Customers" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Customers', path: '/settings/customers' }
      ]} 
    />
  )
}

