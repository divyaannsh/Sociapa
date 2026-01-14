import PageHeader from '../../components/PageHeader'

export default function Leads() {
  return (
    <>
      <PageHeader title="Leads" breadcrumb={[
        { label: 'Home', path: '/' },
        { label: 'Leads', path: '/leads' }
      ]} />
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Leads List</h5>
              </div>
              <div className="card-body">
                <p>Leads page content will be rendered here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

