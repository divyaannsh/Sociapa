'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import PageHeader from '../../components/PageHeader';
import Link from 'next/link';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState({ clients: [], campaigns: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setQuery(q);
            setInputVal(q);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults({ clients: [], campaigns: [] });
            return;
        }

        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
            .then(r => r.json())
            .then(d => setResults(d.results || { clients: [], campaigns: [] }))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputVal.trim()) {
            router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
            setQuery(inputVal.trim());
        }
    };

    const totalResults = results.clients.length + results.campaigns.length;

    return (
        <div className="main-content">
            <PageHeader
                title="Global Search"
                breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Search', path: '/search' }]}
            />

            {/* Search Bar */}
            <div className="row mb-4">
                <div className="col-12">
                    <form onSubmit={handleSearch}>
                        <div className="input-group input-group-lg">
                            <span className="input-group-text">
                                <i className="feather-search" />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search clients, campaigns..."
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                                autoFocus
                            />
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm" /> : 'Search'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {query && !loading && (
                <p className="text-muted mb-3">
                    {totalResults === 0 ? 'No results found for' : `${totalResults} result${totalResults !== 1 ? 's' : ''} for`}{' '}
                    <strong>&quot;{query}&quot;</strong>
                </p>
            )}

            <div className="row g-4">
                {/* Clients Results */}
                {results.clients.length > 0 && (
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex align-items-center gap-2">
                                <i className="feather-users text-primary" />
                                <h6 className="mb-0 fw-bold">Clients ({results.clients.length})</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="list-group list-group-flush">
                                    {results.clients.map(client => (
                                        <Link
                                            key={client.id}
                                            href={`/analytics/dashboard?clientId=${client.id}`}
                                            className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                                        >
                                            <div
                                                style={{
                                                    width: 40, height: 40, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0
                                                }}
                                            >
                                                {client.name?.[0]?.toUpperCase() || 'C'}
                                            </div>
                                            <div>
                                                <div className="fw-semibold">{client.name}</div>
                                                <small className="text-muted">@{client.username}</small>
                                            </div>
                                            <i className="feather-arrow-right ms-auto text-muted" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Campaign Results */}
                {results.campaigns.length > 0 && (
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex align-items-center gap-2">
                                <i className="feather-cast text-success" />
                                <h6 className="mb-0 fw-bold">Campaigns ({results.campaigns.length})</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="list-group list-group-flush">
                                    {results.campaigns.map(campaign => (
                                        <Link
                                            key={campaign.id}
                                            href={`/analytics/dashboard?clientId=${campaign.clientId}`}
                                            className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                                        >
                                            <div
                                                style={{
                                                    width: 40, height: 40, borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#1a1a1a', flexShrink: 0
                                                }}
                                            >
                                                <i className="feather-file-text" />
                                            </div>
                                            <div>
                                                <div className="fw-semibold">{campaign.fileName}</div>
                                                <small className="text-muted">
                                                    {campaign.clientName} · {campaign.rowCount} rows ·{' '}
                                                    {campaign.uploadedAt ? new Date(campaign.uploadedAt).toLocaleDateString() : 'N/A'}
                                                </small>
                                            </div>
                                            <i className="feather-arrow-right ms-auto text-muted" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && query && totalResults === 0 && (
                    <div className="col-12 text-center py-5">
                        <i className="feather-search" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                        <h5 className="mt-3 text-muted">No results found</h5>
                        <p className="text-muted">Try a different search term like a client name or campaign filename.</p>
                    </div>
                )}

                {/* Default state */}
                {!query && (
                    <div className="col-12 text-center py-5">
                        <i className="feather-search" style={{ fontSize: '3rem', color: '#cbd5e0' }} />
                        <h5 className="mt-3 text-muted">Search across your dashboard</h5>
                        <p className="text-muted">Search clients by name or campaigns by filename.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
