import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("GetBalance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should not be able to get statement operation to a nonexistent user", () => {

    expect(async()=>{
      await getStatementOperationUseCase.execute({ user_id: "12345", statement_id: "12345"})
    }).rejects.toBeInstanceOf(AppError)
    
  })

  it("should not be able to get statement operation to a nonexistent statement", () => {
    expect(async()=>{
      const user = await inMemoryUsersRepository.create({
        name: "user test",
        email: "user@example.com",
        password: "password test",
      })

      await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: "12345"})
    }).rejects.toBeInstanceOf(AppError)
    
  })

  it("should be able to get statement operation", async () => {
    
    const user = await inMemoryUsersRepository.create({
      name: "user test",
      email: "user@example.com",
      password: "password test",
    })

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Description Test"
    })

    await getStatementOperationUseCase.execute({
      user_id: user.id as string, 
      statement_id: statement.id as string
    })
    
    
  })
})