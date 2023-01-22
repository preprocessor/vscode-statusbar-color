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

function getContrastRatio(hex1: string, hex2: string): number {
  let c1 = hexToRgb(hex1);
  let c2 = hexToRgb(hex2);

  // Convert the RGB values to luminance
  let l1 = 0.2126 * Math.pow((c1.r / 255), 2.2) + 0.7152 * Math.pow((c1.g / 255), 2.2) + 0.0722 * Math.pow((c1.b / 255), 2.2);
  let l2 = 0.2126 * Math.pow((c2.r / 255), 2.2) + 0.7152 * Math.pow((c2.g / 255), 2.2) + 0.0722 * Math.pow((c2.b / 255), 2.2);

  let contrastRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return contrastRatio;
}

function getContrastingColor(hex: string, ratio: number): string {
  let c = hexToRgb(hex);

  let luminance = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;

  let contrastingColor = luminance > 0.5 ? '#000000' : '#FFFFFF';

  let contrastRatio = getContrastRatio(hex, contrastingColor);
  if (contrastRatio >= ratio) {
    return contrastingColor;
  }

  while (contrastRatio < ratio) {
    if (contrastingColor === '#000000') {
      c.r = Math.min(c.r + 51, 255);
      c.g = Math.min(c.g + 51, 255);
      c.b = Math.min(c.b + 51, 255);
      contrastingColor = '#' + componentToHex(c.r) + componentToHex(c.g) + componentToHex(c.b);
    } else {
      c.r = Math.max(c.r - 51, 0);
      c.g = Math.max(c.g - 51, 0);
      c.b = Math.max(c.b - 51, 0);
      contrastingColor = '#' + componentToHex(c.r) + componentToHex(c.g) + componentToHex(c.b);
    }
    contrastRatio = getContrastRatio(hex, contrastingColor);
  }

  return contrastingColor;
}

async function updateConfig(enteredColor: any) {
  // if user pressed ESC to cancel
  if (enteredColor === undefined) {
    return;
  }

  // get reference to workspace configuration and set titleBar color
  let config:vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
  let value:Object;
  if (enteredColor === 'reset') {
    value = {};
  } else {
    let textColor = getContrastingColor(enteredColor, 4.5);
    let hoverColor = getContrastingColor(enteredColor, 0.5);

    value = {
      'statusBar.foreground': textColor,
      'statusBar.debuggingForeground': textColor,
      'statusBar.prominentForeground': textColor,
      'statusBar.background': enteredColor,
      'statusBar.debuggingBackground': enteredColor,
      'statusBar.prominentBackground': enteredColor
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
    // color hexcode input required from user
    // regular expression to validate hex color user input
    let regex:RegExp = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');
    // getting color hexcode input from user
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
  // Get the current user settings
  let settings: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('statusbar');
  let colors: Record<string, string> = settings.colors;

  //Create output channel
  let channel = vscode.window.createOutputChannel('Statusbar-color');

  // Register a listener for changes to the user settings
  vscode.workspace.onDidChangeConfiguration(event => {
    // Check if the user settings related to your extension have changed
    if (event.affectsConfiguration('statusbar.colors')) {
      // Update the array
      colors = vscode.workspace.getConfiguration('statusbar.colors');
    }
  });

  let commands = [];

  // add dynamic commands
  for (const key in colors) {
    const value = colors[key];
    let commandName = 'statusbar-color.color.' + key;
    commands.push(
      vscode.commands.registerCommand(commandName, () => updateConfig(value))
    );
    channel.appendLine(`${commandName}: ${value}`);

  }

  // add static commands
  commands.push(
  	vscode.commands.registerCommand('statusbar-color.set', () => statusColor()),
  	vscode.commands.registerCommand('statusbar-color.keyset', (arg:string) => updateConfig(arg)),
    vscode.commands.registerCommand('statusbar-color.reset', () => updateConfig('reset')),
  );

  channel.appendLine(commands.join("\n"));

  context.subscriptions.concat(commands);
}

// this method is called when your extension is deactivated
export function deactivate() { updateConfig('reset'); }
