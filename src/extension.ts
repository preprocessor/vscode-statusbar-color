// reference:
// https://code.visualstudio.com/api/references/theme-color
// https://code.visualstudio.com/api/working-with-extensions/
// see npm scripts for commands to package / publish / install package for testing
// debug with debug button in VS Code

// Code based on: https://github.com/s3anmorrow/VSCodeExt-ColorStamp

// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

// Get the current user settings
let settings: Record<string, any> = vscode.workspace.getConfiguration();
let colors: Record<string, string> = settings.get("statusbar.colors");

// Register a listener for changes to the user settings
vscode.workspace.onDidChangeConfiguration(event => {
  // Check if the user settings related to your extension have changed
  if (event.affectsConfiguration("statusbar.colors")) {
    // Update the array
    colors = settings.get("statusbar.colors");
    console.log(colors);
  }
});

async function updateConfig(enteredColor: any) {
  // if user pressed ESC to cancel
  if (enteredColor === undefined) {
    return;
  }

  // get reference to workspace configuration and set titleBar color
  let config:vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
  let value:Object;
  if (enteredColor === "reset") {
    value = {};
  } else {
    value = {
      "statusBar.background": enteredColor,
      "statusBar.debuggingBackground": enteredColor,
      "statusBar.noFolderBackground": enteredColor,
      "statussBar.prominentBackground": enteredColor
    };
  }
  // undefined so it only updates the workspace configurations and not globally
  // updates the .vscode/settings.json file of project folder
  await config.update("workbench.colorCustomizations", value, undefined);
}

async function statusColor(color?:string) {

  // check if VS Code has project folder open - if not this extension does nothing :(
  if (vscode.workspace.workspaceFolders === undefined) {
    vscode.window.showErrorMessage("Error : No project folder (workspace) opened");
    return;
  }

  if (color === "reset") {
    updateConfig("reset");
  } else if (color === "title") {
    updateConfig("title");
  } else if (color === undefined) {
    // color hexcode input required from user
    // regular expression to validate hex color user input
    let regex:RegExp = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
    // getting color hexcode input from user
    let options:vscode.InputBoxOptions = {
      password: false,
      placeHolder: "#FF0000",
      prompt: "Enter a Color Code",
      validateInput: (text: string) => {
        if (!text.match(regex)) {
          return "Invalid Color Code";
        } else {
          return null;
        }
      }
    };
    vscode.window.showInputBox(options).then((enteredColor:any) => updateConfig(enteredColor));
  } else {
    updateConfig(color);
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

  let commands = []
  for (const key in colors) {
    if (colors.hasOwnProperty(key)) {
      const value = colors[key];
      // console.log(`Key: ${key}, Value: ${value}`);
      commands.push(
        vscode.commands.registerCommand(
          'extension.statusbar-color-' + key,
           () => statusColor(value)
        )
      )
    }
  }


  // setup VS Code Commands
  // let commands = [
  // 	vscode.commands.registerCommand('extension.statusbar-color', () => statusColor()),
  // 	vscode.commands.registerCommand('extension.statusbar-color-arg', (arg:string) => statusColor(arg)),
  // 	vscode.commands.registerCommand('extension.statusbar-color-X', () => statusColor("reset")),
  // ];

  context.subscriptions.concat(commands);
}

// this method is called when your extension is deactivated
export function deactivate() { statusColor("reset"); }
