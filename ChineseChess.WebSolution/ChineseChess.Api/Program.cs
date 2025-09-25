using ChineseChess.Api.Data;
using ChineseChess.Api;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ChineseChess.Api.Game;
using Microsoft.AspNetCore.HttpOverrides;

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

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.None;           // allow cross-site
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS only
    // Optional (nice for SPA): return 401/403 instead of HTML redirects
    options.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
    options.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
});

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

var allowedOrigins = new[]
{
    "https://ashy-grass-0231f1603.2.azurestaticapps.net",
    "http://localhost:5173"
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCors", p => p
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()); // needed for cookies/SignalR with cookies
});

// Game Services: Register in-memory game store
builder.Services.AddSingleton<BoardSerializer>();  // helper
builder.Services.AddScoped<IGameStore, PersistentGameStore>();


var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseRouting();

app.UseCors("FrontendCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<GameHub>("/hub/game");

// Simple health endpoint to prove it runs
app.MapGet("/", () => "Chinese Chess API is running.");

app.Run();

