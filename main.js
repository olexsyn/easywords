//$(document).ready(function () {

//var version = 151122;

/*

ToDo in README.md

JSON:

"wrd": -> foreing WoRD
"key": -> KEYs
"ts1": -> TranScription 1
"ts2": -> TranScription 2
"exm": -> EXaMples (todo)
"trn": -> TRaNslation of word

*/


// создаем объект для HTTP запроса.
var xhr = new XMLHttpRequest();

// настройка объекта для отправки синхронного (false) GET запроса
xhr.open("GET", "dictionary.json", false);

// отправка запроса, т.к. запрос является синхронным, то следующая строка кода
// выполнится только после получения ответа со стороны сервера
xhr.send();

var dict, dkeys;

// все ок?
if (xhr.status == 200)
{
	// responseText - текст ответа полученного с сервера - парсим, так как это JSON
	var data = JSON.parse(xhr.responseText);
	dict  = data.words;
	dkeys = data.keys;
}
else
{
	alert("возникли поблемы при загрузке файла");
}

// копируем слова из словаря ( words = dict // это будет ссылка!!! )
var words = [];    // загружаем слова
var mistake = -1;  // не удалять слово: юзер ошибся
var usehelp = -1;  // не удалять слово: юзер использовал помощь

// ------------------------------------------------------
// $ вместо document.getElementById
// ------------------------------------------------------
function $(id) {
	return document.getElementById(id);
}

window.onload = function()
{
	printLists();  // генерируем список тем
	toggleList();  // прячем список тем

	// тема по-умолчанию:
	var def_them = 'basic';
	addWords( def_them );
	$('ch_' + def_them).checked = "checked";
	getWord();     // выбрать и отобразить слово

	// кнопка Готово
	var but_ready = $("but_ready");
	but_ready.onclick = getAnsw;

	// кнопка Подсказка
	var but_help = $("but_help");
	but_help.onclick = toHelp;

	// кнопка Пропустить
	var but_next = $("but_next");
	but_next.onclick = toNext;

	// кнопка Еще слово
	var but_getword = $("but_getword");
	but_getword.onclick = getWord;

	// нажатие Enter в поле ввода
	var inp_answ = $("inp_answ");
	inp_answ.onkeydown = function(event) {
		var code = event.keyCode ? event.keyCode : event.which;
		if (code === 13)
		{
			getAnsw();
			return false;
		}
	};

	// иконка Списки слов
	var ico_list = $("ico_list");
	ico_list.onclick = toggleList;

	// иконка Выбрать все
	var ico_checked = $("ico_checked");
	ico_checked.onclick = checkBoxesChecked;

	// иконка Сбросить все
	var ico_none = $("ico_none");
	ico_none.onclick = checkBoxesNone;

	// иконка Инвертировать
	var ico_inverse = $("ico_inverse");
	ico_inverse.onclick = checkBoxesInverse;
};

// ------------------------------------------------------
// обработчик иконки Списки тем
// ------------------------------------------------------
function toggleList()
{
	// показываем/скрываем список тем
	var list = $("list");
	list.style.display = (list.style.display == 'none') ? '' : 'none';

	// показываем/скрываем иконки для списка тем
	var toolbar = $("toolbar");
	toolbar.style.display = (toolbar.style.display == 'none') ? '' : 'none';
}

// ------------------------------------------------------
// обработчик иконки Выбрать все
// ------------------------------------------------------
function checkBoxesChecked()
{
	setCheckboxes('checked');
	getWord();
}

// ------------------------------------------------------
// обработчик иконки Сбросить все
// ------------------------------------------------------
function checkBoxesNone()
{
	setCheckboxes('none');
	getWord();
}

// ------------------------------------------------------
// обработчик иконки Инвертировать
// ------------------------------------------------------
function checkBoxesInverse()
{
	setCheckboxes('inverse');
	getWord();
}

// ------------------------------------------------------
// выбирает из списка слово и отображает его
// отображает/прячет необходимые елементы
// ------------------------------------------------------
function getWord()
{
	var words_length = words.length;

	if (words_length)
	{
		// если есть слова
		// выбираем случайный эл-т массива
		var rand_id = Math.floor( Math.random() * words_length );

		$('inp_answ').value = '';
		$('but_getword').style.display = 'none';
		$('inp_idword').value = rand_id;
		$('inp_answ').style.display = '';
		$('block_word').innerHTML = parseRus( words[rand_id]['trn'] );
		$('block_answ').innerHTML = "";
		$('count_left').innerHTML = words_length;
		$('but_ready').style.display = '';
		$('but_help').style.display = '';
		$('but_next').style.display = '';
		$('inp_answ').focus();
	}
	else
	{
		// слов нет
		setCheckboxes('none');
		$('but_getword').style.display = 'none';
		$('inp_answ').value = '';
		$('inp_answ').style.display = 'none';
		$('but_ready').style.display = 'none';
		$('but_help').style.display = 'none';
		$('but_next').style.display = 'none';
		if ($("list").style.display == 'none') toggleList();  // открыть списки тем, если закрыты
		$('block_word').innerHTML = "Слова закончились!";
		$('block_answ').innerHTML = "<small>Выбери один или несколько списков слов, чтобы продолжить.</small>";
		$('count_left').innerHTML = "0";
	}

}

