import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
  RECIVETRANSFER = 'reciveTransfer'
}

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, type, amount, description, sender_id }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    const sender = await this.usersRepository.findById(String(sender_id));

    if (!sender && type === OperationType.TRANSFER) {
      throw new CreateStatementError.SenderNotFound();
    }

    if(type === 'transfer') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id:String(sender_id) });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }

      const transferOperation = await this.statementsRepository.create({
        user_id: String(sender_id),
        sender_id: user_id,
        type,
        amount,
        description
      });

      await this.statementsRepository.create({
        user_id,
        sender_id,
        type: OperationType.RECIVETRANSFER,
        amount,
        description: `${sender?.name} te enviou a quantia de ${amount}`
      });

      return transferOperation;

    }

    if(type === 'withdraw') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
