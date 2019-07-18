using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace WebCompilator
{
    //класс-обёртка над компилятором - исполнителем
    class CompilerExecutor
    {
        //путь к исполняемому файлу
        string exePath = Path.Combine(Environment.CurrentDirectory, "Builds\\compiled.exe");
        
        private StreamWriter toExeWriter;//потоковый писатель в класс
        private bool running;//флаг работы программы
        private Process p;//запущенный процесс

        //обёртка показателя запуска программы
        public bool Running()
        {
            return running;
        }
        
        //обёртка над вводом в программу
        public void WriteToExe(string input)
        {
            toExeWriter.WriteLine(input);
        }

        //обёртка над закрытием программы
        public void ForceQuit()
        {
            p.Kill();
        }

        //запуск программы (асинхронная задача)
        public async Task StartExecution(Action<string> onMessage, Action onEnd)
        {
            //создаём процесс
            p = new Process();
            ProcessStartInfo psi = new ProcessStartInfo(exePath)
            {
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardInput = true,
                RedirectStandardOutput = true
            };
            p.StartInfo = psi;
            p.Start();//запускаем программу

            toExeWriter = p.StandardInput;//перегружаем ввод программы

            p.OutputDataReceived += (sender, args) =>
            {
                onMessage.Invoke(args.Data);//когда приходят данные от приложения, отправляем их во внешний обработчик
            };
            p.BeginOutputReadLine();//запускаем перегрузку вывода

            running = true;

            //запускаем задачу по ожиданию завершения приложения
            await Task.Run(() =>
            {
                p.WaitForExit();
                running = false;
                toExeWriter.Close();
            });
            onEnd.Invoke();//уведомляем о завершении
        }

        //асинхронная задача компиляции программы из кода(дополнительный логгер выполнения
        public async Task Compile(string code, Action<string> logger)
        {
            if (!Directory.Exists("Builds"))
            {
                Directory.CreateDirectory("Builds");//если нет папки Builds, создать её
            }
            
            //параметры компиляции
            CompilerParameters parameters = new CompilerParameters
            {
                GenerateExecutable = true,
                OutputAssembly = exePath,
                GenerateInMemory = false,
                TreatWarningsAsErrors = false
            };

            //запускаем задачу компиляции
            await Task.Run(() =>
            {
                CodeDomProvider provider = CodeDomProvider.CreateProvider("CSharp");//создаём провайдер структуры кода
                CompilerResults compileResult = provider.CompileAssemblyFromSource(parameters, code);//компилируем программу из исходного кода

                if (compileResult.Errors.Count == 0)//Если ошибок нет
                {
                    logger.Invoke("Built successfully.");
                }
                else//если ошибки есть
                {
                    string errorsString = "";
                    foreach (CompilerError ce in compileResult.Errors)
                    {
                        errorsString += "   " + ce.ErrorText + "\n";//соединяем все ошибки в строку
                    }

                    logger.Invoke("Errors building \n " + errorsString);//уведомляем об ошибке
                }
            });
        }
    }
}