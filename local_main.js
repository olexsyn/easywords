var dict, dkeys;

dict  = data.words;
dkeys = data.keys;

var words = [];    // список для слов
var mistake = -1   // не удалять слово: пользователь ошибся
var usehelp = -1;  // не удалять слово: пользователь использовал помощь

// ------------------------------------------------------
// $ вместо document.getElementById
// ------------------------------------------------------
function $(id) {
	return document.getElementById(id);
}

window.onload = function()
{
	printLists();  // генерируем список тем
	toggleList();  // прячем спсок тем

	// тема по-умолчанию:
	var def_them = 'basic';
	addWords( def_them );
	$('ch_' + def_them).checked = "checked";
	getWord();     // выбрать и отобразить слово

	// кнопка Готово
	var btn_ready = $("btn_ready");
	btn_ready.onclick = getAnsw;

	// кнопка Подсказка
	var btn_help = $("btn_help");
	btn_help.onclick = toHelp;

	// кнопка Пропустить
	var btn_next = $("btn_next");
	btn_next.onclick = toNext;

	// кнопка Еще слово
	var btn_getword = $("btn_getword");
	btn_getword.onclick = getWord;

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
		$('btn_getword').style.display = 'none';
		$('inp_idword').value = rand_id;
		$('inp_answ').style.display = '';
		$('block_word').innerHTML = parseRus( words[rand_id]['trn'] );
		$('block_answ').innerHTML = "";
		$('count_left').innerHTML = words_length;
		$('btn_ready').style.display = '';
		$('btn_help').style.display = '';
		$('btn_next').style.display = '';
		$('inp_answ').focus();
	}
	else
	{
		// слов нет
		setCheckboxes('none');
		$('btn_getword').style.display = 'none';
		$('inp_answ').value = '';
		$('inp_answ').style.display = 'none';
		$('btn_ready').style.display = 'none';
		$('btn_help').style.display = 'none';
		$('btn_next').style.display = 'none';
		if ($("list").style.display == 'none') toggleList();  // открыть списки тем, если закрыты
		$('block_word').innerHTML = "Слова закончились!";
		$('block_answ').innerHTML = "<small>Выбери один или несколько списков слов, чтобы продолжить.</small>";
		$('count_left').innerHTML = "0";
	}

}

// ------------------------------------------------------
// принимает ответ пользователя и отображает ответ
// ------------------------------------------------------
function parseRus(text)
{

	var pattern = /\((.+?)\)/g; // g - глобальный поиск - все вхождения, а не только первое.
	var result = text.replace(pattern, "<small>$&</small>");

	return result;
}

// ------------------------------------------------------
// принимает ответ пользователя и отображает ответ
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
		// и пользователь не использвал помощь usehelp == -1 и != idword
		if ( mistake != idword && usehelp != idword)
		{
			// удаляем слово из массива
			// console.log('delete word ' + words[idword]['wrd']);
			words.splice(idword,1);
		}
		else
		{
			// пользователь либо отвечал неправильно на это слово,
			// либо воспользовался помощью
			// не удаляем, но сбрасываем флаги неудалений
			// в следующий раз удалить, если ответ будет правильным
			if (mistake == idword) mistake = -1;
			if (usehelp == idword) usehelp = -1;
		}

		$('count_left').innerHTML = words.length;
		$('btn_getword').style.display = '';
		$('btn_ready').style.display = 'none';
		$('btn_help').style.display = 'none';
		$('btn_next').style.display = 'none';
		$('btn_getword').focus();
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
