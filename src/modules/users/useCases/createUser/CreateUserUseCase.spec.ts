import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
  usersRepositoryInMemory = new InMemoryUsersRepository()
  createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      email: "test@example.com",
      name: "user test",
      password: "testpassword"
    })

    expect(user).toHaveProperty("id");
  })

  it("should not be able to create a new user if the user already exists", () => {
    expect( async ()=>{
      await createUserUseCase.execute({
        email: "test@example.com",
        name: "user test",
        password: "testpassword"
      })

      await createUserUseCase.execute({
        email: "test@example.com",
        name: "user test",
        password: "testpassword"
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})