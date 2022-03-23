import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { userController } from '../controllers/user.controller';
const router = Router();

//POSTS
router.get('/posts', postController.getAllPosts);
router.post('/posts', postController.createPost);
router.get('/posts/:id', postController.getPostById);
router.put('/posts/:id', postController.updatePost);
router.delete('/posts/:id', postController.deletePost);

//COMMENTS
router.post('/posts/:id/comments', postController.createComment);
router.put('/posts/:postId/comments/:commentId', postController.updateComment);
router.delete(
  '/posts/:postId/comments/:commentId',
  postController.deleteComment,
);

//UPVOTES
router.post('/posts/:postId/vote', postController.createVote);

//USER
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);

export default router;
