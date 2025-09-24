using ChineseChess.Api.Contracts.Replays;
using ChineseChess.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace ChineseChess.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ReplaysController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReplaysController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/replays
    [HttpGet]
    public async Task<ActionResult<PagedResult<ReplayListItemDto>>> Get(
        [FromQuery] ReplayQueryDto q,
        CancellationToken ct)
    {
        var baseQuery = _db.Games.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q.UserId))
        {
            var uid = q.UserId!;
            baseQuery = baseQuery.Where(r => r.CreatorUserId == uid || r.RedUserId == uid || r.BlackUserId == uid);
        }

        if (q.Finished is not null)
            baseQuery = baseQuery.Where(r => r.IsFinished == q.Finished);

        if (!string.IsNullOrWhiteSpace(q.Tc))
        {
            // expect "M|S", e.g. "10|0"
            var parts = q.Tc!.Split('|', 2);
            if (parts.Length == 2 &&
                int.TryParse(parts[0], out var m) &&
                int.TryParse(parts[1], out var s))
            {
                var initial = TimeSpan.FromMinutes(m);
                var increment = TimeSpan.FromSeconds(s);
                baseQuery = baseQuery.Where(r => r.Initial == initial && r.Increment == increment);
            }
        }

        if (q.FromUtc is not null) baseQuery = baseQuery.Where(r => r.CreatedAtUtc >= q.FromUtc);
        if (q.ToUtc is not null) baseQuery = baseQuery.Where(r => r.CreatedAtUtc < q.ToUtc);

        // Sorting
        baseQuery = q.Sort switch
        {
            "CreatedAtUtc" => baseQuery.OrderBy(r => r.CreatedAtUtc),
            "-CreatedAtUtc" => baseQuery.OrderByDescending(r => r.CreatedAtUtc),
            "UpdatedAtUtc" => baseQuery.OrderBy(r => r.UpdatedAtUtc),
            _ => baseQuery.OrderByDescending(r => r.UpdatedAtUtc) // default "-UpdatedAtUtc"
        };

        var total = await baseQuery.CountAsync(ct);

        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);

        // Project lightweight list items WITHOUT deserializing full State/Moves JSON in SQL
        var items = await baseQuery
            .Skip((page - 1) * size)
            .Take(size)
            .Select(r => new ReplayListItemDto(
                r.Id,
                r.RedUserId,
                r.BlackUserId,
                $"{(int)r.Initial.TotalMinutes}|{(int)r.Increment.TotalSeconds}",
                r.IsFinished,
                r.CreatedAtUtc,
                r.UpdatedAtUtc,
                r.MovesJson == "[]" ? 0 : (r.MovesJson.Length - r.MovesJson.Replace(",", "").Length + 1),
                r.Result
            )).ToListAsync(ct);

        return Ok(new PagedResult<ReplayListItemDto>(items, total));
    }

    // GET /api/replays/{id}
    // [HttpGet("{id:guid}")]
    // public async Task<ActionResult<ReplayDetailDto>> GetOne(Guid id, CancellationToken ct)
    // {
    //     var rec = await _db.GameRecords.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
    //     if (rec is null) return NotFound();

    //     var moves = JsonSerializer.Deserialize<List<string>>(rec.MovesJson) ?? new();
    //     var dto = new ReplayDetailDto(
    //         rec.Id,
    //         rec.CreatorUserId,
    //         rec.RedUserId,
    //         rec.BlackUserId,
    //         $"{(int)rec.Initial.TotalMinutes}|{(int)rec.Increment.TotalSeconds}",
    //         rec.IsFinished,
    //         rec.CreatedAtUtc,
    //         rec.UpdatedAtUtc,
    //         rec.StateJson,
    //         moves
    //     );

    //     return Ok(dto);
    // }

    // GET /api/replays/{id}/pgn  (simple Xiangqi-ish export)
    // [HttpGet("{id:guid}/pgn")]
    // public async Task<IActionResult> ExportPgn(Guid id, CancellationToken ct)
    // {
    //     var rec = await _db.GameRecords.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
    //     if (rec is null) return NotFound();

    //     var moves = JsonSerializer.Deserialize<List<string>>(rec.MovesJson) ?? new();

    //     var sb = new StringBuilder();
    //     sb.AppendLine($"[RedUserId \"{rec.RedUserId ?? "Guest"}\"]");
    //     sb.AppendLine($"[BlackUserId \"{rec.BlackUserId ?? "Guest"}\"]");
    //     sb.AppendLine($"[TimeControl \"{(int)rec.Initial.TotalMinutes}|{(int)rec.Increment.TotalSeconds}\"]");
    //     sb.AppendLine($"[Result \"{(rec.IsFinished ? "*" : "?")}\"]");
    //     sb.AppendLine($"[Date \"{rec.CreatedAtUtc:yyyy.MM.dd}\"]");
    //     sb.AppendLine();
    //     sb.AppendLine(string.Join(" ", moves));

    //     var bytes = Encoding.UTF8.GetBytes(sb.ToString());
    //     return File(bytes, "application/x-chess-pgn", $"{rec.Id}.pgn");
    // }

    // OPTIONAL: granular endpoints if your UI streams pieces:
    // GET /api/replays/{id}/moves
    // GET /api/replays/{id}/state
}
