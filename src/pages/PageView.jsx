import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PAGES } from '../config';
import CommentSection from '../components/CommentSection';

const PageView = () => {
  const { pageId } = useParams();
  const { hasPermission } = useAuth();

  // Find the page by ID or by path segment
  const page = PAGES.find(p => 
    p.id.toString() === pageId || 
    p.path.includes(pageId)
  );

  if (!page) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Page not found
        </div>
      </div>
    );
  }

  const canView = hasPermission(page.name, 'view');

  if (!canView) {
    return (
      <div className="container">
        <div className="alert alert-warning">
          You don't have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 fw-bold">{page.name}</h1>
              <p className="text-muted mb-0">
                Manage and collaborate on {page.name.toLowerCase()} with your team
              </p>
            </div>
          </div>

          {/* Page Content */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Welcome to {page.name}</h5>
              <p className="card-text text-muted">
                This is the {page.name.toLowerCase()} page. Here you can collaborate with your team 
                members through comments and discussions. Your access level determines what actions 
                you can perform on this page.
              </p>
              
              {/* Access Level Display */}
              <div className="mt-3">
                <h6 className="fw-bold">Your Access Level:</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {hasPermission(page.name, 'view') && (
                    <span className="badge bg-success">View</span>
                  )}
                  {hasPermission(page.name, 'create') && (
                    <span className="badge bg-primary">Create</span>
                  )}
                  {hasPermission(page.name, 'edit') && (
                    <span className="badge bg-warning text-dark">Edit</span>
                  )}
                  {hasPermission(page.name, 'delete') && (
                    <span className="badge bg-danger">Delete</span>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Comments Section */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <CommentSection pageName={page.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageView;