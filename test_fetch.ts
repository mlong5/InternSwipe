const response = await fetch("https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md");
const text = await response.text();
const lines = text.split('\n');
let count = 0;
for (const line of lines) {
  if (line.startsWith('|') && !line.includes('---') && count < 5) {
    console.log("Sample row:", line.substring(0, 100));
    count++;
  }
}
console.log("Total lines:", lines.length);
console.log("Lines starting with |:", lines.filter(l => l.startsWith('|')).length);