// ------------------------------------------------------
// принимает ответ юзера и отображает ответ
// ------------------------------------------------------
function parseRus(text)
{

	var pattern = /\((.+?)\)/g; // g - глобальный поиск - все вхождения, а не только первое.
	var result = text.replace(pattern, "<small>$&</small>");

	return result;
}

// ------------------------------------------------------
// принимает ответ юзера и отображает ответ
// ------------------------------------------------------
function getAnsw()
{
	// скрываем список тем и кнопки, если открыты
	if ($("list").style.display == '') toggleList();

	var obj_block_answ = $('block_answ');
	var idword = $('inp_idword').value;
	var obj_user_answ = $('inp_answ');
	var dict_word = words[idword]['wrd'];
	var Ok = false;

	if ( dict_word.indexOf('|') )
	{

		var pattern = /\|/g; // g - глобальный поиск - все вхождения, а не только первое.
		var dict_word = dict_word.replace(pattern, " | ");
		// возможно несколько вариантов ответа
		var arr_words = dict_word.split(' | ');
		var len = arr_words.length;
		for (var i=len; i--; )
		{
			if ( arr_words[i] == obj_user_answ.value )
			{
				Ok = true;
				break;
			}
		}
	}
	else
	{
		// только один возможный ответ
		if ( dict_word == obj_user_answ.value ) Ok = true;
	}

	if ( Ok )
	{
		// словарное слово соответствует ответу пользователя
		// получаем транскрипцию
		var transcr = getTrans(idword);

		obj_block_answ.innerHTML = "<span class=\"succ\">Да!</span> <strong>" + dict_word + "</strong> &nbsp;"
								+ transcr
								+ link2WR( dict_word ); // ссылка на wordreference.com

		// если ответ изначально был правильным mistake == -1 и != idword
		// и юзер не пользовался помощью usehelp == -1 и != idword
		if ( mistake != idword && usehelp != idword)
		{
			// удаляем слово из массива
			// console.log('delete word ' + words[idword]['wrd']);
			words.splice(idword,1);
		}
		else
		{
			// юзер либо отвечал неправильно на это слово,
			// либо пользовался помощью
			// не удаляем, но сбрасываем флаги неудалений
			// в следующий раз удалить, если ответ будет правильным
			if (mistake == idword) mistake = -1;
			if (usehelp == idword) usehelp = -1;
		}

		$('count_left').innerHTML = words.length;
		$('but_getword').style.display = '';
		$('but_ready').style.display = 'none';
		$('but_help').style.display = 'none';
		$('but_next').style.display = 'none';
		$('but_getword').focus();
	}
	else
	{
		// словарное слово не соответствует ответу пользователя
		obj_block_answ.innerHTML = "<span class=\"err\">Не-а!</span> Вспоминай...";
		obj_user_answ.focus();
		// указываем индекс слова, как пока не удаляемого (ответил неправильно)
		mistake = idword;
	}

}

// ------------------------------------------------------
// обработчик кнопки Подсказка
// ------------------------------------------------------
function toHelp()
{
	// получаем id слова из скрытого поля
	var idword = $('inp_idword').value;
	var dict_word = words[idword]['wrd'];

	// показываем подсказку
	if ( dict_word )
	{
		if ( dict_word.indexOf('|') )
		{
			var pattern = /\|/g; // g - глобальный поиск - все вхождения, а не только первое.
			var dict_word = dict_word.replace(pattern, " | ");
		}

		var transcr = getTrans(idword);
		$('block_answ').innerHTML = "Ответ: <strong>" + dict_word
				+ '</strong> &nbsp;'
				+ transcr
				+ link2WR( dict_word ); // ссылка на wordreference.com
	}
	else
	{
		alert('Извините, перевод не найден. Нажмите "Пропустить"');
	}
	// указываем индекс слова, как пока не удаляемого (пользовался помощью)
	usehelp = idword;
	$('inp_answ').focus();
}

// ------------------------------------------------------
// обработчик кнопки Пропустить
// ------------------------------------------------------
function toNext()
{
	// получаем id слова из скрытого поля
	var idword = $('inp_idword').value;
	// удаляем из списка
	words.splice(idword,1);
	$('count_left').innerHTML = ''; // ?? почему-то, без этого обнуления не записывалось новое значение в getWord();
	// новое слово
	getWord();
}

// ------------------------------------------------------
// собирает ключи списков и и кол-во слов в списках
// ------------------------------------------------------
function getLists()
{
	// хэш, который после одного прохода по масиву будет содержать уникальные ключи,
	// значением которых будет кол-во встреченных повторений
	var list = {};

	var dictlen = dict.length;
	for ( var i = dictlen; i--; )
	{
		var keys = dict[i]['key'].split('|');
		var keyslen = keys.length;
		for (var j = keyslen; j--; )
		{
			var key = keys[j];

			if ( list[key] == null )
			{
				list[key] = 1;
			}
			else
			{
				list[key] += 1;
			}
		}

	}

	return list;
}

