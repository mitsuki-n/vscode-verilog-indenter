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
    let formated:string = '';
    let indent:number = 0;
    const lines:string[] = documentText.split('\n');

    for(const line of lines) {
        // 行頭のインデントを削除
        const temp:string = line.replace(/^[\s\t]+/g, '');

        // 末尾の改行コードがあれば削除
        const noIndentStr:string = temp.replace(/\r$/g, '');

        // インデント減らす
        if(noIndentStr.match(/end |end$|endmodule|\);/)) {
            indent--;
        }
        if(indent < 0) {
            indent = 0;
        }

        let indentSpace:string = '';
        for(let i = 0; i < indent; i++) {
            indentSpace += '    ';
        }

        const replaced:string = indentSpace + noIndentStr;
        formated += replaced + '\n';

        // インデント増やす
        if(noIndentStr.match(/module|begin|\);/)) {
            indent++;
        }
    }
    // 末尾に追加される不要な改行を削除
    formated = formated.replace(/\n$/, '');

    return formated;
}
