using ChineseChess.Api.Data;
using ChineseChess.Api;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ChineseChess.Api.Game;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var cs = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(cs));

// Identity (cookie-based)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opt =>
{
    opt.Password.RequireNonAlphanumeric = false;
    opt.Password.RequireUppercase = false;
    opt.Password.RequireDigit = false;
    opt.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// cache services
builder.Services.AddMemoryCache(); // IMemoryCache (singleton)
builder.Services.AddSingleton<IGameSessionCache, InMemoryGameSessionCache>();
builder.Services.AddSingleton<ClockService>();

builder.Services.AddAuthentication(); // Identity already registers this
builder.Services.AddAuthorization();

// builder.Services.AddIdentity<ApplicationUser, IdentityRole>().AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddSignalR();
builder.Services.AddControllers();
// Swagger: API docs & test UI (dev only by default)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for dev (frontend at 5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", p => p
        .WithOrigins(
            "http://localhost:5173",
            "https://ashy-grass-0231f1603.2.azurestaticapps.net"
            )

        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Game Services: Register in-memory game store
builder.Services.AddSingleton<BoardSerializer>();  // helper
builder.Services.AddScoped<IGameStore, PersistentGameStore>();


var app = builder.Build();

app.UseHttpsRedirection();
// app.UseStaticFiles();
// app.UseRouting();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // browse at /swagger
}

app.UseCors("DevCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<GameHub>("/hub/game");

// Simple health endpoint to prove it runs
app.MapGet("/", () => "Chinese Chess API is running.");

app.Run();

