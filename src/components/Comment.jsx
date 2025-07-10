import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Comment = ({ comment, onEdit, onDelete, showHistory = false }) => {
  const { user } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const canEdit = comment.user === user?.email || user?.is_superuser;
  const canDelete = comment.user === user?.email || user?.is_superuser;

  const historyTooltip = showHistory && comment.history && comment.history.length > 0 && (
    <div 
      className="position-relative d-inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <i className="bi bi-clock-history text-muted ms-2" style={{ cursor: 'help' }}></i>
      
      {showTooltip && (
        <div 
          className="position-absolute bg-dark text-white p-3 rounded shadow"
          style={{ 
            bottom: '100%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            minWidth: '300px',
            zIndex: 1000,
            marginBottom: '8px'
          }}
        >
          <div className="small">
            <strong>Modification History:</strong>
            {comment.history.map((entry, index) => (
              <div key={index} className="mt-2 pt-2 border-top border-secondary">
                <div><strong>Original:</strong> {entry.content}</div>
                <div><strong>Modified by:</strong> {entry.modified_by}</div>
                <div><strong>Modified at:</strong> {formatDate(entry.modified_at)}</div>
              </div>
            ))}
          </div>
          {/* Arrow */}
          <div 
            className="position-absolute top-100 start-50 translate-middle-x"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid black'
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="card mb-3 border">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <small className="text-muted">
              <strong>{comment.user}</strong> • {formatDate(comment.created_at)}
              {comment.updated_at !== comment.created_at && (
                <span className="text-warning"> (edited)</span>
              )}
            </small>
            {user?.is_superuser && historyTooltip}
          </div>
          
          {(canEdit || canDelete) && (
            <div className="btn-group btn-group-sm">
              {canEdit && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onEdit(comment)}
                  title="Edit comment"
                >
                  <i className="bi bi-pencil"></i>
                </button>
              )}
              {canDelete && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onDelete(comment.id)}
                  title="Delete comment"
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          )}
        </div>
        
        <p className="mb-0">{comment.content}</p>
      </div>
    </div>
  );
};

export default Comment;