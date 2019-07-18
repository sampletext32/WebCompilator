
//массив всех ключевых слов C#
var code_keywords = ["abstract", "async", "const", "event", "extern", "new", "override", "partial", "readonly", "sealed", "static", "unsafe", "virtual", "volatile", "public", "private", "protected", "internal", "if", "else", "switch", "case", "do", "for", "foreach", "in", "while", "break", "continue", "default", "goto", "return", "yield", "throw", "try", "catch", "finally", "checked", "unchecked", "fixed", "lock", "params", "ref", "out", "base", "this", "using", "operator", "namespace", "null", "false", "true", "value", "void", "as", "await", "is", "new", "sizeof", "typeof", "stackalloc", "checked", "unchecked", "add", "var", "dynamic", "global", "set", "value", "bool", "byte", "char", "class", "decimal", "double", "enum", "float", "int", "long", "sbyte", "short", "string", "struct", "uint", "ulong", "ushort", "from", "where", "select", "group", "into", "orderby", "join", "let", "in", "on", "equals", "by", "ascending", "descending"];


$(document).ready(function () {
    init();
    updateCounter();
    terminal.clear();

    window.setInterval(function () {
        if ($('#console_input').attr('placeholder') == '_') {
            $('#console_input').attr('placeholder', '');

        }
        else {
            $('#console_input').attr('placeholder', '_')
        }
    }, 500);

});

$(window).resize(function () {
    updateCounter();
    if ($('.modal_help').css('display') == 'block') displayModal();


});

$('#input_code').focusout(function () {
    highLight();//при потере фокуса - подсветить код
});

//функция проверки является ли символ буквой
function isletter(c)
{
	return c.toLowerCase() != c.toUpperCase();
}

//функция проверки является ли символ цифрой
function isNumber(c) {
    return /\d/.test(c);
}

//функция проверки является ли символ буквой или цифрой
function isLetterOrNumber(c)
{
	return isletter(c) || isNumber(c);
}

var last_word = "";//последнее введённое слово

//функция обработки нажатия клавиш в поле для ввода кода
function processInput(evt) {  
	var charCode = evt.which;//код символа
	var ch = String.fromCharCode(charCode);//конвертируем в символ
	if(!isLetterOrNumber(ch) && !(event.keyCode == 8 || event.keyCode == 46))//если это не буква и не цифра, и это не Backspace или Enter
	{		
		showHints();//показываем подсказки
		last_word = "";//очищаем слово
	}
	else if(isLetterOrNumber(ch))//если это буква или цифра
	{
		//добавляем символ к слову
		last_word += ch;
		last_word = last_word.toLowerCase();
		showHints();//показываем подсказки
	}
	else if(event.keyCode == 8|| event.keyCode == 46)//если это Backspace
	{
		last_word = last_word.substring(0, last_word.length - 1);//удаляем последний символ из  строки
		showHints();//показываем подсказки
		return false;//прерываем дальнейшую обработку нажатия
	}
}

//функция показа подсказок
function showHints()
{
	if(last_word.length == 0)//если слово не существует
	{
		hideModal();//скрываем подсказки
		return;
	}
	var useable_keywords = []; //создаём подходящие слова
	for(var i = 0;i < code_keywords.length;i++)
	{
		if(code_keywords[i].startsWith(last_word))
		{
			useable_keywords.push(code_keywords[i]);//выбираем все ключевые слова, которые начинаются с введённого			
		}
	}
	for(var i = 0;i < useable_keywords.length && i < 3;i++)
	{
		$("#elem_" + (i+1)).html(useable_keywords[i]);//выводим первые 3 подходящих слова или меньше
	}
	
	for(var i = useable_keywords.length;i < 3;i++)
	{
		$("#elem_" + (i+1)).html("");//остальные оставляем пустыми
	}
	displayModal();//показываем подсказки
}

