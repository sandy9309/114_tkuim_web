
function convertTemp(value, unit) {
  if (unit === 'C') return value * 9 / 5 + 32;
  if (unit === 'F') return (value - 32) * 5 / 9;
  return null;
}

var tempStr = prompt('input temperature：');
var unit = prompt('（C or F）：').toUpperCase();
var temp = parseFloat(tempStr);
var text = '';

if (isNaN(temp) || (unit !== 'C' && unit !== 'F')) {
  text = '輸入有誤，請重新整理後再試。';
} else {
  var converted = convertTemp(temp, unit);
  var targetUnit;
if (unit === 'C') {
  targetUnit = 'F';
} else {
  targetUnit = 'C';
}
text = temp.toFixed(2) + '°' + unit + ' = ' + converted.toFixed(2) + '°' + targetUnit;
}

alert(text);
console.log(text);
document.getElementById('result').textContent = text;
