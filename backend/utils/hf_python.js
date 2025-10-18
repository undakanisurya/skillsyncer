const { spawn } = require('child_process');

function generateViaPython({ title = 'Internship', skills = [], model = 'HuggingFaceH4/zephyr-7b-beta' }, { timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const args = ['scripts/hf_generate.py', title, skills.join(','), model];
    const child = spawn('python', args, { cwd: __dirname + '/..' });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch (_) {}
      reject(new Error('HF python timed out'));
    }, timeoutMs);

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        return reject(new Error(stderr || `HF python exited ${code}`));
      }
      try {
        const firstJson = stdout.trim().match(/\[([\s\S]*)\]$/);
        const jsonText = firstJson ? `[${firstJson[1]}]` : stdout.trim();
        const parsed = JSON.parse(jsonText);
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse HF output: ${e.message}. Out: ${stdout.slice(0,400)}`));
      }
    });
  });
}

module.exports = { generateViaPython };


