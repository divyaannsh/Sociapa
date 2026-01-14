import PageTemplate from '../../../components/PageTemplate'

export default function AppsChat() {
  return (
    <PageTemplate 
      title="Apps Chat" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Apps', path: '/apps' },
        { label: 'Chat', path: '/apps/chat' }
      ]} 
    />
  )
}

