import PageTemplate from '../../../components/PageTemplate'

export default function HelpKnowledgebase() {
  return (
    <PageTemplate 
      title="Help Knowledgebase" 
      breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Help', path: '/help' },
        { label: 'Knowledgebase', path: '/help/knowledgebase' }
      ]} 
    />
  )
}

