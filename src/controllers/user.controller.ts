import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

export const userController = {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/users',
      );
      const data = await response.data;
      const newData = data.map((d) => {
        return {
          ...d,
          imageUrl:
            d.id % 2
              ? `https://randomuser.me/api/portraits/men/${d.id}.jpg`
              : `https://randomuser.me/api/portraits/women/${d.id}.jpg`,
        };
      });
      res.json({ data:newData });
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

      res.json({ data:{
          ...data,
          imageUrl:
          data.id % 2
            ? `https://randomuser.me/api/portraits/men/${data.id}.jpg`
            : `https://randomuser.me/api/portraits/women/${data.id}.jpg`
      } });
    } catch (error) {
      next(error);
    }
  },
} as const;
