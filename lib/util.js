var validPrice = function(p) {
  var i = parseInt(p);
  //if (isNaN(i) || i <= 0) {
  if (isNaN(i)) {
    return false;
  }
  var max = 1000000;
  if (i > max)
    i = max;
  return i;
};

var ts = function() {
  return Math.round(new Date()/1000);
};

function Asc(s)
{
  return s.charCodeAt(0);
}

function Chr(AsciiNum)
{
  return String.fromCharCode(AsciiNum)
}
