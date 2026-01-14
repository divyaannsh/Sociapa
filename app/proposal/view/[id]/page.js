import PageTemplate from '../../../../components/PageTemplate'

export default function ProposalView({ params }) {
  return (
    <PageTemplate 
      title={`Proposal View - ${params.id}`}
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Proposal', path: '/proposal' },
        { label: 'View', path: `/proposal/view/${params.id}` }
      ]} 
    />
  )
}

