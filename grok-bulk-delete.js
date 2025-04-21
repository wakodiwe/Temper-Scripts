// ==UserScript==
// @name         ChatGPT Sidebar Checkboxes
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adds checkboxes next to ChatGPT sidebar chat titles, keeps them checked, and shows all checked chat numbers in alert
// @author       Grok
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function waitForElement(selector, callback, timeout = 10000) {
        const start = Date.now();
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Element gefunden: ${selector}`);
                callback(element);
            } else if (Date.now() - start < timeout) {
                console.log(`Warte auf Element: ${selector}`);
                setTimeout(checkElement, 500);
            } else {
                console.error(`Timeout: Element ${selector} nicht gefunden`);
            }
        };
        checkElement();
    }

    function addCheckboxes() {
        console.log('Füge Checkboxen hinzu');
        const chatItems = document.querySelectorAll('nav a[href^="/c/"]');
        console.log(`Gefundene Chat-Items: ${chatItems.length}`);

        if (chatItems.length === 0) {
            console.warn('Keine Chats gefunden. Sidebar sichtbar?');
            setTimeout(addCheckboxes, 1000);
            return;
        }

        chatItems.forEach((item, index) => {
            if (!item.querySelector('input[type="checkbox"]')) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.cssText = 'margin-right: 10px; vertical-align: middle; width: 22px; height: 22px; position: relative; z-index: 10000; border: 2px solid black; background: white; cursor: pointer; accent-color: blue; outline: 2px solid transparent; box-shadow: 0 0 5px rgba(0,0,0,0.5); appearance: auto;';
                checkbox.dataset.chatNumber = index + 1;
                checkbox.addEventListener('click', (event) => {
                    event.stopPropagation();
                    checkbox.checked = !checkbox.checked;
                    checkbox.setAttribute('checked', checkbox.checked.toString());
                    console.log(`Checkbox ${index + 1} geklickt, checked: ${checkbox.checked}, DOM checked: ${checkbox.getAttribute('checked')}`);

                    const checkedCheckboxes = document.querySelectorAll('nav a[href^="/c/"] input[type="checkbox"][checked]');
                    const chatNumbers = Array.from(checkedCheckboxes)
                        .map(cb => cb.dataset.chatNumber)
                        .sort((a, b) => a - b);
                    const alertMessage = chatNumbers.length > 0 ? `Chats ${chatNumbers.join(',')}.` : 'Keine Chats ausgewählt.';
                    console.log(`Alert-Message: ${alertMessage}`);
                    alert(alertMessage);
                });
                checkbox.addEventListener('change', () => {
                    console.log(`Checkbox ${index + 1} geändert, checked: ${checkbox.checked}, DOM checked: ${checkbox.getAttribute('checked')}`);
                });

                const titleContainer = item.querySelector('div[class*="title"], div[class*="conversation"], div');
                if (titleContainer) {
                    titleContainer.style.display = 'flex';
                    titleContainer.style.alignItems = 'center';
                    titleContainer.style.position = 'relative';
                    titleContainer.style.zIndex = '1000';
                    titleContainer.prepend(checkbox);
                    console.log(`Checkbox zu Chat-Item ${index + 1} hinzugefügt`);
                } else {
                    console.warn(`Kein Titel-Container für Chat-Item ${index + 1} gefunden`);
                    item.style.position = 'relative';
                    item.style.zIndex = '1000';
                    item.prepend(checkbox);
                }
            }
        });
    }

    function init() {
        addCheckboxes();
        const observer = new MutationObserver(() => {
            console.log('Sidebar-Änderung erkannt, überprüfe Checkboxen');
            addCheckboxes();
        });
        waitForElement('nav', (nav) => {
            observer.observe(nav, { childList: true, subtree: true });
        });
    }

    waitForElement('nav', () => {
        console.log('Sidebar geladen, starte Skript');
        init();
    });
})();
