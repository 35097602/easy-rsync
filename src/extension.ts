import * as vscode from 'vscode';
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    // 创建输出通道
    const outputChannel = vscode.window.createOutputChannel('Rsync Command');

    // 创建状态栏项
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = 'RR';
    statusBarItem.tooltip = 'Run Rsync Command';
    statusBarItem.command = 'extension.runRsyncCommand';
    statusBarItem.show();

    // 注册命令
    const disposable = vscode.commands.registerCommand('extension.runRsyncCommand', () => {
        const config = vscode.workspace.getConfiguration('rsync');
        const pathRsync = config.get<string>('pathRsync', '');
        const pathSsh = config.get<string>('pathSsh', '');
        const localPath = config.get<string>('localPath', '');
        const remotePath = config.get<string>('remotePath', '');
        const excludeList = config.get<string[]>('excludeList', []);

        if (!pathRsync || !pathSsh || !localPath || !remotePath) {
            vscode.window.showErrorMessage('Please configure all required rsync settings.');
            outputChannel.appendLine('Please configure all required rsync settings.');
            return;
        }

        // 构建 exclude 参数
        const excludeArgs = excludeList.map(item => `--exclude=${item}`).join(' ');

        // 构建完整命令
        const command = `${pathRsync} -e ${pathSsh} -rlptzv --progress --delete ${excludeArgs} -ahH --partial --force --out-format='[%t] [%i] (Last Modified: %M) (bytes: %-10l) %-100n' ${localPath} ${remotePath}`;

        outputChannel.appendLine(`Executing command: ${command}`);

        // 执行命令
        child_process.exec(command, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Rsync command failed: ${error.message}`);
                outputChannel.appendLine(`Rsync command failed: ${error.message}`);
                if (stderr) {
                    outputChannel.appendLine(`Stderr: ${stderr}`);
                }
                return;
            }
            if (stderr) {
                vscode.window.showWarningMessage(`Rsync command stderr: ${stderr}`);
                outputChannel.appendLine(`Stderr: ${stderr}`);
            }
            if (stdout) {
                outputChannel.appendLine(`Stdout: ${stdout}`);
            }
            vscode.window.showInformationMessage('Rsync command executed successfully.');
            outputChannel.appendLine('Rsync command executed successfully.');
        });
    });

    context.subscriptions.push(disposable, statusBarItem);
}

export function deactivate() {}
