import PageTemplate from '../../components/PageTemplate'

export default function Projects() {
  return (
    <PageTemplate 
      title="Projects" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Projects', path: '/projects' }
      ]} 
    />
  )
}

