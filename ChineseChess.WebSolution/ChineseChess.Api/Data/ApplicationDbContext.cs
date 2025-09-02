using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ChineseChess.Api.Data;


public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<SavedGame> SavedGames => Set<SavedGame>();

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
}
