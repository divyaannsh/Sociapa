import PageTemplate from '../../../../components/PageTemplate'

export default function ProposalEdit({ params }) {
  return (
    <PageTemplate 
      title={`Proposal Edit - ${params.id}`}
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Proposal', path: '/proposal' },
        { label: 'Edit', path: `/proposal/edit/${params.id}` }
      ]} 
    />
  )
}

