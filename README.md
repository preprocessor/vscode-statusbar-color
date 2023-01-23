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

With `statusbar-color.setarg` you can provide a hex code as an argument.
You can use it in a keybinding or call it any other way.

`keybindings.json`
```json
{ // Set the statusbar to yellow
  "key": "ctrl+alt+y",
  "command": "statusbar-color.keyset",
  "args": "#FFFF00"
}
```
If `"reset"` is provided as the argument the color settings will be removed.

## Settings

Use `statusbar.text.dark` and `statusbar.text.light` in `settings.json` to define the foreground (text) colors.
The dark or light color is chosen based on the luminance of the input color.

```json
"statusbar.text.dark": "#100a22",
"statusbar.text.light": "#e5e5e5",
```

## VSCode Neovim integration

You can use `VSCodeNotify` to call `statusbar-color.setarg` in VimScript like this

`call VSCodeNotify('statusbar-color.setarg', '#FFFFFF')`

I use this for switching the colors with the modes.

```lua
-- autocommands.lua

local autocmd = vim.api.nvim_create_autocmd

local function augroup(name, fnc)
  fnc(vim.api.nvim_create_augroup(name, { clear = true }))
end

augroup('statusbarColors', function(g)
  autocmd({ 'ModeChanged' },  {
    group = g,
    pattern = '*',
    callback = function()
      local modes = {
        n = "#a3c4f3",
        v = "#B892FF",
        V = "#F4AC45",
        i = "#90be6d",
        c = "#ffef9f",
        R = "#ff70a6",
      }
      local currentMode = modes[vim.fn.mode()]
      if currentMode then
        local command = "call VSCodeNotify('statusbar-color.setarg', '%s')"
        vim.cmd(command:format(currentMode))
      end
    end
  })
end)

```

## Limitations

- You must have a project open (that is where the color settings are saved)
- Every window in that project will share the color