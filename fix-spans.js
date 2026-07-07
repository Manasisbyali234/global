var fs = require('fs');
var filePath = 'c:/Users/Aryan/Desktop/TaleGlobal/global/frontend/src/app/pannels/employer/components/jobs/emp-post-job.jsx';
var buf = fs.readFileSync(filePath);

// Replace EF BF BD (U+FFFD) with C3 97 (UTF-8 for × U+00D7)
var result = [];
var count = 0;
for (var i = 0; i < buf.length; i++) {
  if (i <= buf.length - 3 && buf[i] === 0xEF && buf[i+1] === 0xBF && buf[i+2] === 0xBD) {
    result.push(0xC3, 0x97);
    i += 2;
    count++;
  } else {
    result.push(buf[i]);
  }
}

fs.writeFileSync(filePath, Buffer.from(result));
console.log('Replaced ' + count + ' occurrences of U+FFFD with x');
