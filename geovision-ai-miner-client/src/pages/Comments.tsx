import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, List, ListItem, ListItemText, Paper } from '@mui/material';

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

// Demo comments data
const DEMO_COMMENTS: Comment[] = [
  {
    comment_id: '1',
    user_id: 'demo@geovision.com',
    comment_text: 'Initial geological survey completed. High-grade copper deposits identified in sector A.',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    comment_id: '2',
    user_id: 'geologist@geovision.com',
    comment_text: 'Drill core samples analyzed. Confirming ore grade estimates.',
    timestamp: '2024-01-16T14:20:00Z'
  },
  {
    comment_id: '3',
    user_id: 'manager@geovision.com',
    comment_text: 'Excellent progress! Ready to proceed with phase 2 exploration.',
    timestamp: '2024-01-17T09:15:00Z'
  }
];

const Comments: React.FC<CommentsProps> = ({ projectId, userId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with demo data
    const loadComments = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        setComments(DEMO_COMMENTS);
      } catch (err) {
        console.error('Error loading comments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [projectId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!commentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new comment
      const newComment: Comment = {
        comment_id: Date.now().toString(),
        user_id: userId,
        comment_text: commentText.trim(),
        timestamp: new Date().toISOString()
      };

      // Add to comments list
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      setSuccess('Comment posted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to post comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box mt={4}>
        <Typography variant="h6">Comments</Typography>
        <Typography>Loading comments...</Typography>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>Project Comments</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handlePost}>
          <TextField
            label="Add a comment"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            placeholder="Share your thoughts about this project..."
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            disabled={!commentText.trim()}
          >
            Post Comment
          </Button>
        </form>
      </Paper>

      <Typography variant="subtitle1" gutterBottom>
        Recent Comments ({comments.length})
      </Typography>
      
      <List>
        {comments.map(comment => (
          <ListItem key={comment.comment_id} divider>
            <ListItemText
              primary={comment.comment_text}
              secondary={
                <Box>
                  <Typography variant="caption" color="primary">
                    {comment.user_id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {new Date(comment.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      
      {comments.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No comments yet. Be the first to add a comment!
        </Typography>
      )}
    </Box>
  );
};

export default Comments; 