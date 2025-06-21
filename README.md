# Integrated UI Documentation - btc-menu

This document details the functionality of the NUI system integrated into `btc-menu`. It is designed to be a robust and customizable foundation for all other scripts on your server, offering a wide range of UI features, including a menu with two distinct visual themes and a standalone progress bar.

---

## 🚀 How to Use

Since all UI elements are part of `btc-menu`, there is no separate resource to install. Other scripts that need to create UI elements must declare `btc-menu` as a dependency.

### 1. Dependency (in other scripts)

In the `fxmanifest.lua` of any resource that will use the UI (e.g., `btc-jobs`), make sure the following line exists:

```lua
depends 'btc-menu'
```

### 2. Accessing the Functions

At the beginning of your client-side `.lua` script, get access to the functions exported by `btc-menu`:

```lua
local MenuUI = exports['btc-menu']
```

---

## 📊 Progress Bar

A simple, visual progress bar that can be triggered for any action.

### Calling the Progress Bar

To display the progress bar, use the `showProgressBar` function.

-   **Parameters:**
    -   `label` (string): The text displayed above the bar.
    -   `duration` (number): The total time in milliseconds (ms) for the bar to complete.
    -   `freezePlayer` (boolean, optional): If `true`, the player will be frozen in place for the duration. Defaults to `false`.
    -   `color` (string, optional): A hex color code for the bar (e.g., `'#3498db'`). Defaults to the color set in `Config.ProgressBarColor`.

-   **Example:**
    ```lua
    -- Shows a progress bar using the default color from the config file and freezes the player.
    MenuUI:showProgressBar('Crafting...', 5000, true)

    -- Shows a progress bar with a custom blue color, without freezing the player.
    MenuUI:showProgressBar('Searching...', 3000, false, '#3498db')
    ```

---

## 📋 Menu System

### Opening a Menu

To open a menu, call the `openMenu` function.

-   **Main Menu Properties:**
    -   `id` (string): A unique ID for the menu (e.g., `'job_menu'`).
    -   `title` (string): The text that appears in the header.
    -   `align` (string): The initial position of the menu. Options: `'top-left'`, `'top-right'`, `'center'`, etc.
    -   `menuType` (string): The visual style of the menu.
        -   `'default'` (default): Classic RedM style with custom textures and fonts.
        -   `'other'`: A custom vintage/paper style.
    -   `elements` (table): The list of elements that make up the menu.
-   **Example:**
    ```lua
    MenuUI:openMenu({
        id = 'my_main_menu',
        title = 'Saloon',
        align = 'top-left',
        menuType = 'default',
        elements = { /* ... list of elements here ... */ }
    })
    ```

### Closing a Menu

To force the menu to close, use `closeMenu`:

```lua
MenuUI:closeMenu()
```

### Navigation and Controls

-   **Mouse:** The menu can be moved by clicking and dragging its header.
-   **Keyboard:**
    -   **Arrow Up/Down**: Navigate items.
    -   **Arrow Left/Right**: Adjust `slider` values.
    -   **Enter**: Select/activate an item.
    -   **Backspace / Escape**: Go back or close the menu.

### Element Structure

(The element documentation for `label`, `description`, `icon`, `money`, `bottom`, and all element types remains the same.)

---

## 📜 Full Menu Example

This example demonstrates how to use both menu layouts (`default` and `other`) and various element types. You can create a command to test it.

```lua
local MenuUI = exports['btc-menu']

RegisterCommand('menutest', function()
    MenuUI:openMenu({
        id = 'main_test_menu',
        title = 'Main Menu',
        align = 'top-left',
        menuType = 'other', -- Try 'default' or 'other'
        elements = {
            {
                label = 'General Store',
                icon = 'shop', -- Assumes you have a shop.png in images/
                submenu = {
                    id = 'store_submenu',
                    title = 'General Store',
                    align = 'top-left', -- Submenus can have their own alignment
                    elements = {
                        {
                            label = 'Buy Potion',
                            description = 'Restores your health.',
                            icon = 'potion',
                            money = { cash = 50, gold = 2 },
                            bottom = {
                                {label = 'Instant Healing', icon = 'health', bar = {80, 100}},
                                {lbar = {25, 100}}
                            },
                            action = function()
                                print('Potion purchased!')
                                MenuUI:showProgressBar('Using potion...', 2000, true)
                                MenuUI:closeMenu()
                            end
                        }
                    }
                }
            },
            {
                type = 'checkbox',
                label = 'Enable Notifications',
                checked = true,
                onChanged = function(isChecked)
                    print('Notifications set to: ' .. tostring(isChecked))
                end
            },
            {
                type = 'slider',
                label = 'Music Volume',
                value = 75,
                onChanged = function(val)
                    print('Volume set to: ' .. math.floor(val))
                end
            },
            {
                type = 'input',
                label = 'Set Clan Tag',
                value = 'BTC',
                maxLength = 5,
                onChanged = function(val)
                    print('Clan tag changed to: ' .. val)
                end
            },
            {
                label = 'Close Menu',
                icon = 'close_door',
                action = function()
                    MenuUI:closeMenu()
                end
            }
        }
    })
end, false)

```
