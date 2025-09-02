using System;
using ChineseChess;

class Program
{
    static async Task Main(string[] args)
    {

        Console.WriteLine("Welcome to Chinese Chess Game!");
        Console.WriteLine("Please select game mode:");
        Console.WriteLine("1. Local Game  2. Online game  3.exit");

        var userInput = Console.ReadKey();
        Console.WriteLine("\nYou entered: " + userInput.KeyChar);
        while (userInput.KeyChar != '1' && userInput.KeyChar != '2' && userInput.KeyChar != '3')
        {
            Console.WriteLine("\nPlease input a valid number to continue ...");
            userInput = Console.ReadKey();
            Console.WriteLine("\nYou entered: " + userInput.KeyChar);
        }

        switch (userInput.KeyChar)
        {
            case '1':
                StartNewLocalGame();
                break;
            case '2':
                await StartNewOnlineGame();
                break;
            case '3':
                break;
        }


    }

    private static async Task StartNewOnlineGame()
    {
        Console.WriteLine("\nOnline Mode Selected.");
        Console.Write("Host or Join? (h/j): ");
        var modeKey = Console.ReadKey();
        Console.WriteLine();

        if (modeKey.KeyChar == 'H' || modeKey.KeyChar == 'h')
        {
            await StartOnlineGameAsHost();
        }
        else if (modeKey.KeyChar == 'J' || modeKey.KeyChar == 'j')
        {
            await StartOnlineGameAsClient();
        }
        else
        {
            Console.WriteLine("Invalid choice.");
        }
    }

    private static async Task StartOnlineGameAsHost()
    {
        ChessServer server = new ChessServer();
        await server.StartAsync(5000);

        Board board = new Board();
        board.InitializeLocalBoard();

        while (!board.IsGameOver())
        {
            Console.Clear();
            board.PrintBoard();
            Console.WriteLine("\nYou (Red) move:");

            (int fromRow, int fromCol) from;
            (int toRow, int toCol) to;

            while (true)
            {
                Console.Write("Enter move (e.g. A3 B3): ");
                string input = Console.ReadLine() ?? "";

                if (TryParseMove(input, out from, out to))
                {
                    Piece movingPiece = board.Grid[from.fromRow, from.fromCol];
                    if (movingPiece.Owner != board.CurrentPlayer)
                    {
                        Console.WriteLine("You can only move your own pieces.");
                        continue;
                    }

                    if (board.MovePiece(from.fromRow, from.fromCol, to.toRow, to.toCol))
                    {
                        await server.SendMoveAsync(input);
                        break;
                    }
                    else
                    {
                        Console.WriteLine("Invalid move. Try again.");
                    }
                }
                else
                {
                    Console.WriteLine("Invalid input format.");
                }
            }

            board.SwitchPlayer();

            Console.WriteLine("Waiting for opponent move...");
            string opponentMove = await server.ReceiveMoveAsync() ?? "";

            if (!TryParseMove(opponentMove, out from, out to))
            {
                Console.WriteLine("Received invalid move from client.");
                break;
            }

            board.MovePiece(from.fromRow, from.fromCol, to.toRow, to.toCol);
            board.SwitchPlayer();
        }

        Console.Clear();
        board.PrintBoard();
        Console.WriteLine($"{board.CurrentPlayer.Color} is checkmated. Game over.");
        server.Stop();
    }

    private static async Task StartOnlineGameAsClient()
    {
        ChessClient client = new ChessClient();

        Console.Write("Enter host IP (e.g. 127.0.0.1): ");
        string ip = Console.ReadLine() ?? "";

        await client.ConnectAsync(ip, 5000);

        Board board = new();
        board.InitializeLocalBoard();

        while (!board.IsGameOver())
        {
            Console.WriteLine("Waiting for host's move...");
            string hostMove = await client.ReceiveMoveAsync() ?? "";

            if (!TryParseMove(hostMove, out var from, out var to))
            {
                Console.WriteLine("Received invalid move.");
                break;
            }

            board.MovePiece(from.fromRow, from.fromCol, to.toRow, to.toCol);
            board.SwitchPlayer();

            Console.Clear();
            board.PrintBoard();
            Console.WriteLine("\nYour turn (Black):");

            while (true)
            {
                Console.Write("Enter move (e.g. A3 B3): ");
                string input = Console.ReadLine() ?? "";

                if (TryParseMove(input, out from, out to))
                {
                    Piece movingPiece = board.Grid[from.fromRow, from.fromCol];
                    if (movingPiece.Owner != board.CurrentPlayer)
                    {
                        Console.WriteLine("You can only move your own pieces.");
                        continue;
                    }

                    if (board.MovePiece(from.fromRow, from.fromCol, to.toRow, to.toCol))
                    {
                        await client.SendMoveAsync(input);
                        break;
                    }
                    else
                    {
                        Console.WriteLine("Invalid move. Try again.");
                    }
                }
                else
                {
                    Console.WriteLine("Invalid input format.");
                }
            }

            board.SwitchPlayer();
        }

        Console.Clear();
        board.PrintBoard();
        Console.WriteLine($"{board.CurrentPlayer.Color} is checkmated. Game over.");
        client.Disconnect();
    }


    private static void StartNewLocalGame()
    {
        Board board = new Board();
        board.InitializeLocalBoard();

        while (!board.IsGameOver())
        {
            Console.Clear();
            board.PrintBoard();

            Console.WriteLine($"\n{board.CurrentPlayer.Color}'s turn.");

            (int fromRow, int fromCol) from;
            (int toRow, int toCol) to;

            while (true)
            {
                Console.Write("Enter move (e.g. A3 B3): ");
                string input = Console.ReadLine() ?? "";

                if (TryParseMove(input, out from, out to))
                {
                    Piece movingPiece = board.Grid[from.fromRow, from.fromCol];
                    Console.Write($"moving {from.fromRow}, {from.fromCol} , test code");
                    if (movingPiece.Owner != board.CurrentPlayer)
                    {
                        Console.WriteLine("You can only move your own pieces.");
                        continue;
                    }

                    if (board.MovePiece(from.fromRow, from.fromCol, to.toRow, to.toCol))
                        break;
                    else
                        Console.WriteLine("Invalid move. Try again.");
                }
                else
                {
                    Console.WriteLine("Invalid format. Use e.g. A3 B3");
                }
            }

            // Switch player
            board.SwitchPlayer();
        }

        Console.Clear();
        board.PrintBoard();
        Console.WriteLine($"\nGame Over! {board.CurrentPlayer.Color} is checkmated.");
    }

    private static bool TryParseMove(string input, out (int fromRow, int fromCol) from, out (int toRow, int toCol) to)
    {
        from = (-1, -1);
        to = (-1, -1);

        string[] parts = input.Trim().ToUpper().Split();
        if (parts.Length != 2 || parts[0].Length != 2 || parts[1].Length != 2)
            return false;

        if (TryParseCoordinate(parts[0], out from) && TryParseCoordinate(parts[1], out to))
            return true;

        return false;
    }

    private static bool TryParseCoordinate(string coord, out (int row, int col) pos)
    {
        pos = (-1, -1);

        if (coord.Length < 2 || coord.Length > 3)
            return false;


        char colChar = coord[0];
        string rowPart = coord.Substring(1);

        if (colChar < 'A' || colChar > 'I') return false;

        if (!int.TryParse(rowPart, out int rowNum)) return false;
        if (rowNum < 1 || rowNum > 10) return false;

        int col = colChar - 'A';
        int row = rowNum - 1; // 1-based to 0-based

        pos = (row, col);
        return true;
    }
}
