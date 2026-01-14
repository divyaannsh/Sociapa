import PageTemplate from '../../components/PageTemplate'

export default function Proposal() {
  return (
    <PageTemplate 
      title="Proposal" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Proposal', path: '/proposal' }
      ]} 
    />
  )
}

