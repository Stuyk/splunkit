import * as vscode from 'vscode';

//Execute arcsector's really good formatter first, if user has it installed.
var arcsectorLint =  vscode.extensions.getExtension('arcsector.vscode-splunk-search-linter');
if( arcsectorLint.isActive == true ){
    console.log('>> Arcsector Extension Found - Attempting Prettify')
    try {
        //https://github.com/arcsector/vscode-splunk-search-linter/blob/master/package.json
        vscode.commands.executeCommand("splunk_search.Prettify");
    }
      catch(err) {
        console.log('Arcsector Err')
    }
}else{
    console.log('Try Activating arcsector extensions?')
}

//Extension
export function activate(context: vscode.ExtensionContext) {
    console.log(`SPL Beautify has started.`);
    let disposable;
    disposable = vscode.commands.registerCommand('extension.beautifySPL', async () => {
        const { activeTextEditor } = vscode.window;

        if (activeTextEditor && activeTextEditor.document.fileName.includes('.spl')) {

            // Handle Rename Formatting
            await renameFormat(activeTextEditor.document).then((res) => {
                return res;
            });

            // Handle Stats Formatting
            await statsFormat(activeTextEditor.document).then((res) => {
                return res;
            });

            console.log(`SPL Beautify Complete.`);
            
        }
    });
    context.subscriptions.push(disposable);
}

//General Regex
const rexComma = new RegExp(/,/gm);

// Rename Regex
const rexRename = new RegExp(/\|\s{0,1}rename\s{0,1}\w+/gm);
const rexRenameNoText = new RegExp(/\|\s{0,1}rename\s{0,1}/gm);
const rexRenameClean1 = new RegExp(/(\w+ as \w+)/gm);
const rexRenameClean2 = new RegExp(/ {1,}(\w+ as \w+)/gm);
// Rename Function
async function renameFormat(document: vscode.TextDocument) {
    const edit = new vscode.WorkspaceEdit();
    for (let i = 0; i < document.lineCount; i++) {
        const currentLine = document.lineAt(i);
        if (rexRename.test(currentLine.text)) {
            var newLine = currentLine.text
            newLine = newLine.replace(rexRenameNoText, '| rename \n')
            newLine = newLine.replace(rexRenameClean1, '$1\n')
            newLine = newLine.replace(rexRenameClean2, '$1')
            newLine = newLine.replace(rexComma, '')
            newLine = newLine.trim()
            newLine = newLine.replace(rexRenameClean1, '\t$1,')
            var lastChar = newLine.substr(newLine.length - 1)
            if (lastChar == ","){
                newLine = newLine.slice(0, -1)
            }
            edit.replace(document.uri, currentLine.range, currentLine.text.replace(currentLine.text, newLine));
        }
    }
    return vscode.workspace.applyEdit(edit);
}

// Stats Regex
const rexStats = new RegExp(/\|\s{0,1}stats\s{0,1}\w+/gm);
const rexStatsNoText = new RegExp(/\|\s{0,1}stats\s{0,1}/gm);
const rexStatsClean1 = new RegExp(/((\w+\s{0,}\(.*?\)){1}(\sas\s\w+){0,1})/gm);
const rexStatsClean2 = new RegExp(/ {1,}((\w+\s{0,}\(.*?\)){1}(\sas\s\w+){0,1})/gm);
//const rexStatsClean3 = new RegExp(/(\w+\s{1,}\(.*?\)){1}/gm);
const rexStatsClean4 = new RegExp(/((count){0,1} by \w+)/gm);
// Stats Function
async function statsFormat(document: vscode.TextDocument) {
    const edit = new vscode.WorkspaceEdit();
    for (let i = 0; i < document.lineCount; i++) {
        const currentLine = document.lineAt(i);
        if (rexStats.test(currentLine.text)) {
            var newLine = currentLine.text
            newLine = newLine.replace(rexStatsNoText, '| stats \n')
            newLine = newLine.replace(rexStatsClean1, '$1\n')
            newLine = newLine.replace(rexStatsClean2, '$1')
            newLine = newLine.replace(rexComma, '')
            newLine = newLine.trim()
            newLine = newLine.replace(rexStatsClean1, '\t$1,')
            newLine = newLine.replace(rexStatsClean4, '\t$1,')
            var lastChar = newLine.substr(newLine.length - 1)
            if (lastChar == ","){
                newLine = newLine.slice(0, -1)
            }
            edit.replace(document.uri, currentLine.range, currentLine.text.replace(currentLine.text, newLine));
        }
    }
    return vscode.workspace.applyEdit(edit);
}