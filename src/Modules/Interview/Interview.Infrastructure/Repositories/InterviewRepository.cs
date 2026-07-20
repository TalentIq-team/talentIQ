using Interview.Application.Interfaces;
using Interview.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using InterviewEntity = Interview.Domain.Entities.Interview;

namespace Interview.Infrastructure.Repositories;

public class InterviewRepository : IInterviewRepository
{
    private readonly InterviewDbContext _context;

    public InterviewRepository(InterviewDbContext context)
    {
        _context = context;
    }

    public async Task AddInterviewAsync(InterviewEntity interview)
    {
        await _context.Interviews.AddAsync(interview);
    }

    public async Task<InterviewEntity?> GetInterviewByIdAsync(Guid id)
    {
        return await _context.Interviews.FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<InterviewEntity>> GetAllInterviewsAsync()
    {
        return await _context.Interviews.AsNoTracking().ToListAsync();
    }

    public async Task UpdateInterviewAsync(InterviewEntity interview)
    {
        _context.Interviews.Update(interview);
        await Task.CompletedTask;
    }

    public async Task AddEvaluationAsync(CandidateEvaluation evaluation)
    {
        await _context.CandidateEvaluations.AddAsync(evaluation);
    }

    public async Task<CandidateEvaluation?> GetEvaluationByInterviewIdAsync(Guid interviewId)
    {
        return await _context.CandidateEvaluations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.InterviewId == interviewId);
    }

    public async Task<List<Guid>> GetScheduledApplicationIdsAsync()
    {
        return await _context.Interviews
            .AsNoTracking()
            .Where(x => x.Status != InterviewStatus.Cancelled)
            .Select(x => x.ApplicationId)
            .Distinct()
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
