import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Comment } from '../entity/Comments';
import { Post } from '../entity/Post';
import { Vote } from '../entity/UserVote';

function getStudentName() {
  const students = [
    'Sherif',
    'Emad',
    'Kareem',
    'Seif',
    'Mahmoud',
    'Islam',
    'Moustafa',
  ];
  return students[Math.floor(Math.random() * students.length)];
}

const POST_NOT_FOUND = `Post not found, someone probably deleted it ;) ${getStudentName()} was it you?`;
const COMMENT_NOT_FOUND = `Comment not found, someone probably deleted it ;) ${getStudentName()} was it you?`;

function appendPostObject(post: Post) {
  if (!post.comments) {
    post.comments = [];
  }
  if (!post.votes) {
    post.votes = [];
  }
  return {
    ...post,
    commentsTotal: post.comments?.length || 0,
    upVotesTotal: post.votes?.filter((v) => v.userVote === 1).length || 0,
    downVotesTotal: post.votes?.filter((v) => v.userVote === -1).length || 0,
  };
}

function validatePost(post: Post) {
  if (!post.title) {
    throw new Error('Title is required');
  }
  if (!post.body) {
    throw new Error('Body is required');
  }
  if (!post.userId) {
    throw new Error('UserId is required');
  }
  // user id has to be between 1 and 10
  if (!Array.from({ length: 10 }, (_, i) => i + 1).includes(post.userId)) {
    throw new Error('UserId is not valid');
  }
}
function validateComment(comment: Comment) {
  if (!comment.body) {
    throw new Error('Body is required');
  }
  if (!comment.userId) {
    throw new Error('UserId is required');
  }
  // user id has to be between 1 and 10
  if (!Array.from({ length: 10 }, (_, i) => i + 1).includes(+comment.userId)) {
    throw new Error('UserId is not valid');
  }
}
function validateVote(vote: Vote) {
  if (!vote.userId) {
    throw new Error('userId is required');
  }

  if (!vote.userVote) {
    throw new Error('userVote is required');
  }

  if (![1, -1].includes(+vote.userVote)) {
    throw new Error('userVote must be 1 or -1');
  }
}

export const postController = {
  async getAllPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await AppDataSource.getRepository(Post).find({
        relations: {
          comments: true,
          votes: true,
        },
      });
      const resPosts = posts.map((post) => appendPostObject(post));
      res.json({ data: resPosts });
    } catch (error) {
      next(error);
    }
  },
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const newPost = AppDataSource.getRepository(Post).create(req.body);
      const post = await AppDataSource.getRepository(Post).save(newPost);

      validatePost(post as unknown as Post);
      res.json({ data: appendPostObject(post as unknown as Post) });
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

      if (!post) {
        throw new Error(POST_NOT_FOUND);
      }

      res.json({
        data: appendPostObject(post),
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
      if (!existingPost) {
        throw new Error(POST_NOT_FOUND);
      }

      const updatedPost = AppDataSource.getRepository(Post).merge(
        existingPost,
        req.body,
      );
      validatePost(updatedPost as unknown as Post);

      const post = await AppDataSource.getRepository(Post).save({
        ...updatedPost,
        updatedAt: new Date(),
      });
      res.json({
        message: 'successfully updated Post',
        data: appendPostObject(post),
      });
    } catch (error) {
      next(error);
    }
  },
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedOne = await AppDataSource.getRepository(Post).delete({
        id: +req.params.id,
      });
      res.json({
        message:
          'successfully deleted Post, You better know what you were doing',
        data: deletedOne,
      });
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

      if (!post) {
        throw new Error(POST_NOT_FOUND);
      }

      const comment = AppDataSource.getRepository(Comment).create({
        ...req.body,
        post,
        userId: +req.body.userId,
      });
      validateComment(comment as unknown as Comment);

      await AppDataSource.getRepository(Comment).save(comment);
      const newPost = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.id },
        relations: {
          comments: true,
          votes: true,
        },
      });
      res.json({ data: appendPostObject(newPost) });
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

      if (!post) {
        throw new Error(POST_NOT_FOUND);
      }

      const existingComment = await AppDataSource.getRepository(
        Comment,
      ).findOne({
        where: { id: +req.params.commentId },
      });
      console.log({ existingComment });

      if (!existingComment) {
        throw new Error(COMMENT_NOT_FOUND);
      }
      const updatedComment = AppDataSource.getRepository(Comment).merge(
        existingComment,
        req.body,
      );
      console.log({ updatedComment });

      validateComment(updatedComment as unknown as Comment);

      await AppDataSource.getRepository(Comment).save(updatedComment);
      const newPost = await AppDataSource.getRepository(Post).findOne({
        where: { id: +req.params.postId },
        relations: {
          comments: true,
          votes: true,
        },
      });
      res.json({
        message: 'successfully updated comment',
        data: appendPostObject(newPost),
      });
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
      validateVote(req.body);
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
      await AppDataSource.getRepository(Vote).save(createdVote);
      return res.status(200).json({ message: 'successfully voted' });
    } catch (error) {
      next(error);
    }
  },
} as const;
