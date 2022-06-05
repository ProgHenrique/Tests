import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("GetBalance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository,inMemoryUsersRepository)
  })

  it("should not be able to get balance to a nonexistent user", () => {

    expect(async()=>{
      await getBalanceUseCase.execute({user_id: "12345"})
    }).rejects.toBeInstanceOf(AppError)
    
  })

  it("should be able to get balance", async () => {

    const user = await inMemoryUsersRepository.create({
      name: "user test",
      email: "user@example.com",
      password: "password test",
    })

    const balance = await getBalanceUseCase.execute({user_id: user.id as string})

    expect(balance).toHaveProperty("balance")

  })
})