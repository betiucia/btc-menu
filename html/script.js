// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Menu
    const menuContainer = document.getElementById('menu-container');
    const menuTitle = document.getElementById('menu-title');
    const menuButtons = document.getElementById('menu-buttons');
    const itemFooter = document.getElementById('menu-item-footer');
    const menuHeader = menuTitle.parentElement;

    // Elementos da Barra de Progresso
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBarLabel = document.getElementById('progress-bar-label');
    const progressBarFill = document.getElementById('progress-bar-fill');
    let progressTimer = null;

    if (!menuContainer || !menuTitle || !menuButtons || !itemFooter || !menuHeader || !progressBarContainer) {
        console.error('[btc-menu] ERRO CRÍTICO: Um ou mais elementos da UI não foram encontrados. Verifique o seu ficheiro `html/index.html`.');
        return;
    }

    let selectedIndex = 0;
    let currentElements = [];
    let currentData = [];
    let isInputFocused = false;
    let isDragging = false;
    let offsetX, offsetY;

    if (menuHeader) {
        menuHeader.style.cursor = 'move';
        menuHeader.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            offsetX = e.clientX - menuContainer.getBoundingClientRect().left;
            offsetY = e.clientY - menuContainer.getBoundingClientRect().top;
            menuContainer.style.transition = 'none';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp, { once: true });
        });
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        menuContainer.style.left = `${newX}px`;
        menuContainer.style.top = `${newY}px`;
        menuContainer.style.right = 'auto';
        menuContainer.style.bottom = 'auto';
        menuContainer.style.transform = 'none';
    }

    function onMouseUp() {
        isDragging = false;
        menuContainer.style.transition = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
    }

    async function post(eventName, data = {}) {
        try {
            const response = await fetch(`https://btc-menu/${eventName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('[btc-menu] Falha ao enviar POST para LUA:', error);
            return null;
        }
    }

    function createBar(barData) {
        const [current, max] = barData;
        const barContainer = document.createElement('div');
        barContainer.className = 'footer-item-bar-container';
        const barFill = document.createElement('div');
        barFill.className = 'footer-item-bar-fill';
        const percentage = Math.max(0, Math.min(100, (current / max) * 100));
        barFill.style.width = `${percentage}%`;
        barContainer.appendChild(barFill);
        return barContainer;
    }

    function updateFooter(elementData) {
        itemFooter.innerHTML = '';
        if (!elementData || !elementData.bottom || !Array.isArray(elementData.bottom)) {
            itemFooter.classList.add('hidden');
            return;
        }
        elementData.bottom.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'footer-item';
            let hasContent = false;
            if (item.lbar && Array.isArray(item.lbar) && item.lbar.length === 2) {
                itemDiv.classList.add('is-bar-only');
                itemDiv.appendChild(createBar(item.lbar));
                hasContent = true;
            } else {
                const labelIconContainer = document.createElement('div');
                labelIconContainer.style.display = 'flex';
                labelIconContainer.style.alignItems = 'center';
                labelIconContainer.style.width = '100%';
                if (item.icon) {
                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'footer-item-icon';
                    let iconPath = item.icon;
                    if (!iconPath.includes('://')) {
                        iconPath = `./images/${iconPath}.png`;
                    }
                    iconDiv.style.backgroundImage = `url(${iconPath})`;
                    labelIconContainer.appendChild(iconDiv);
                    hasContent = true;
                }
                if (item.label) {
                    const labelSpan = document.createElement('span');
                    labelSpan.className = 'footer-item-label';
                    labelSpan.textContent = item.label;
                    labelIconContainer.appendChild(labelSpan);
                    hasContent = true;
                }
                if (hasContent) itemDiv.appendChild(labelIconContainer);
                if (item.bar && Array.isArray(item.bar) && item.bar.length === 2) {
                    itemDiv.appendChild(createBar(item.bar));
                    hasContent = true;
                }
            }
            if (hasContent) itemFooter.appendChild(itemDiv);
        });
        if (itemFooter.hasChildNodes()) {
            itemFooter.classList.remove('hidden');
        } else {
            itemFooter.classList.add('hidden');
        }
    }

    function updateSelection() {
        if (currentElements.length === 0) return;
        currentElements.forEach((el, index) => {
            el.classList.toggle('selected', index === selectedIndex);
        });
        const selectedElement = currentElements[selectedIndex];
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        updateFooter(currentData[selectedIndex]);
    }

    function openMenu(data) {
        menuContainer.className = '';
        menuContainer.style.left = '';
        menuContainer.style.top = '';
        menuContainer.style.right = '';
        menuContainer.style.bottom = '';
        menuContainer.style.transform = '';
        
        const menuTypeClass = data.menuType === 'other' ? 'layout-other' : 'layout-default';
        menuContainer.classList.add(menuTypeClass);
        const alignClass = `align-${data.align || 'top-left'}`;
        menuContainer.classList.add(alignClass);

        menuTitle.textContent = data.title || 'Menu';
        menuButtons.innerHTML = '';
        currentElements = [];
        currentData = [];
        selectedIndex = 0;

        data.elements.forEach((elem) => {
            const type = elem.type || 'button';
            const container = document.createElement('div');
            container.className = `menu-element ${type}-container`;
            if (elem.isBackButton) {
                container.classList.add('back-button');
            }

            if (elem.icon) {
                const iconDiv = document.createElement('div');
                iconDiv.className = 'element-icon';
                let iconPath = elem.icon;
                if (!iconPath.includes('://')) iconPath = `./images/${iconPath}.png`;
                iconDiv.style.backgroundImage = `url(${iconPath})`;
                container.appendChild(iconDiv);
            }
            const labelContainer = document.createElement('div');
            labelContainer.className = 'element-label-container';
            labelContainer.appendChild(createLabel(elem));
            container.appendChild(labelContainer);
            const moneyDisplay = buildMoneyDisplay(elem);
            if (moneyDisplay) container.appendChild(moneyDisplay);
            let interactiveElement;
            if (type === 'button') interactiveElement = buildButton(container, elem);
            else if (type === 'checkbox') interactiveElement = buildCheckbox(container, elem);
            else if (type === 'slider') interactiveElement = buildSlider(container, elem);
            else if (type === 'input') interactiveElement = buildInput(container, elem);

            if (interactiveElement) {
                interactiveElement.addEventListener('mouseenter', () => {
                    const newIndex = currentElements.indexOf(interactiveElement);
                    if (newIndex !== -1) {
                        selectedIndex = newIndex;
                        updateSelection();
                    }
                });
                menuButtons.appendChild(interactiveElement);
                if (type !== 'input') {
                    currentElements.push(interactiveElement);
                    currentData.push(elem);
                }
            }
        });
        menuContainer.classList.remove('hidden');
        if (currentElements.length > 0) updateSelection();
    }
    
    function createLabel(elem) {
        const labelDiv = document.createElement('div');
        let content = `<div class="button-label">${elem.label || ''}</div>`;
        if (elem.description) {
            content += `<div class="button-description">${elem.description}</div>`;
        }
        labelDiv.innerHTML = content;
        return labelDiv;
    }

    function buildMoneyDisplay(elem) {
        if (!elem.money && elem.money !== 0) return null;
        const moneyContainer = document.createElement('div');
        moneyContainer.className = 'element-money-container';
        let cashValue = null, goldValue = null;
        if (typeof elem.money === 'object' && elem.money !== null) {
            cashValue = elem.money.cash;
            goldValue = elem.money.gold;
        } else if (typeof elem.money === 'number') {
            cashValue = elem.money;
        }
        if (cashValue !== null && cashValue !== undefined) {
            const cashDiv = document.createElement('div');
            cashDiv.className = 'money-value money-cash';
            cashDiv.textContent = cashValue.toLocaleString();
            moneyContainer.appendChild(cashDiv);
        }
        if (goldValue !== null && goldValue !== undefined) {
            const goldDiv = document.createElement('div');
            goldDiv.className = 'money-value money-gold';
            goldDiv.textContent = goldValue.toLocaleString();
            moneyContainer.appendChild(goldDiv);
        }
        return moneyContainer.hasChildNodes() ? moneyContainer : null;
    }

    function buildButton(container, elem) {
        container.classList.add('menu-button');
        container.addEventListener('click', () => post('onButtonClick', { actionId: elem.actionId }));
        return container;
    }
    
    function buildCheckbox(container, elem) {
        const checkboxVisual = document.createElement('div');
        checkboxVisual.className = 'checkbox-visual';
        if (elem.checked) checkboxVisual.classList.add('checked');
        const action = () => {
            const isChecked = !checkboxVisual.classList.contains('checked');
            checkboxVisual.classList.toggle('checked', isChecked);
            post('onValueChange', { elementId: elem.elementId, value: isChecked });
        };
        container.addEventListener('click', action);
        container.clickAction = action;
        container.appendChild(checkboxVisual);
        return container;
    }
    
    function buildSlider(container, elem) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'slider-controls';
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = elem.min || 0;
        slider.max = elem.max || 100;
        slider.value = elem.value || 50;
        container.sliderInput = slider;
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = slider.value;
        slider.addEventListener('input', () => valueDisplay.textContent = slider.value);
        slider.addEventListener('change', () => post('onValueChange', { elementId: elem.elementId, value: parseFloat(slider.value) }));
        controlsDiv.appendChild(slider);
        controlsDiv.appendChild(valueDisplay);
        container.appendChild(controlsDiv);
        return container;
    }
    
    function buildInput(container, elem) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = elem.value || '';
        input.maxLength = elem.maxLength || 50;
        input.addEventListener('input', () => {
            const inputType = elem.inputType || 'any';
            if (inputType === 'letters') {
                input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
            } else if (inputType === 'numbers') {
                input.value = input.value.replace(/[^0-9]/g, '');
            }
            post('onValueChange', { elementId: elem.elementId, value: input.value });
        });
        input.addEventListener('focus', () => {
            isInputFocused = true;
            post('setInputFocus', { hasFocus: true });
        });
        input.addEventListener('blur', () => {
            isInputFocused = false;
            post('setInputFocus', { hasFocus: false });
        });
        container.appendChild(input);
        return container;
    }

    function closeMenu() {
        menuContainer.classList.add('hidden');
        menuButtons.innerHTML = '';
        itemFooter.innerHTML = '';
        currentElements = [];
        currentData = [];
        isInputFocused = false;
        post('setInputFocus', { hasFocus: false });
    }

    // Função para mostrar a barra de progresso
    function showProgressBar(data) {
        if (progressTimer) {
            clearInterval(progressTimer);
        }

        progressBarLabel.textContent = data.label || 'Aguarde...';
        progressBarFill.style.backgroundColor = data.color || '#e67e22';
        progressBarFill.style.width = '0%';
        progressBarFill.style.transition = 'width 0.1s linear';
        progressBarContainer.classList.remove('hidden');

        const duration = data.duration || 3000;
        let startTime = Date.now();

        progressTimer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const percentage = Math.min(100, (elapsedTime / duration) * 100);
            progressBarFill.style.width = `${percentage}%`;

            if (percentage >= 100) {
                clearInterval(progressTimer);
                progressTimer = null;
                setTimeout(() => {
                    progressBarContainer.classList.add('hidden');
                }, 300);
            }
        }, 30);
    }
    
    window.addEventListener('message', (event) => {
        const { type, menuData, progressBarData } = event.data;
        if (type === 'open') {
            openMenu(menuData);
        } else if (type === 'close') {
            closeMenu();
        } else if (type === 'showProgressBar') {
            showProgressBar(progressBarData);
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if (menuContainer.classList.contains('hidden')) return;
        
        if (isInputFocused && event.key === 'Backspace') {
            return;
        }

        const key = event.key;
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            event.preventDefault();
            if(currentElements.length > 0) {
                if (key === 'ArrowDown') selectedIndex = (selectedIndex + 1) % currentElements.length;
                else selectedIndex = (selectedIndex - 1 + currentElements.length) % currentElements.length;
                updateSelection();
            }
        } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
            const selectedElement = currentElements[selectedIndex];
            if (selectedElement && selectedElement.sliderInput) {
                event.preventDefault();
                const slider = selectedElement.sliderInput;
                const step = key === 'ArrowLeft' ? -1 : 1;
                const newValue = parseInt(slider.value, 10) + step;
                if(newValue >= slider.min && newValue <= slider.max) {
                    slider.value = newValue;
                    slider.dispatchEvent(new Event('input'));
                    slider.dispatchEvent(new Event('change'));
                }
            }
        } else if (key === 'Enter') {
            event.preventDefault();
            const selectedElement = currentElements[selectedIndex];
            if (selectedElement) {
                if (typeof selectedElement.clickAction === 'function') selectedElement.clickAction();
                else selectedElement.click();
            }
        } else if (key === 'Escape' || key === 'Backspace') {
            event.preventDefault();
            post('onMenuClose');
        }
    });
});
