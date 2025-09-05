using Microsoft.EntityFrameworkCore;

namespace ChineseChess.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<GameRecord> Games => Set<GameRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<GameRecord>()
            .Property(x => x.StateJson)
            .HasColumnType("TEXT");
        modelBuilder.Entity<GameRecord>()
            .Property(x => x.MovesJson)
            .HasColumnType("TEXT");
    }
}
