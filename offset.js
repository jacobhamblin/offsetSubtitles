String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

String.prototype.fromHHMMSS = function () {
    var HMS = this.split(':');
    var hours = parseInt(HMS[0], 10);
    var minutes = parseInt(HMS[1], 10);
    var seconds = parseInt(HMS[2], 10);
    
    seconds += (minutes * 60);
    seconds += (hours * 3600);
    return seconds;
}

var offsetTime = function(detailedTime, offset) {
  var ms = detailedTime.split(',')[1];
  var HHMMSS = detailedTime.split(',')[0]; 
  var seconds = HHMMSS.fromHHMMSS();
  var reduced = seconds + offset;
  var newHHMMSS = reduced.toString().toHHMMSS();
  return [newHHMMSS, ms].join(',');
}

var processData = function(data) {
  var lines = data.split('\n')
  for (var i = 0; i < lines.length; i++) {
    if (lines[i][2] === ':') {
      var startEnd = lines[i].split(' --> ');
      var reducedStart = reduceByOne(startEnd[0]);
      var reducedEnd = reduceByOne(startEnd[1]);
      var newLine = [reducedStart, reducedEnd].join(' --> ');
      lines[i] = newLine;      
    }
  }
  var newData = lines.join('\n');
  //fs.writeFile('./sixSecondsReduced.srt', newData, function(err) {
    //console.log(err);
  //})    
}

//fs.readFile('./thieves2012.srt', 'utf-8', function (err, data) {
  //if (err) {
    //console.log(err)
  //} else {
    //processData(data);
  //}
//});

