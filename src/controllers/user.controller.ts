import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

function appendUserObject(user: any) {
  return {
    ...user,
    imageUrl:
      user.id % 2
        ? `https://randomuser.me/api/portraits/men/${user.id}.jpg`
        : `https://randomuser.me/api/portraits/women/${user.id}.jpg`,
  };
}

export const userController = {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/users',
      );
      const data = await response.data;
      const newData = data.map((user) => appendUserObject(user));
      res.json({ data: newData });
    } catch (error) {
      next(error);
    }
  },
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/users/' + req.params.id,
      );
      const data = await response.data;

      res.json({
        data: appendUserObject(data),
      });
    } catch (error) {
      next(error);
    }
  },
} as const;
