import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Comment } from '../entity/Comments';
import { Post } from '../entity/Post';
import { Vote } from '../entity/UserVote';
export const postController = {
  async getAllPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await AppDataSource.getRepository(Post).find({
        relations: {
          comments: true,
          votes: true,
        },
      });
      const resPosts = posts.map((p) => {
        return {
          ...p,
          commentsTotal: p.comments.length,
          upVotesTotal: p.votes.filter((v) => v.userVote === 1).length,
          downVotesTotal: p.votes.filter((v) => v.userVote === -1).length,
        };
      });
      res.json({ data: resPosts });
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
      const post = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.id },
        relations: {
          comments: true,
          votes: true,
        },
      });
      res.json({
        data: {
          ...post,
          commentsTotal: post.comments.length,
          upVotesTotal: post.votes.filter((v) => v.userVote === 1).length,
          downVotesTotal: post.votes.filter((v) => v.userVote === -1).length,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const existingPost = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.id },
        relations: {
          comments: true,
          votes: true,
        },
      });
      const updatedPost = AppDataSource.getRepository(Post).merge(
        existingPost,
        req.body,
      );
      const post = await AppDataSource.getRepository(Post).save({
        ...updatedPost,
        updatedAt: new Date(),
      });
      res.json({ message: 'successfully updated Post', data: post });
    } catch (error) {
      next(error);
    }
  },
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedOne = await AppDataSource.getRepository(Post).delete({
        id: +req.params.id,
      });
      res.json({ message: 'successfully deleted Post', data: deletedOne });
    } catch (error) {
      next(error);
    }
  },
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.id },
        relations: {
          comments: true,
          votes: true,
        },
      });

      const comment = AppDataSource.getRepository(Comment).create({
        ...req.body,
        post,
        userId: post.userId,
      });
      const savedComment = await AppDataSource.getRepository(Comment).save(
        comment,
      );
      const newPost = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.id },
        relations: {
          comments: true,
          votes: true,
        },
      });
      res.json({ data: newPost });
    } catch (error) {
      next(error);
    }
  },
  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.postId },
        relations: {
          comments: true,
          votes: true,
        },
      });
      const existingComment = await AppDataSource.getRepository(
        Comment,
      ).findOne({
        where: { post, id: +req.params.commentId },
      });
      const updatedComment = AppDataSource.getRepository(Comment).merge(
        existingComment,
        req.body,
      );
      const savedComment = await AppDataSource.getRepository(Comment).save(
        updatedComment,
      );
      res.json({ message: 'successfully updated comment', data: savedComment });
    } catch (error) {
      next(error);
    }
  },
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.postId },
        relations: {
          comments: true,
          votes: true,
        },
      });
      const deletedComment = await AppDataSource.getRepository(Comment).delete({
        id: +req.params.commentId,
        post,
      });
      res.json({
        message: 'successfully delete comment',
        data: deletedComment,
      });
    } catch (error) {
      next(error);
    }
  },
  async createVote(req: Request, res: Response, next: NextFunction) {
    try {
      if (![1, -1].includes(+req.body.userVote)) {
        throw new Error('userVote must be 1 or -1');
      }

      const post = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.postId },
        relations: {
          comments: true,
          votes: true,
        },
      });

      const existingVote = post.votes.find(
        (vote) => +vote.userId === +req.body.userId,
      );

      if (existingVote) {
        // user may be trying to change vote from negative to positive or vice versa
        const updatedVote = AppDataSource.getRepository(Vote).merge(
          existingVote,
          req.body,
        );
        const savedVote = await AppDataSource.getRepository(Vote).save(
          updatedVote,
        );
        return res.json({ data: savedVote });
      }
      const createdVote = AppDataSource.getRepository(Vote).create({
        userVote: +req.body.userVote,
        post,
        userId: +req.body.userId,
      });
      const vote = await AppDataSource.getRepository(Vote).save(createdVote);
      return res.status(200).json({ message: 'successfully voted' });
    } catch (error) {
      next(error);
    }
  },
} as const;
