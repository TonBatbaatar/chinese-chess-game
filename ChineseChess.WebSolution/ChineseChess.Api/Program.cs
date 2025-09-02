using ChineseChess.Api.Data;
using ChineseChess.Api;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models; //for swagger

var builder = WebApplication.CreateBuilder(args);

// Swagger: API docs & test UI (dev only by default)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SQLLite database with EF
builder.Services.AddDbContext<ApplicationDbContext>(opt => opt.UseSqlite("Data Source=chinesechess.db"));

// builder.Services.AddIdentity<ApplicationUser, IdentityRole>().AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddSignalR();
builder.Services.AddControllers();
// builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true)));

builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(p => p
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowAnyOrigin());
});

// Register in-memory game store
builder.Services.AddSingleton<ChineseChess.Api.Game.IGameStore, ChineseChess.Api.Game.InMemoryGameStore>();

var app = builder.Build();

// app.UseHttpsRedirection();
// app.UseStaticFiles();
// app.UseRouting();
// app.UseAuthentication();
// app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // browse at /swagger
}

app.UseCors();
app.MapControllers();

app.MapHub<GameHub>("/hub/game");

// Simple health endpoint to prove it runs
app.MapGet("/", () => "Chinese Chess API is running.");

app.Run();

