const { spawn } = require('child_process');

function generateViaInternModel({ title = 'Internship', total = 8, coding = 2, debug = 1 }, { timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const args = ['scripts/intern_bridge.py', title, String(total), String(coding), String(debug)];
    const child = spawn('python', args, { cwd: __dirname + '/..' });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch (_) {}
      reject(new Error('intern.py bridge timed out'));
    }, timeoutMs);

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        return reject(new Error(stderr || `intern bridge exited ${code}`));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse intern bridge output: ${e.message}. Out: ${stdout.slice(0,400)}`));
      }
    });
  });
}

module.exports = { generateViaInternModel };