//функция обработки количества строк
function updateCounter() {
    var lh = 20;//высота строки
    var lines = $("#input_code").css('height').replace('px', '') / lh;//количество строк
    $(".line").remove();//удаляем строки
    $(".line_counter_container").css('height', $("#input_code").css('height'));//высота контейнера равна высоте блока кода

    var counter_container_width = $(".line_counter_container").css('width').replace('px', '');//ширина контейнера

    for (var i = 1; i <= lines; i++) {
        if (i > 9 && counter_container_width < 12) //если строка 10 и более, а ширина контейнера меньше 12, выводим * вместо самой цифры
		{
			$(".line_counter_container").append('<span class="line" id="line_' + i + '">*</span>');
		}
        else 
		{
			$(".line_counter_container").append('<span class="line" id="line_' + i + '">' + i + '</span>');
		}
    }

}


/* подсветка синтаксиса */


//функция подсветки синтаксиса
function highLight()
{
	var code = $("#input_code").html().replace(/<\/?span[^>]*>/g,"");//удаляем все теги HTML из кода
	
	var regex = new RegExp("("+code_keywords.join('|')+")([^a-z0-9\$_])", "gi");//соединяем регулярное выражение из массива ключевых слов
	code = code
	.replace(regex,	'<span class="code_kwrd">$1</span>$2')//заменяем ключевые слова
	.replace(/(\{|\}|\]|\[|\|)/gi,'<span class="code_kwrd">$1</span>')//заменяем фигурные и квадратные скобки
	.replace(/(\/\/[^\n\r]*(\n|\r\n))/g,'<span class="code_comm">$1</span>')//заменяем комментарии
	// строки
	.replace(/('.*?')/g,'<span class="code_str">$1</span>')//заменяем строковые литералы
	.replace(/([a-z\_\$][a-z0-9_]*)\(/gi,'<span class="code_func">$1</span>(')//заменяем названия функций и переменных
	.replace(/\t/g,'    ');//заменяем \t на табуляцию

	$("#input_code").html(code);//выставляем код в редактируемое поле
}



//функция показа окна подсказок
function displayModal() {
    var pos = $('#input_code').offset();

    var width = $('.modal_help').css('width').replace('px', '');
    var widthC = $('.line_counter_container').css('width').replace('px', '');
    pos.left -= (parseInt(width) + parseInt(widthC));
    $('.modal_help').offset(pos);

    $('.modal_help').fadeIn().show(0);
}

function hideModal() {
    $('.modal_help').fadeOut(0);
}


/* ТЕРМИНАЛ */

//создаём WebSocket для общения с сервером

var socket = new WebSocket("ws://localhost/compiler");
var socketConnected = false;//флаг подключения
socket.onopen = function () {
	socketConnected = true;//теперь подключены
};
socket.onclose = function (event) {        
		socketConnected = false;//теперь не подключены
		terminal.log('Соединение разорвано', 1);
};
socket.onmessage = function (event) {
		terminal.log(event.data, 1);//выводим сообщение в терминал
};
socket.onerror = function (error) {
	//ошибку никак не обрабатываем
};

//объект терминала
var terminal = {
	//функция записи строки в терминал
    log: function (text, direction = -1) {
        var dir = 'out';
        var dirS = '>';
        if (direction == 1) {
            dir = 'in';
            dirS = '<';
        }

        $("#terminal").append('<span class="command ' + dir + '"><b>' + dirS + '</b>' + text + '</span>');
    },

	//функция очистки терминала
    clear: function () {
        $('.command').remove();
        terminal.log('Console loaded. Welcome!');
    },

	//событие отправки команды из строки ввода
    onCommandSent: function (command) {
        // здесь пишешь то, что выполняется при отправке команды в терминал
		if(socketConnected)
		{
			socket.send('[input]' + command);
		}
    },

	//обработка нажатия клавиш в поле ввода консоли
    updateKeys: function (event) {
        if (event.keyCode == 13) //если это Enter
		{
            var cmd = $('#console_input').val();
            terminal.log(cmd, 1);
            terminal.onCommandSent(cmd);
            $('#console_input').val('');
        }
    }
};

//функция запуска кода
function runCode(code) {
    // вызывается после нажатия "Run code"
    //alert(code);    
    if(socketConnected)//если подключены к серверу
	{
		socket.send('[run]' + code);//отправляем код на сервер
	}
}