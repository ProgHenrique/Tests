import { getRepository, Repository } from "typeorm";

import { User } from "../entities/User";
import { ICreateUserDTO } from "../useCases/createUser/ICreateUserDTO";
import { IUsersRepository } from "./IUsersRepository";

export class UsersRepository implements IUsersRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = getRepository(User);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.repository.findOne({
      email,
    });

    return user
  }

  async findById(user_id: string): Promise<User | undefined> {
    const user = await this.repository.findOne(user_id);

    return user
  }

  async create({ name, email, password }: ICreateUserDTO): Promise<User> {
    const user = this.repository.create({ name, email, password });

    await this.repository.save(user);

    return user
  }
}
