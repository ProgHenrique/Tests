import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase"

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to create a new statement", async () => {
    const userData: ICreateUserDTO = {
      name: "user test",
      email: "user@example.com",
      password: "password test",
    }
    const user = await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    })

    const result = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT, 
      description: "Colocar dinheiro", 
      amount: 500,
    })

    expect(result).toHaveProperty("id");
    
  })

  it("should not be able to create a new statement to a nonexistent user", () => {

    expect(async()=>{
      await createStatementUseCase.execute({
        user_id: "12345",
        type: OperationType.DEPOSIT, 
        description: "Colocar dinheiro", 
        amount: 500,
      })
    }).rejects.toBeInstanceOf(AppError)
    
  })

  it("should not be able to create a new statement when user not have sufficient funds", () => {

    expect(async()=>{
      const userData: ICreateUserDTO = {
        name: "user test",
        email: "user@example.com",
        password: "password test",
      }
      const user = await inMemoryUsersRepository.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      })
  
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW, 
        description: "Colocar dinheiro", 
        amount: 500,
      })
    }).rejects.toBeInstanceOf(AppError)
    
  })
})
