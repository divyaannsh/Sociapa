import PageTemplate from '../../../components/PageTemplate'

export default function ProposalCreate() {
  return (
    <PageTemplate 
      title="Proposal Create" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Proposal', path: '/proposal' },
        { label: 'Create', path: '/proposal/create' }
      ]} 
    />
  )
}

