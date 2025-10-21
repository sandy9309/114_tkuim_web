

var answer = Math.floor(Math.random() * 100) + 1;
var guess, attempts = 0;
var text = '';

while (true) {
  guess = prompt(' 1–100 ：');
  guess = parseInt(guess, 10);
  attempts++;

  if (isNaN(guess)) {
    alert('請輸入有效的數字！');
    continue;
  }

  if (guess < answer) {
    alert('再大一點');
  } else if (guess > answer) {
    alert('再小一點');
  } else {
    alert('恭喜猜對！共猜了 ' + attempts + ' 次');
    text = '答案：' + answer + '\n共猜了 ' + attempts + ' 次';
    break;
  }
}

console.log(text);
document.getElementById('result').textContent = text;
