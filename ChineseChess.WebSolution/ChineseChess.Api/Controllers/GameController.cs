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
    public ActionResult<CreateGameResponse> Create()
    {
        var session = _store.CreateLocal();
        var boardDto = BoardMapper.ToDto(session.Board);
        return Ok(new CreateGameResponse(session.Id, session.CurrentTurn, boardDto));
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
