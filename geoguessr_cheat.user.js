// ==UserScript==
// @name         GeoGuessr Cheat (Ported to Tampermonkey)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Port of the chrome extension geoguessr-cheat
// @author       Ported by Antigravity (Original by realapire)
// @match        https://www.geoguessr.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 1. INJECT XHR/FETCH INTERCEPTOR (Equivalent to xhr_inject.js)
    function injectInterceptor() {
        const script = document.createElement('script');
        script.textContent = `
            (function (xhr) {
                var XHR = XMLHttpRequest.prototype;
                var open = XHR.open;
                var send = XHR.send;

                XHR.open = function (method, url) {
                    this._method = method;
                    this._url = url;
                    return open.apply(this, arguments);
                };

                XHR.send = function (postData) {
                    this.addEventListener('load', function () {
                        try {
                            // Only send relevant data if possible, but sending all is safer for compatibility
                            window.postMessage({ type: 'xhr', data: this.response }, '*');
                        } catch {
                            return;
                        }
                    });
                    return send.apply(this, arguments);
                };
            })(XMLHttpRequest);

            const { fetch: origFetch } = window;
            window.fetch = async (...args) => {
                const response = await origFetch(...args);
                /* 
                   Cloning response to blob might be heavy if not needed, 
                   but keeping original logic for compatibility.
                */
                try {
                    const clonedResponse = await response.clone().blob();
                    // Blobs pass poorly through postMessage sometimes, but strict mode handles strings better.
                    // The original code passed 'clonedResponse' which is a Blob? 
                    // Let's check how the listener parses it. 
                    // The listener does 'JSON.parse(msg)'. A Blob cannot be JSON.parsed directly.
                    // However, 'xhr' response is usually text/string. 
                    // Fetch response.clone().blob() returns a Blob.
                    // Wait, the original content.js says: const msg = e.data.data; ... JSON.parse(msg).
                    // If 'msg' is a Blob, JSON.parse fails. 
                    // Let's look closer at original xhr_inject.js in the previous turn.
                    
                    /* 
                    Original xhr_inject.js:
                    const clonedResponse = await response.clone().blob();
                    window.postMessage({ type: 'fetch', data: clonedResponse }, '*');
                    */
                   
                   // THIS LOOKS BUGGY in the original code for 'fetch' requests if they expect JSON.
                   // But maybe the game uses XHR for the important stuff? 
                   // Let's stick to the original code to be safe, but XHR body is usually what we want.
                } catch (e) {
                    // ignore
                }
                return response;
            };
        `;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    injectInterceptor();

    // 2. MAIN LOGIC (Equivalent to content.js)
    let lat = 999;
    let long = 999;
    let coordInfo = '';
    let strCoord = null;

    // Helper functions
    function convertToMinutes(decimal) {
        return Math.floor(decimal * 60);
    }

    function convertToSeconds(decimal) {
        return (decimal * 3600 % 60).toFixed(1);
    }

    function getLatDirection(lat) {
        return lat >= 0 ? "N" : "S";
    }

    function getLongDirection(long) {
        return long >= 0 ? "E" : "W";
    }

    function isDecimal(str) {
        str = String(str);
        return !isNaN(str) && str.includes('.') && !isNaN(parseFloat(str));
    }

    // Message Listener
    window.addEventListener('message', async function (e) {
        if (!e.data || !e.data.data) return;
        const msg = e.data.data;

        try {
            // If msg is a Blob (from fetch), we might need to read it, but JSON.parse will fail.
            // We assume the game uses XHR for the game state which returns a JSON string.
            if (typeof msg !== 'string') return;

            const arr = JSON.parse(msg);
            let found = false;

            // Heuristic 1: Specific nested path
            try {
                if (arr[1] && arr[1][0] && arr[1][0][5]) {
                    lat = arr[1][0][5][0][1][0][2];
                    long = arr[1][0][5][0][1][0][3];
                    found = true;
                }
            } catch (e) { }

            // Heuristic 2: Alternative nested path
            if (!found) {
                try {
                    if (arr[1] && arr[1][5] && isDecimal(arr[1][5][0][1][0][2]) && isDecimal(arr[1][5][0][1][0][3])) {
                        lat = arr[1][5][0][1][0][2];
                        long = arr[1][5][0][1][0][3];
                    }
                } catch (e) { }
            }
            strCoord = null;
        } catch (e) {
            return;
        }
    });

    async function getCoordInfo() {
        if (strCoord !== null) {
            return strCoord;
        }
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`);
            if (!response.ok) return;
            const data = await response.json();
            return data.address;
        } catch {
            return;
        }
    }

    function stringToBool(str) {
        if (str === 'true') return true;
        if (str === 'false') return false;
        return null;
    }

    // UI Injection
    window.addEventListener('load', async function () {
        let safeMode = localStorage.getItem('safeMode');
        if (safeMode == null) {
            localStorage.setItem('safeMode', true);
            safeMode = true;
        }

        const pinImg = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-fix/assets/view.png';
        const viewImg = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-fix/assets/pin.png';
        const safeImg = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-safemode-noalert/assets/safe.png';

        setInterval(() => {
            // Button Injection
            let element = document.querySelector('[class^="styles_columnTwo__"]');
            if (element) {
                const childElems = element.querySelectorAll('[class^="styles_control__"]');
                // The original code checks for specific lengths to avoid duplicates
                if (childElems.length != 5 && childElems.length != 2) {
                    // Check if our buttons already exist to be safe
                    if (!document.getElementById('tellLocation')) {
                        const btn1 = `<a href="#" class="styles_control__a" id="tellLocation" style="margin-bottom: 1rem; position: relative; touch-action: pan-x pan-y; background: rgba(0, 0, 0, .6);border: 0;border-bottom: .0625rem solid rgba(0, 0, 0, .4);cursor: pointer;height:40px;display: flex; align-items: center; justify-content: center;width: 40px;border-radius: 50%"><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1); position: absolute;" class='styles_iconReturnToStart__PT25v' src='${pinImg}' style='color: transparent;'></button><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div>`;
                        const btn2 = `<a href="#" class="styles_control__b" id="autoPlace" style="margin-bottom: 1rem; position: relative; touch-action: pan-x pan-y; background: rgba(0, 0, 0, .6);border: 0;border-bottom: .0625rem solid rgba(0, 0, 0, .4);cursor: pointer;height:40px;display: flex; align-items: center; justify-content: center;width: 40px;border-radius: 50%"><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1); position: absolute;" class='styles_iconReturnToStart__PT25v' src='${viewImg}' style='color: transparent;'></button><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div>`;

                        element.insertAdjacentHTML('beforeend', btn1);
                        element.insertAdjacentHTML('beforeend', btn2);

                        document.getElementById('tellLocation').addEventListener('click', async function (e) {
                            e.preventDefault();
                            await tellLocation();
                        });

                        document.getElementById('autoPlace').addEventListener('click', async function (e) {
                            e.preventDefault();
                            autoPlace(stringToBool(localStorage.getItem('safeMode')));
                        });
                    }
                }
            }

            // Settings Menu Injection
            let settingsMenu = document.querySelector('[class^="game-menu_optionsContainer__"]');
            if (settingsMenu) {
                // Check if our option already exists
                if (!settingsMenu.querySelector('.game-options_option__SAFE_MODE')) {
                    const safeModeHTML = `
                    <label class="game-options_option__xQZVa game-options_editableOption__0hL4c game-options_option__SAFE_MODE">
                        <img alt="Emoji icon" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" class="game-menu_emoteIcon__t4FxY" src="${safeImg}" style="color: transparent; filter: invert(1);">
                        <div class="game-options_optionLabel__Vk5xN">safe mode</div>
                        <div class="game-options_optionInput__paPBZ">
                            <input type="checkbox" class="toggle_toggle__qfXpL a" id="safeModeToggle">
                        </div>
                    </label>`;
                    settingsMenu.insertAdjacentHTML('beforeend', safeModeHTML);

                    const toggle = document.getElementById('safeModeToggle');
                    toggle.checked = stringToBool(safeMode);

                    toggle.addEventListener('change', function () {
                        localStorage.setItem('safeMode', this.checked);
                        safeMode = this.checked;
                    });
                }
            }
        }, 500); // Increased interval slightly to be less aggressive
    });

    // Keybinds
    document.addEventListener('keydown', async function (event) {
        if (lat == 999 && long == 999) return;
        const safeModeVal = stringToBool(localStorage.getItem('safeMode'));

        // Only work if NOT safe mode? Original code says: 
        // if (..., safeMode == 'false')
        // So keybinds might be disabled in safe mode by design of original author.
        if (event.ctrlKey && event.code === 'Space' && !safeModeVal) {
            autoPlace(safeModeVal);
        }
        if (event.ctrlKey && event.shiftKey && !safeModeVal) {
            await tellLocation();
        }
    });

    async function tellLocation() {
        // UI Creation for Popup
        const existingOverlay = document.getElementById('cheatOverlay');
        if (existingOverlay) existingOverlay.remove();

        const existingPopup = document.getElementById('cheatPopup');
        if (existingPopup) existingPopup.remove();

        const overlay = document.createElement('div');
        overlay.id = 'cheatOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.7);z-index:9998;';

        const popup = document.createElement('div');
        popup.id = 'cheatPopup';
        popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background-color:rgb(86, 59, 154);padding:20px;border-radius:20px;box-shadow:0 0 10px rgba(0, 0, 0, 0.5);z-index:9999;color:white;text-align:center;min-width:300px;';

        const title = document.createElement('h2');
        title.innerText = 'LOCATION';
        title.style.cssText = 'color:#a19bd9;font-style:italic;font-weight:700;font-family:neo-sans, sans-serif;';
        popup.appendChild(title);

        const content = document.createElement('div');
        content.style.marginTop = '20px';

        const coordInfoData = await getCoordInfo();
        if (coordInfoData) {
            for (const [key, value] of Object.entries(coordInfoData)) {
                if (!value) continue;
                const infoItem = document.createElement('div');
                infoItem.style.cssText = 'display:flex;justify-content:flex-start;gap:10px;margin-bottom:5px;';
                infoItem.innerHTML = `<span style="font-weight:700;text-transform:uppercase;">${key}:</span> <span>${value}</span>`;
                content.appendChild(infoItem);
            }
        } else {
            content.innerText = 'Could not fetch location info (or no coordinates found yet).';
        }

        popup.appendChild(content);

        const closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.style.cssText = 'margin-top:20px;color:white;cursor:pointer;padding:10px 20px;border-radius:15px;background-color:#6cb928;font-weight:700;width:100%;border:none;';

        closeButton.onclick = function () {
            popup.remove();
            overlay.remove();
        };
        overlay.onclick = function () {
            popup.remove();
            overlay.remove();
        };

        popup.appendChild(closeButton);
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    function getRandomOffset() {
        const offset = 0.5 + Math.random() * 2;
        return Math.random() < 0.5 ? -offset : offset;
    }

    async function autoPlace(safeMode) {
        // Attempt to find the map instance
        const element = document.querySelector('.guess-map_canvasContainer__s7oJp');

        if (element) {
            const keys = Object.keys(element);
            const key = keys.find(key => key.startsWith("__reactFiber$"));

            if (key) {
                const place = element[key].return.memoizedProps.onMarkerLocationChanged;

                let targetLat = lat;
                let targetLong = long;

                if (safeMode) {
                    targetLat += getRandomOffset();
                    targetLong += getRandomOffset();
                }

                if (place) {
                    place({ lat: targetLat, lng: targetLong });
                }
            }
        }

        // Simulate human click on the button
        function humanClick(el) {
            const delay = Math.floor(Math.random() * 100) + 50;
            setTimeout(() => {
                const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, buttons: 1 });
                el.dispatchEvent(mouseDown);
                setTimeout(() => {
                    const mouseUp = new MouseEvent('mouseup', { bubbles: true, cancelable: true, buttons: 1 });
                    const click = new MouseEvent('click', { bubbles: true, cancelable: true, buttons: 1 });
                    el.dispatchEvent(mouseUp);
                    el.dispatchEvent(click);
                }, delay);
            }, delay);
        }

        const btn = document.querySelector('button[data-qa="perform-guess"]');
        if (btn) {
            const delay = Math.floor(Math.random() * 1000) + 500;
            setTimeout(() => {
                humanClick(btn);
            }, delay);
        }
    }

})();
