namespace ChineseChess.Api;

public class SessionNotFoundException : Exception
{
    public SessionNotFoundException(Guid id)
        : base($"Session {id} was not found.") { }
}