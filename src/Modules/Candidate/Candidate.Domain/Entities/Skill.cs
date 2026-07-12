namespace Candidate.Domain.Entities;

/// <summary>
/// A reusable skill that candidates can be associated with (e.g. "C#", "Project Management").
/// </summary>
public class Skill
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;

    // Required by EF Core.
    private Skill()
    {
    }

    public Skill(Guid id, string name, string category)
    {
        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Name = name;
        Category = category;
    }

    public static Skill Create(string name, string category) => new(Guid.NewGuid(), name, category);
}
