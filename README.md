# Statusbar Color Changer
A vscode plugin to change the status bar color on command

## Explanation

I use [VSCode Neovim] and wanted to have my statusbar's color change with the mode in neovim.
It seems that [NeoVim Ui Modifier] is broken and abandoned.
I found a few other plugins that nearly did what I wanted but nothing exactly fit my needs.
This extension is heavily based on [Color Stamp] and works the same way, by setting values in the project settings.

[VSCode Neovim]: https://marketplace.visualstudio.com/items?itemName=asvetliakov.vscode-neovim
[NeoVim Ui Modifier]: https://marketplace.visualstudio.com/items?itemName=JulianIaquinandi.nvim-ui-modifier
[Color Stamp]: https://github.com/s3anmorrow/VSCodeExt-ColorStamp

## Usage

These are the only commands available from the command palette

| Command                | Description                       | Command ID            |
| ---------------------- | --------------------------------- | --------------------- |
| Statusbar Color: Set   | Set the status bar to a hex color | statusbar-color.set   |
| Statusbar Color: Reset | Removes all colors                | statusbar-color.reset |

With `statusbar-color.keyset` you can provide a hex code as an argument to a keybinding

```json
// keybindings.json

{ // Set the statusbar to yellow
  "key": "ctrl+alt+y",
  "command": "statusbar-color.keyset",
  "args": "#FFFF00"
}
```

## Settings

Use `"statusbar.colors"` in `settings.json` to define a list of colors. Commands will be made for each item in the list in the format `statusbar-color.color.name`

```json
"statusbar.colors" : {
// "name": "value"
  "red": "#FF0000",
  "green": "#00FF00",
  "blue": "#0000FF"
}
```
These settings will make 3 command IDs:

`statusbar-color.color.red`, `statusbar-color.color.green`, and `statusbar-color.color.blue`
which then can be used in keybindings or called any other way

## Limitations

- You must have a project open (that is where the colors are set)
- Every window in that project will share the color