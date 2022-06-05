import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Create user", () => {
  beforeEach(() => {
  usersRepositoryInMemory = new InMemoryUsersRepository()
  showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory)
  })

  it("should not be able to show user profile if the does not exist", () => {
    expect( async ()=>{
      await showUserProfileUseCase.execute(
        "12345"
      )
    }).rejects.toBeInstanceOf(AppError)
  })

  it("should be able to show a user profile", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "user test",
      email: "test@example.com",
      password: "testpassword"
    })

    await showUserProfileUseCase.execute(
      user.id as string
    )
  })
})