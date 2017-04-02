function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function maybeAppendZeroes(number, decimalPlaces) {
  var string = number.toString();
  var split = string.split('.');
  if (!split[1]) return string + '.000';
  if (split[1].length < decimalPlaces) {
    var newDecimalPlaces = split[1];
    for (var i = split[1].length; i < decimalPlaces; i++) {
      newDecimalPlaces += '0';
    }
    return split[0] + '.' + newDecimalPlaces;
  }
  return string;
}

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
  seconds = Number(seconds + '.' + ms);
  var reduced = round(seconds + offset, 3);
  var reducedString = maybeAppendZeroes(reduced, 3);
  var newMS = reducedString.split('.')[1];
  var newHHMMSS = reducedString.split('.')[0].toHHMMSS();
  return [newHHMMSS, newMS].join(',');
}

var processData = function(data, offset) {
  var lines = data.split('\n')
  for (var i = 0; i < lines.length; i++) {
    if (lines[i][2] === ':') {
      var startEnd = lines[i].split(' --> ');
      var reducedStart = offsetTime(startEnd[0], offset);
      var reducedEnd = offsetTime(startEnd[1], offset);
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
    if (unsanitized[i].match(/[0-9\-\.]/g)) sanitized += unsanitized[i];
  }
  event.target.value = sanitized;
}

var offsetInput = document.querySelector('#offset');
offsetInput.addEventListener('change', sanitize, false);
offsetInput.addEventListener('keyup', sanitize, false);

var prepFile = function() {
  var contentInMemory = window.subtitleFile.content;
  var offset = Number(document.querySelector('#offset').value) || 0;
  var newContent = processData(contentInMemory, offset);
  var blob = new Blob([newContent], {type: 'application/x-subrip'});
  var url = window.URL.createObjectURL(blob);
  var saveButton = document.querySelector('#save');
  saveButton.href = url;
  saveButton.download = document.querySelector('#filename').value;
  window.location = url;
}

document.querySelector('#save').addEventListener('click', prepFile, false);
