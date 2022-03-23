import { Router } from "express";
import { postController } from "../controllers/post.controller";
const router = Router();
router.get("/posts", postController.getAllPosts);
router.post("/posts", postController.createPost);
router.get("/posts/:id", postController.getPostById);
router.put("/posts/:id", postController.updatePost);
router.delete("/posts/:id", postController.deletePost);
router.post("/posts/:id/comments", postController.createComment);
router.put("/posts/:postId/comments/:commentId", postController.updateComment);
router.delete(
  "/posts/:postId/comments/:commentId",
  postController.deleteComment
);
router.post("/posts/:postId/vote", postController.createVote);

export default router;
