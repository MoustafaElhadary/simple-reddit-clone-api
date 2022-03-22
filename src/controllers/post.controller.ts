import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Comment } from "../entity/Comments";
import { Post } from "../entity/Post";
export const postController = {
  async getAllPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await AppDataSource.getRepository(Post).find({
        relations: {
          comments: true,
        },
      });
      res.json({ data: posts });
    } catch (error) {
      next(error);
    }
  },
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const newPost = AppDataSource.getRepository(Post).create(req.body);
      const post = await AppDataSource.getRepository(Post).save(newPost);
      res.json({ data: post });
    } catch (error) {
      next(error);
    }
  },
  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await AppDataSource.getRepository(Post).findOneBy({
        id: +req.params.id,
      });
      res.json({ data: post });
    } catch (error) {
      next(error);
    }
  },
  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const existedPost = await AppDataSource.getRepository(Post).findOneBy({
        id: +req.params.id,
      });
      const updatedPost = AppDataSource.getRepository(Post).merge(
        existedPost,
        req.body
      );
      const post = await AppDataSource.getRepository(Post).save(updatedPost);
      res.json({ message: "succefully updated Post", data: post });
    } catch (error) {
      next(error);
    }
  },
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedOne = await AppDataSource.getRepository(Post).delete(
        +req.params.id
      );
      res.json({ message: "succefully deleted Post", data: deletedOne });
    } catch (error) {}
  },
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await AppDataSource.getRepository(Post).findOneBy({
        id: +req.params.id,
      });
      const comment = AppDataSource.getRepository(Comment).create({
        body: req.body.body,
        authorId: req.body.authorId,
        post,
      });
      const savedComment = await AppDataSource.getRepository(Comment).save(
        comment
      );
      res.json({ data: savedComment });
    } catch (error) {
      next(error);
    }
  },
  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await AppDataSource.getRepository(Post).findOneBy({
        id: +req.params.postId,
      });
      const existedComment = await AppDataSource.getRepository(Comment).findOne(
        {
          where: { post, id: +req.params.commentId },
        }
      );
      const updatedComment = AppDataSource.getRepository(Comment).merge(
        existedComment,
        req.body
      );
      const savedComment = await AppDataSource.getRepository(Comment).save(
        updatedComment
      );
      res.json({ message: "successfully updated comment", data: savedComment });
    } catch (error) {
      next(error);
    }
  },
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await AppDataSource.getRepository(Post).findOneBy({
        id: +req.params.postId,
      });
      const deletedComment = await AppDataSource.getRepository(Comment).delete({
        id: +req.params.commentId,
        post,
      });
      res.json({
        message: "successfully delete comment",
        data: deletedComment,
      });
    } catch (error) {
      next(error);
    }
  },
} as const;
