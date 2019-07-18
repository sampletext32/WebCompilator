using WebSocketSharp;
using WebSocketSharp.Server;

namespace WebCompilator
{
    //класс веб обработчик запросов
    class OnlineCompilatorWebSocketBehaviour : WebSocketBehavior
    {
        private CompilerExecutor compilerExecutor; //экземпляр компилятора-менеджера

        protected override async void OnMessage(MessageEventArgs e) //обработка сообщений от клиента
        {
            string data = e.Data; //копируем данные

            string command = data.Substring(1, data.IndexOf("]") - 1); //выбираем тип сообщение

            switch (command)
            {
                case "run": //если команда запуска
                {
                    string code = data.Substring(command.Length + 2); //вырезаем только код

                    //запускаем компиляцию, все сообщение переправляем на отправку клиенту
                    await compilerExecutor.Compile(code, Send);
                    //запускаем выполнение, все сообщения переправляем в отправку клиенту, по окончанию выполнения отправляем Finished
                    await compilerExecutor.StartExecution(Send, () => { Send("Finished"); });

                    break;
                }
                case "input"://когда приходит сообщение от пользователя
                {
                    //если сейчас запущено выполнение программы
                    if (compilerExecutor != null && compilerExecutor.Running())
                    {
                        string userInput = data.Substring(command.Length + 2);//вырезаем данные от пользователя
                        compilerExecutor.WriteToExe(userInput);//отправляем их в запущенное приложение
                    }

                    break;
                }
            }
        }

        protected override void OnOpen()//когда открывается соединение с клиентом
        {
            compilerExecutor = new CompilerExecutor();
        }

        protected override void OnClose(CloseEventArgs e)//когда закрывается соединение
        {
            //если запущено выполнение
            if (compilerExecutor != null && compilerExecutor.Running())
            {
                compilerExecutor.ForceQuit();//форсированно закрываем приложение
            }
        }

        protected override void OnError(ErrorEventArgs e)//когда происходит ошибка соединения
        {
            //если запущено выполнение
            if (compilerExecutor != null && compilerExecutor.Running())
            {
                compilerExecutor.ForceQuit();//форсированно закрываем приложение
            }
        }
    }
}