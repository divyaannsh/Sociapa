import PageHeader from './PageHeader'

export default function PageTemplate({ title, breadcrumb }) {
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb} />
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">{title}</h5>
              </div>
              <div className="card-body">
                <p>{title} page content will be rendered here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

