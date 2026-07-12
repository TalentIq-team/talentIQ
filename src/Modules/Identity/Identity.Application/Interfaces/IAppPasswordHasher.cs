namespace Identity.Application.Interfaces;

public interface IAppPasswordHasher
{
    string HashPassword(string password);

    bool VerifyPassword(
        string passwordHash,
        string providedPassword);
}