// ------------------------------------------------------
// генерирует строку ссылок на онлайн словарь
// ------------------------------------------------------
function link2WR( word )
{
	var link = '<br /><small>(словарь: ';

	if ( word.indexOf(' ') )
	{
		// фраза (несколько слов)
		var dict_words = word.split(' ');
		var dwordslen = dict_words.length;
		for (var k=0; k<dwordslen; k++ )
		{
			if (dict_words[k] != '|')
			{
				link += '<a href="http://www.wordreference.com/enru/'
					 + dict_words[k]
					 + '" target="_blank">' + dict_words[k] + '</a>';
				// знак + между словами
				if (k+1 < dwordslen) link += ' + ';
			}
		}
	}
	else
	{
		// одно слово
		link = '<a href="http://www.wordreference.com/enru/' + word + '" target="_blank">' + word + '</a>';
	}

	return link + ')</small>';
}


// ------------------------------------------------------
// выводит в разметку списки тем
// ------------------------------------------------------
function printLists()
{
	var list = getLists();
	var str = '';

	for (var key in list)
	{
		str += '<input type="checkbox" id="ch_' + key + '" class="ch" value="' + key + '" onclick="togLI(this)" />'
			+ '<label for="ch_' + key + '">'
			+ dkeys[key] + '</label> - [' + list[key]+ ' сл.]<br/>';
	}

	$('list').innerHTML = str;
}


// ------------------------------------------------------
//
// ------------------------------------------------------
function setCheckboxes( state )
{
	// выбираем код div'а list
	var checks_list = $('list');
	// из полученного кода выбираем импуты (чекбоксы)
	var checks = checks_list.getElementsByTagName('input');
	var checkslen = checks.length;
	for (var i=checkslen; i--;)
	{
		switch (state)
		{
			case 'none':
				if ( checks[i].checked )
				{
					checks[i].checked = '';
					remWords( checks[i].value );
				}
			break;

			case 'checked':
				if ( !checks[i].checked )
				{
					checks[i].checked = 'checked';
					addWords( checks[i].value );
				}
			break;

			case 'inverse':
				if ( checks[i].checked )
				{
					checks[i].checked = '';
					remWords( checks[i].value );
				}
				else
				{
					checks[i].checked = 'checked';
					addWords( checks[i].value );
				}
			break;
		}

	}
}

// ------------------------------------------------------
// добавляет в список слова указанной темы
// ------------------------------------------------------
function addWords( key )
{
	var dictlen = dict.length;
	for ( var i=dictlen; i--; )
	{
		var keys = dict[i]['key'].split('|');
		var keyslen = keys.length;
		for (var j=keyslen; j--; )
		{
			if ( keys[j] === key )
			{
				// добавляем только одинарный ключ
				words.push( { 	key: key,
								wrd: dict[i]['wrd'] ,
								ts1: dict[i]['ts1'] ,
								ts2: dict[i]['ts2'] ,
								trn: dict[i]['trn'] } );
			}
		}
	}
}

// ------------------------------------------------------
// удаляет из списка слова указанной темы
// ------------------------------------------------------
function remWords( key )
{
	var wordslen = words.length;
	for ( var i=wordslen; i--; )
	{
		if ( words[i]['key'] === key )
		{
			words.splice(i,1);
		}
	}
}


// ------------------------------------------------------
// Toggle List Item
// ------------------------------------------------------
function togLI(checkbox)
{
	$('count_left').innerHTML = '';

	if (checkbox.checked)  { addWords(checkbox.value) }
	else                   { remWords(checkbox.value) }

	getWord();
}

// ------------------------------------------------------
// Получить транскрипцию слова по idword
// ------------------------------------------------------
function getTrans(idword)
{
	var ret = '';

	var itrtr = ( words[idword]['ts2'] ) ? words[idword]['ts2'] : '';
	if (itrtr)
	{
		ret = "[" + itrtr + "] ";
	}

	var transcr = ( words[idword]['ts1'] ) ? words[idword]['ts1'] : '';
	if (transcr)
	{
		// здесь изменяем написание "Р" (почти нечитаемая "r")
		do
		{
			var pos = transcr.indexOf('Р');
			if (pos > 0)
			{
				// вместо большой Р вставляем маленькую с тэгами
				transcr = transcr.substring(0,pos) + "<sub><em>р</em></sub>" + transcr.substring(pos+1);
			}

		} while (pos > 0);

		// здесь изменяем написание "Г" (инговое окончание)
		do
		{
			var pos = transcr.indexOf('Г');
			if (pos > 0)
			{
				// вместо большой Г вставляем маленькую с тэгами
				transcr = transcr.substring(0,pos) + "<sub><em>г</em></sub>" + transcr.substring(pos+1);
			}

		} while (pos > 0);

		// здесь изменяем написание "'" (апостроф на знак ударения)
		do
		{
			var pos = transcr.indexOf("'");
			if (pos > 0)
			{
				transcr = transcr.substring(0,pos) + "́" + transcr.substring(pos+1);
			}

		} while (pos > 0);

		ret += "[" + transcr + "]";
	}

	return "<small>" + ret + "</small>";
}
//});