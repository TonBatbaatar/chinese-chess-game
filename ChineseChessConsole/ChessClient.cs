// ChessClient.cs
using System;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace ChineseChess
{
    public class ChessClient
    {
        private TcpClient? client;
        private NetworkStream? stream;

        public async Task ConnectAsync(string ip, int port)
        {
            client = new TcpClient();
            await client.ConnectAsync(ip, port);
            stream = client.GetStream();
            Console.WriteLine("Connected to server.");
        }

        public async Task SendMoveAsync(string move)
        {
            if (stream == null) return;
            byte[] buffer = Encoding.UTF8.GetBytes(move);
            await stream.WriteAsync(buffer, 0, buffer.Length);
        }

        public async Task<string?> ReceiveMoveAsync()
        {
            if (stream == null) return null;
            byte[] buffer = new byte[256];
            int bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
            return Encoding.UTF8.GetString(buffer, 0, bytesRead);
        }

        public void Disconnect()
        {
            stream?.Close();
            client?.Close();
        }
    }
}
