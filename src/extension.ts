// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Add Newlines on Pipes | and Subsearch Brackets [
const pipeRegex = new RegExp(/\s+\|\s+/gm);
const bracketRegexFront = new RegExp(/\s+\[\s{0,1}/gm);

export function activate(context: vscode.ExtensionContext) {
    console.log(`SPL Formatter has started.`);

    let disposable;

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    disposable = vscode.commands.registerCommand('extension.formatSPL', async () => {
        const { activeTextEditor } = vscode.window;

        if (activeTextEditor && activeTextEditor.document.fileName.includes('.spl')) {
            // Run Newline Clenaup
            await newLineCleanup(activeTextEditor.document).then((res) => {
                return res;
            });

            // Handle Subsearch Indentation
            await bracketCleanup(activeTextEditor.document).then((res) => {
                return res;
            });

            // console.log(
            //     activeTextEditor.document.getText(
            //         new vscode.Range(
            //             new vscode.Position(0, 0),
            //             new vscode.Position(activeTextEditor.document.lineCount, 0)
            //         )
            //     )
            // );
        }
    });

    context.subscriptions.push(disposable);
}

async function newLineCleanup(document: vscode.TextDocument) {
    const edit = new vscode.WorkspaceEdit();

    //

    for (let i = 0; i < document.lineCount; i++) {
        const currentLine = document.lineAt(i);
        if (pipeRegex.test(currentLine.text)) {
            edit.replace(document.uri, currentLine.range, currentLine.text.replace(pipeRegex, '\n| '));
        }

        if (bracketRegexFront.test(currentLine.text)) {
            edit.replace(document.uri, currentLine.range, currentLine.text.replace(bracketRegexFront, '\n    [ '));
        }
    }

    return vscode.workspace.applyEdit(edit);
}

// Subsearch Bracket Indentation
const bracketRegexBack = new RegExp(/\s{0,1}\]\s{0,1}/gm);
async function bracketCleanup(document: vscode.TextDocument) {
    const edit = new vscode.WorkspaceEdit();

    let toggleBracketSpacing = false;

    for (let i = 0; i < document.lineCount; i++) {
        const currentLine = document.lineAt(i);
        if (bracketRegexFront.test(currentLine.text)) {
            toggleBracketSpacing = true;
            continue;
        }

        if (toggleBracketSpacing) {
            edit.replace(document.uri, currentLine.range, `    ${currentLine.text}`);
        }

        if (bracketRegexBack.test(currentLine.text)) {
            toggleBracketSpacing = false;
            continue;
        }
    }

    return vscode.workspace.applyEdit(edit);
}
