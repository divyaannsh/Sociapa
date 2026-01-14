import PageTemplate from '../../../components/PageTemplate'

export default function ProjectsCreate() {
  return (
    <PageTemplate 
      title="Projects Create" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Projects', path: '/projects' },
        { label: 'Create', path: '/projects/create' }
      ]} 
    />
  )
}

