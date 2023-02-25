import { Request } from 'express';
import { User } from 'src/modules/users/model/user.model';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
