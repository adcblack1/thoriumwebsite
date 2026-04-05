const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, 'public/thumbnails');
const dest = '/Users/alexchun/Downloads/Newsletter Thumbnails';
fs.mkdirSync(dest, {recursive:true});
const map = {
  'march-25': ['judge-says-pentagon-was-out-to-punish-anthropic.png','claude-now-works-while-youre-away-sort-of.png','openclaw-reached-a-billion-people-with-one-update.png'],
  'march-20': ['metas-rogue-ai-agent-is-everyones-problem-now.png','microsoft-is-done-shoving-copilot-into-everything.png','washington-wants-one-ai-rulebook-the-states-arent-having-it.png'],
  'march-10': ['goldman-cant-find-ais-productivity-boost.png','nvidia-says-its-done-investing-in-ai-labs.png','two-engineers-built-openais-most-used-internal-tool.png'],
  'march-04': ['openai-calls-its-own-pentagon-deal-sloppy.png','chatgpt-just-got-a-personality-and-accuracy-overhaul.png','inside-openais-110b-round-investors-are-hedging.png'],
  'feb-27': ['anthropics-friday-deadline-bend-or-break.png','claude-cowork-now-finishes-what-it-starts.png','gemini-can-now-run-your-errands-on-android.png'],
  'feb-24': ['apple-paid-google-1b-siri-still-doesnt-work.png','most-ai-agent-projects-are-headed-for-the-trash.png','the-people-building-ai-are-walking-out.png'],
  'feb-23': ['big-tech-is-banning-openclaw.png','bytedance-made-tom-cruise-fight-brad-pitt-hollywood-is-not-amused.png','use-ai-or-lose-your-promotion-accenture.png']
};
for (const [d, files] of Object.entries(map)) {
  files.forEach((f, i) => {
    const s = path.join(src, f);
    const name = d + '_article' + (i+1) + '_' + f;
    if (fs.existsSync(s)) { fs.copyFileSync(s, path.join(dest, name)); console.log('OK ' + name); }
    else console.log('MISSING ' + s);
  });
}
console.log('DONE - check /Users/alexchun/Downloads/Newsletter Thumbnails');
