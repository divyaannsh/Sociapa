import PageTemplate from '../../../components/PageTemplate'

export default function AppsNotes() {
  return (
    <PageTemplate 
      title="Apps Notes" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Apps', path: '/apps' },
        { label: 'Notes', path: '/apps/notes' }
      ]} 
    />
  )
}

