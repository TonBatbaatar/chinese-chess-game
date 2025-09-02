using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace ChineseChess
{
    public class ChessServer
    {
        private TcpListener? listener;
        private TcpClient? client;
        private NetworkStream? stream;

        public async Task StartAsync(int port)
        {
            listener = new TcpListener(IPAddress.Any, port);
            listener.Start();
            Console.WriteLine($"Server started on port {port}. Waiting for a client...");

            client = await listener.AcceptTcpClientAsync();
            stream = client.GetStream();
            Console.WriteLine("Client connected.");
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

        public void Stop()
        {
            stream?.Close();
            client?.Close();
            listener?.Stop();
        }
    }
}
