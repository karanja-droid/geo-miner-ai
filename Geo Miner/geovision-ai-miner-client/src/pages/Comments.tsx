import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';

interface Comment {
  comment_id: string;
  user_id: string;
  comment_text: string;
  timestamp: string;
}

interface CommentsProps {
  projectId: string;
  userId: string;
}

const Comments: React.FC<CommentsProps> = ({ projectId, userId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get(`/comments/list/${projectId}`).then(res => setComments(res.data)).catch(() => {});
  }, [projectId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!commentText) {
      setError('Comment cannot be empty.');
      return;
    }
    try {
      await axios.post('/comments/', {
        project_id: projectId,
        user_id: userId,
        comment_text: commentText,
        geom: null
      });
      setCommentText('');
      setSuccess('Comment posted!');
      // Refresh comments
      const res = await axios.get(`/comments/list/${projectId}`);
      setComments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to post comment');
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">Comments</Typography>
      <form onSubmit={handlePost} style={{ marginTop: 8, marginBottom: 16 }}>
        <TextField
          label="Add a comment"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Post Comment
        </Button>
      </form>
      <ul>
        {comments.map(c => (
          <li key={c.comment_id}>
            <strong>{c.user_id}</strong>: {c.comment_text} <em>({new Date(c.timestamp).toLocaleString()})</em>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default Comments; 