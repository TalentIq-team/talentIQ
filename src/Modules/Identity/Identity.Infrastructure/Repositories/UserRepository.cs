using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly IdentityDbContext _dbContext;

    public UserRepository(IdentityDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .FirstOrDefaultAsync(
                user => user.Id == id,
                cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .FirstOrDefaultAsync(
                user => user.Email == email,
                cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .AnyAsync(
                user => user.Email == email,
                cancellationToken);
    }

    public async Task AddAsync(
        User user,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.Users.AddAsync(user, cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}