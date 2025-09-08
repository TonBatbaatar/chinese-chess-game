// ChineseChess.Api/Controllers/GamesController.cs
using ChineseChess.Api.Contracts;
using ChineseChess.Api.Game;
using ChineseChess.Api.Mapping;
using Microsoft.AspNetCore.Mvc;

namespace ChineseChess.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameStore _store;

    public GamesController(IGameStore store) => _store = store;

    // POST api/games
    [HttpPost]
    public ActionResult<CreateGameResult> Create()
    {
        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var session = _store.CreateLocal(userId);

        // Assign creator as Red (connection-based seat happens in Hub, but here we mimic it)
        session.RedUserId = userId;

        var boardDto = BoardMapper.ToDto(session.Board);

        return Ok(new CreateGameResult(session.Id, session.Board.CurrentPlayer.Color.ToString(), boardDto, "Red"));
    }

    // GET api/games/{id}
    [HttpGet("{id:guid}")]
    public ActionResult Get(Guid id)
    {
        var session = _store.Get(id);
        if (session is null) return NotFound();

        var boardDto = BoardMapper.ToDto(session.Board);
        return Ok(boardDto);
    }

    // POST api/games/{id}/moves
    [HttpPost("{id:guid}/moves")]
    public ActionResult<MoveResponse> Move(Guid id, [FromBody] MoveRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.From) || string.IsNullOrWhiteSpace(req.To))
            return BadRequest(new MoveResponse(false, "From/To required.", null));

        if (!_store.TryApplyMove(id, req.From, req.To, out var error))
            return BadRequest(new MoveResponse(false, error, null));

        var session = _store.Get(id)!;
        var boardDto = BoardMapper.ToDto(session.Board);
        return Ok(new MoveResponse(true, null, boardDto));
    }
}
