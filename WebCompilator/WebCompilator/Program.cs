using System;
using System.CodeDom.Compiler;
using System.Diagnostics;
using System.IO;
using System.Linq;
using WebSocketSharp.Server;

namespace WebCompilator
{
    class Program
    {
        static void Main()
        {
            var webSocketServer = new WebSocketServer("ws://localhost");//создаём сервер
            webSocketServer.AddWebSocketService<OnlineCompilatorWebSocketBehaviour>("/compiler");//добавляем ему поведение на поддомене

            webSocketServer.Start();//запускаем
            Console.WriteLine("Server Is Running");

            Console.ReadKey();
            webSocketServer.Stop();
            Console.WriteLine("Server Stopped");
        }
    }
}