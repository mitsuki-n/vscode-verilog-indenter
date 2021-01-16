'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let registration = vscode.workspace.onWillSaveTextDocument( event => {
        const languageId = event.document.languageId;

        // VerilogとSystemVerilogでのみ実行する
        if(languageId !== 'verilog' && languageId !== 'systemverilog') {
            return;
        }

        const editor = vscode.window.activeTextEditor;

        if(editor){
            const document = editor.document;
            const selection = editor.selection
    
            // 現在開いているドキュメント全体の文字列を取得
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            const text = document.getText(textRange);
    
            // インデント幅を整形する
            const replaced = formatVerilog(text);
    
            // 現在開いているドキュメントの内容を書き換える
            editor.edit(editBuilder => {
                editBuilder.replace(textRange, replaced);
            });

            editor.selection = selection;
        }
    });
}

export function deactivate() {}


function formatVerilog(documentText:string) : string {
    let formatedText:string = '';
    let indent:number = 0;
    const lines:string[] = documentText.split('\n');

    for(const line of lines) {
        const trimedLine:string = TrimSpaceAndTab(line);
        indent = GetThisLineIndent(trimedLine, indent);

        let indentSpace:string = '';
        for(let i = 0; i < indent; i++) {
            indentSpace += '    ';
        }

        formatedText += indentSpace + trimedLine + '\n';
        indent = GetNextLineIndent(trimedLine, indent);
    }
    // テキストの最後に追加される不要な改行を削除
    formatedText = formatedText.replace(/\n$/, '');

    return formatedText;
}


function TrimSpaceAndTab(line:string) : string{
    const temp:string   = line.replace(/^[\s\t]+/g, '');
    const trimed:string = temp.replace(/\r$/g, '');
    return trimed;
}


function GetThisLineIndent(line:string, indent:number) : number {
    let thisIndent = indent;

    if(line.match(/end |end$|endmodule/)) {
        thisIndent--;
    }
    if(line.match(/^\./)) {
        thisIndent++;
    }
    if(indent < 0) {
        thisIndent = 0;
    }
    return thisIndent;
}

function GetNextLineIndent(line:string, indent:number) : number {
    let nextIndent = indent;

    if(line.match(/^module|begin/)) {
        nextIndent++;
    }
    if(line.match(/^\./)) {
        nextIndent--;
    }
    return nextIndent;
}