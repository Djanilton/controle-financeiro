const path=require('node:path'),os=require('node:os');
function playwright(){
 if(process.env.PLAYWRIGHT_MODULE)return require(process.env.PLAYWRIGHT_MODULE);
 try{return require('playwright')}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;return require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))}
}
function launchOptions(){const executablePath=process.env.CHROME_PATH||(process.env.PROGRAMFILES?path.join(process.env.PROGRAMFILES,'Google/Chrome/Application/chrome.exe'):null);return {headless:true,...(executablePath?{executablePath}:{})}}
module.exports={...playwright(),launchOptions};
