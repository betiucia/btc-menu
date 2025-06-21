-- client/main.lua

local isMenuOpen = false
local isInputFocused = false
local menuStack = {}
local elementCallbacks = {}
local currentProgressBar = 0 

local function renderCurrentMenu()
    if #menuStack == 0 then return end
    local currentMenuData = menuStack[#menuStack]
    elementCallbacks = {}
    local elementsForNUI = {}

    if #menuStack > 1 then
        local backId = 'internal_back'
        elementCallbacks[backId] = goBack
        table.insert(elementsForNUI, { type = 'button', isBackButton = true, actionId = backId })
    end

    for i, element in ipairs(currentMenuData.elements) do
        local elementId = currentMenuData.id .. '_elem_' .. i
        element.elementId = elementId
        if element.action then
            element.actionId = elementId
            elementCallbacks[elementId] = element.action
        end
        if element.submenu then
            element.actionId = elementId
            elementCallbacks[elementId] = function()
                if not element.submenu.menuType then
                    element.submenu.menuType = currentMenuData.menuType
                end
                table.insert(menuStack, element.submenu)
                renderCurrentMenu()
            end
        end
        if element.onChanged then
            elementCallbacks[elementId] = element.onChanged
        end
        table.insert(elementsForNUI, element)
    end

    SendNUIMessage({
        type = 'open',
        menuData = {
            id = currentMenuData.id,
            title = currentMenuData.title,
            align = currentMenuData.align,
            menuType = currentMenuData.menuType or 'default', 
            elements = elementsForNUI
        }
    })
end

function openMenu(data)
    if isMenuOpen then return end
    isMenuOpen = true
    menuStack = {data}
    renderCurrentMenu()
    SetNuiFocus(true, true)
end

function closeMenu()
    if not isMenuOpen then return end
    isMenuOpen = false
    isInputFocused = false
    menuStack = {}
    elementCallbacks = {}
    SendNUIMessage({ type = 'close' })
    SetNuiFocus(false, false)
end

function goBack()
    if #menuStack > 1 then
        table.remove(menuStack)
        renderCurrentMenu()
    else
        closeMenu()
    end
end


function showProgressBar(label, duration, freezePlayer, color)
    SendNUIMessage({
        type = 'showProgressBar',
        progressBarData = {
            label = label,
            duration = duration,
            color = color or Config.ProgressBarColor 
        }
    })


    currentProgressBar = currentProgressBar + 1
    local thisProgressBarId = currentProgressBar

    if freezePlayer then
        CreateThread(function()
            local endTime = GetGameTimer() + duration

            while GetGameTimer() < endTime and thisProgressBarId == currentProgressBar do
                FreezeEntityPosition(PlayerPedId(), true)
                Wait(0)
            end
            
            if thisProgressBarId == currentProgressBar then
                FreezeEntityPosition(PlayerPedId(), false)
            end
        end)
    end
end

RegisterNUICallback('onButtonClick', function(data, cb) if elementCallbacks[data.actionId] then elementCallbacks[data.actionId]() end cb('ok') end)
RegisterNUICallback('onValueChange', function(data, cb) if elementCallbacks[data.elementId] then elementCallbacks[data.elementId](data.value) end cb('ok') end)
RegisterNUICallback('onMenuClose', function(data, cb) goBack() cb('ok') end)
RegisterNUICallback('setInputFocus', function(data, cb) isInputFocused = data.hasFocus cb('ok') end)

exports('openMenu', openMenu)
exports('closeMenu', closeMenu)
exports('showProgressBar', showProgressBar)


CreateThread(function()
    while true do
        local sleepTime = 500 
        if isMenuOpen then
            sleepTime = 0 
            if not isInputFocused then
                DisableControlAction(0, 1, true) -- LookLeftRight
                DisableControlAction(0, 2, true) -- LookUpDown
                DisableControlAction(0, 25, true) -- Aim
                DisableControlAction(0, 24, true) -- Attack
            end
        end
        Wait(sleepTime)
    end
end)
