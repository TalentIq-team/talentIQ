using AI.Application.Interfaces;
using AI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AI.Infrastructure.Repositories;

public class InterviewQuestionSetRepository : IInterviewQuestionSetRepository
{
    private readonly AiDbContext _db;

    public InterviewQuestionSetRepository(AiDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(InterviewQuestionSet set, CancellationToken ct = default)
    {
        _db.InterviewQuestionSets.Add(set);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<InterviewQuestionSet?> GetByApplicationIdAsync(Guid applicationId, CancellationToken ct = default)
    {
        return await _db.InterviewQuestionSets
            .Where(q => q.ApplicationId == applicationId)
            .OrderByDescending(q => q.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }
}
