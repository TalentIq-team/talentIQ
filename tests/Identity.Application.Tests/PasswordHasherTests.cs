using Identity.Infrastructure.Security;

namespace Identity.Application.Tests;

public sealed class PasswordHasherTests
{
    [Fact]
    public void HashPassword_ThenVerifyWithCorrectPassword_Succeeds()
    {
        var hasher = new PasswordHasher();

        var hash = hasher.HashPassword("Password@123");

        Assert.True(hasher.VerifyPassword(hash, "Password@123"));
    }

    [Fact]
    public void VerifyPassword_WithWrongPassword_Fails()
    {
        var hasher = new PasswordHasher();
        var hash = hasher.HashPassword("Password@123");

        Assert.False(hasher.VerifyPassword(hash, "WrongPassword"));
    }

    [Fact]
    public void HashPassword_CalledTwiceForSamePassword_ProducesDifferentHashes()
    {
        var hasher = new PasswordHasher();

        var hash1 = hasher.HashPassword("Password@123");
        var hash2 = hasher.HashPassword("Password@123");

        // Each hash embeds a random salt, so two hashes of the same password must differ,
        // even though both verify successfully against that password.
        Assert.NotEqual(hash1, hash2);
        Assert.True(hasher.VerifyPassword(hash1, "Password@123"));
        Assert.True(hasher.VerifyPassword(hash2, "Password@123"));
    }

    [Fact]
    public void HashPassword_WithNullOrWhitespace_Throws()
    {
        var hasher = new PasswordHasher();

        Assert.Throws<ArgumentException>(() => hasher.HashPassword(""));
        Assert.Throws<ArgumentException>(() => hasher.HashPassword("   "));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void VerifyPassword_WithNullOrWhitespaceProvidedPassword_ReturnsFalse(string? providedPassword)
    {
        var hasher = new PasswordHasher();
        var hash = hasher.HashPassword("Password@123");

        Assert.False(hasher.VerifyPassword(hash, providedPassword!));
    }

    [Fact]
    public void VerifyPassword_WithNullOrWhitespaceHash_ReturnsFalse()
    {
        var hasher = new PasswordHasher();

        Assert.False(hasher.VerifyPassword("", "Password@123"));
    }
}
