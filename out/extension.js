"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process = __importStar(require("child_process"));
function activate(context) {
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
        const pathRsync = config.get('pathRsync', '');
        const pathSsh = config.get('pathSsh', '');
        const localPath = config.get('localPath', '');
        const remotePath = config.get('remotePath', '');
        const excludeList = config.get('excludeList', []);
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
function deactivate() { }
//# sourceMappingURL=extension.js.map