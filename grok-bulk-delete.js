// ==UserScript==
// @name         ChatGPT Sidebar Checkboxes
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds checkboxes next to ChatGPT sidebar chat titles and shows chat number on click
// @author       Grok
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Funktion, um auf ein Element zu warten
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

    // Funktion, um Checkboxen hinzuzufügen
    function addCheckboxes() {
        console.log('Füge Checkboxen hinzu');
        const chatItems = document.querySelectorAll('nav a[href^="/c/"]');
        console.log(`Gefundene Chat-Items: ${chatItems.length}`);

        if (chatItems.length === 0) {
            console.warn('Keine Chats gefunden. Sidebar sichtbar?');
            setTimeout(addCheckboxes, 1000); // Erneut versuchen
            return;
        }

        chatItems.forEach((item, index) => {
            if (!item.querySelector('input[type="checkbox"]')) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.cssText = 'margin-right: 10px; vertical-align: middle; width: 22px; height: 22px; position: relative; z-index: 10000; border: 2px solid black; background: white; cursor: pointer; accent-color: blue; outline: 2px solid transparent; box-shadow: 0 0 5px rgba(0,0,0,0.5); appearance: auto;';
                checkbox.dataset.chatNumber = index + 1; // Speichere Chat-Nummer
                checkbox.addEventListener('click', (event) => {
                    event.stopPropagation(); // Verhindert Chat-Öffnung
                    checkbox.checked = !checkbox.checked; // Toggle checked-Status
                    checkbox.setAttribute('checked', checkbox.checked.toString()); // DOM-Konsistenz
                    console.log(`Checkbox ${index + 1} geklickt, checked: ${checkbox.checked}, DOM checked: ${checkbox.getAttribute('checked')}`);
                    alert(`Chat ${checkbox.dataset.chatNumber}.`);
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
                    item.prepend(checkbox); // Fallback
                }
            }
        });
    }

    // Hauptfunktion
    function init() {
        // Checkboxen automatisch hinzufügen
        addCheckboxes();

        // Beobachter für dynamische Sidebar-Änderungen
        const observer = new MutationObserver(() => {
            console.log('Sidebar-Änderung erkannt, überprüfe Checkboxen');
            addCheckboxes();
        });
        waitForElement('nav', (nav) => {
            observer.observe(nav, { childList: true, subtree: true });
        });
    }

    // Sidebar laden
    waitForElement('nav', () => {
        console.log('Sidebar geladen, starte Skript');
        init();
    });
})();
