import PageTemplate from '../../../../components/PageTemplate'

export default function ProjectsView({ params }) {
  return (
    <PageTemplate 
      title={`Projects View - ${params.id}`}
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Projects', path: '/projects' },
        { label: 'View', path: `/projects/view/${params.id}` }
      ]} 
    />
  )
}

