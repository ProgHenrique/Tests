import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase

describe("Create user", () => {
  beforeEach(() => {
  usersRepositoryInMemory = new InMemoryUsersRepository()
  authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory)
  createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to authenticate a user", async () => {

    await createUserUseCase.execute({
      name: "user test",
      email: "test@example.com",
      password: "testpassword"
    })

    const user = await authenticateUserUseCase.execute({
      email: "test@example.com",
      password: "testpassword"
    })

    expect(user).toHaveProperty("token");
  })

  it("should not be able to authenticate if user non exists", () => {
    expect( async ()=>{
      await authenticateUserUseCase.execute({
        email: "test@example.com",
        password: "testpassword"
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it("should not be able to authenticate if password is not valid", () => {
    expect( async ()=>{

      await usersRepositoryInMemory.create({
        name: "user test",
        email: "test@example.com",
        password: "testpassword"
      })

      await authenticateUserUseCase.execute({
        email: "test@example.com",
        password: "passwordIncorrect"
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})