// reference:
// https://code.visualstudio.com/api/references/theme-color
// https://code.visualstudio.com/api/working-with-extensions/
// see npm scripts for commands to package / publish / install package for testing
// debug with debug button in VS Code

// Code based on: https://github.com/s3anmorrow/VSCodeExt-ColorStamp

// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

function componentToHex(c: number): string {
  let hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
  if (hex.length === 4) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  return { r, g, b };
}

function isBright(hex: string): boolean {
  let c = hexToRgb(hex);
  let luminance = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
  return luminance > 0.5
}
function getTextColor(hex: string): string {
  let text: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('statusbar.text');
  let contrastingColor = isBright(hex) ? text.dark : text.light;
  return contrastingColor;
}

function shiftColor(hex: string, shift: number): string {
  let c = hexToRgb(hex);
  isBright(hex) && (shift *= -1);
  // Adjust the RGB values based on the shift value
  let r = Math.min(Math.max(c.r + shift, 0), 255);
  let g = Math.min(Math.max(c.g + shift, 0), 255);
  let b = Math.min(Math.max(c.b + shift, 0), 255);
  // Convert the RGB values back to a hex color
  let shiftedColor = '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  return shiftedColor;
}

async function updateConfig(enteredColor: any) {
  // if user pressed ESC to cancel
  if (enteredColor === undefined) { return }

  // get reference to workspace configuration
  let config:vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
  let value:Object;
  if (enteredColor === 'reset') {
    value = {};
  } else {
    let textColor = getTextColor(enteredColor);
    let hoverColor =  shiftColor(enteredColor, 20);
    let activeColor = shiftColor(enteredColor, 40);

    value = {
      'statusBar.foreground': textColor,
      'statusBar.debuggingForeground': textColor,
      'statusBar.prominentForeground': textColor,

      'statusBar.background': enteredColor,
      'statusBar.debuggingBackground': enteredColor,
      'statusBar.prominentBackground': enteredColor,

      'statusBarItem.hoverBackground' : hoverColor,
      'statusBarItem.prominentHoverBackground' : hoverColor,

      'statusBarItem.activeBackground': activeColor
    };
  }
  // undefined so it only updates the workspace configurations and not globally
  // updates the .vscode/settings.json file of project folder
  await config.update('workbench.colorCustomizations', value, undefined);
}

async function statusColor(color?:string) {
  if (vscode.workspace.workspaceFolders === undefined) {
    vscode.window.showErrorMessage('Error : No project folder (workspace) opened');
    return;
  }

  if (color === 'reset') {
    updateConfig('reset');
  } else {
    // color hex code input required from user
    // regular expression to validate hex color user input
    let regex:RegExp = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');
    // getting color hex code input from user
    let options:vscode.InputBoxOptions = {
      password: false,
      placeHolder: '#RRGGBB or #RGB',
      prompt: 'Enter a Color Code',
      validateInput: (text: string) => {
        if (!text.match(regex)) {
          return 'Invalid Color Code';
        } else { return null; }
      }
    };
    vscode.window.showInputBox(options).then((enteredColor:any) => updateConfig(enteredColor));
  }
}


export async function activate(context: vscode.ExtensionContext) {
  let commands = [];

  commands.push(
  	vscode.commands.registerCommand('statusbar-color.set', () => statusColor()),
  	vscode.commands.registerCommand('statusbar-color.setarg', (arg:string) => updateConfig(arg)),
    vscode.commands.registerCommand('statusbar-color.reset', () => updateConfig('reset')),
  );

  context.subscriptions.concat(commands);
}

export function deactivate() { updateConfig('reset'); }
