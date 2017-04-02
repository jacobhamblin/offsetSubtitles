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

var offsetTime = function(detailedTime, secondsOffset, millisecondsOffset) {
  var ms = detailedTime.split(',')[1];
  var HHMMSS = detailedTime.split(',')[0]; 
  var seconds = HHMMSS.fromHHMMSS();
  var reduced = seconds + secondsOffset;
  var newHHMMSS = reduced.toString().toHHMMSS();
  return [newHHMMSS, ms].join(',');
}

var processData = function(data, seconds, milliseconds) {
  var lines = data.split('\n')
  for (var i = 0; i < lines.length; i++) {
    if (lines[i][2] === ':') {
      var startEnd = lines[i].split(' --> ');
      var reducedStart = offsetTime(startEnd[0], seconds, milliseconds);
      var reducedEnd = offsetTime(startEnd[1], seconds, milliseconds);
      var newLine = [reducedStart, reducedEnd].join(' --> ');
      lines[i] = newLine;      
    }
  }
  return lines.join('\n');
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.

  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                '</li>');
    document.querySelector('#save').style.display = 'block';
    document.querySelector('#drop_zone').style.display = 'none';
    var filenameInput = document.querySelector('#filename');
    if (filenameInput.value === '') filenameInput.value = f.name;
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
  var reader = new FileReader();
  reader.onload = function(e) {
    window.subtitleFile = {name: files[0].name, content:e.target.result};
  }
  reader.readAsText(files[0]);
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

var sanitize = function(event) {
  var unsanitized = event.target.value;
  var sanitized = '';
  for (var i = 0; i < unsanitized.length; i++) {
    if (unsanitized[i].match(/[0-9\-]/g)) sanitized += unsanitized[i];
  }
  event.target.value = sanitized;
}

var inputs = document.querySelectorAll('.half input');
for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('change', sanitize, false);
  inputs[i].addEventListener('keyup', sanitize, false);
}

var prepFile = function() {
  var contentInMemory = window.subtitleFile.content;
  var secondsOffset = parseInt(document.querySelector('#offset_seconds').value);
  var millisecondsOffset = parseInt(document.querySelector('#offset_milliseconds').value);
  var newContent = processData(contentInMemory, secondsOffset, millisecondsOffset);
  debugger
  var blob = new Blob([newContent], {type: 'application/x-subrip'});
  var url = window.URL.createObjectURL(blob);
  var saveButton = document.querySelector('#save');
  saveButton.href = url;
  saveButton.download = document.querySelector('#filename').value;
  window.location = url;
}

document.querySelector('#save').addEventListener('click', prepFile, false);
