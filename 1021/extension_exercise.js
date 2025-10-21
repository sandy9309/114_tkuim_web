


function toNumber(str) {
  var n = parseFloat(str);
  return isNaN(n) ? null : n;
}


function CtoF(c) { return c * 9 / 5 + 32; }
function FtoC(f) { return (f - 32) * 5 / 9; }

function runTempConverter() {
  var choice = prompt('轉換方向：\n1. 攝氏 → 華氏\n2. 華氏 → 攝氏');
  var value = null;
  var result = '';

  switch(choice) {
    case '1':
      value = toNumber(prompt('輸入溫度 (C)：'));
      if (value === null) return '輸入有誤';
      result = value.toFixed(2) + '°C = ' + CtoF(value).toFixed(2) + '°F';
      break;
    case '2':
      value = toNumber(prompt('輸入溫度 (F)：'));
      if (value === null) return '輸入有誤';
      result = value.toFixed(2) + '°F = ' + FtoC(value).toFixed(2) + '°C';
      break;
    default:
      result = '未選擇有效轉換方向';
  }

  return result;
}


function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function runGuessGame() {
  var answer = randomNumber(1, 100);
  var count = 0;
  var guess = null;

  while (guess !== answer) {
    guess = parseInt(prompt('請猜一個 1~100 的數字：'), 10);
    count++;
    if (isNaN(guess)) {
      alert('請輸入有效數字');
      continue;
    }

    if (guess < answer) alert('再大一點');
    else if (guess > answer) alert('再小一點');
    else alert('恭喜你猜對了！');
  }

  return '答案：' + answer + '\n共猜了 ' + count + ' 次';
}



var mainChoice = prompt('請選擇遊戲：\n1. 溫度轉換器\n2. 猜數字遊戲');

var output = '';
switch(mainChoice) {
  case '1':
    output = runTempConverter();
    break;
  case '2':
    output = runGuessGame();
    break;
  default:
    output = '未選擇有效遊戲';
}


alert(output);
document.getElementById('result').textContent = output;
console.log(output);
