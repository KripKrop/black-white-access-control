import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentAPI } from '../services/api';
import Comment from './Comment';

const CommentSection = ({ pageName }) => {
  const { user, hasPermission } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [pageName]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getComments({ page: pageName });
      setComments(response.data);
    } catch (error) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentAPI.createComment({
        page: pageName,
        content: newComment.trim()
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      setError('Failed to add comment');
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    try {
      await commentAPI.updateComment(editingComment, {
        content: editContent.trim()
      });
      setEditingComment(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      setError('Failed to update comment');
      console.error('Error updating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentAPI.deleteComment(commentId);
      fetchComments();
    } catch (error) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  const canView = hasPermission(pageName, 'view');
  const canCreate = hasPermission(pageName, 'create');
  const canEdit = hasPermission(pageName, 'edit');
  const canDelete = hasPermission(pageName, 'delete');

  if (!canView) {
    return (
      <div className="alert alert-warning">
        You don't have permission to view comments on this page.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h5 className="fw-bold mb-3">Comments</h5>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Add New Comment */}
      {canCreate && (
        <div className="card mb-4 border">
          <div className="card-body">
            <form onSubmit={handleAddComment}>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-dark"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Adding...
                  </>
                ) : (
                  'Add Comment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading comments...</span>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p>No comments yet.</p>
          {canCreate && <p>Be the first to add a comment!</p>}
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <div key={comment.id}>
              {editingComment === comment.id ? (
                <div className="card mb-3 border">
                  <div className="card-body">
                    <div className="mb-3">
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        required
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleSaveEdit}
                        disabled={submitting || !editContent.trim()}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleCancelEdit}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Comment
                  comment={comment}
                  onEdit={canEdit ? handleEditComment : null}
                  onDelete={canDelete ? handleDeleteComment : null}
                  showHistory={user?.is_superuser}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;