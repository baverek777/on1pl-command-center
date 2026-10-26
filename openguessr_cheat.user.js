// ==UserScript==
// @name         Openguessr Location Hack (WORKING 2025)
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Openguessr Location Hack
// @author       Kara01
// @match        https://openguessr.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.color = '#fff';
    container.style.padding = '10px';
    container.style.borderRadius = '5px';
    container.style.zIndex = '9999';
    container.style.display = 'none'; // Initially hidden
    document.body.appendChild(container);

    const latLabel = document.createElement('div');
    container.appendChild(latLabel);

    const lngLabel = document.createElement('div');
    container.appendChild(lngLabel);

    const mapsLink = document.createElement('a');
    mapsLink.style.color = '#fff';
    mapsLink.style.textDecoration = 'underline';
    mapsLink.target = '_blank';
    mapsLink.textContent = 'Open in Google Maps';
    container.appendChild(mapsLink);

    let previousLat = null;
    let previousLng = null;

    function updateLocation() {
        const address = window.location.href;
        const searchParams = new URL(address).searchParams;
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (lat && lng && (lat !== previousLat || lng !== previousLng)) {
            previousLat = lat;
            previousLng = lng;

            latLabel.textContent = `Latitude: ${lat}`;
            lngLabel.textContent = `Longitude: ${lng}`;
            mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

            // Show container if hidden
            // container.style.display = 'block'; 
            // Commented out to respect toggle choice, user can toggle with Insert
        }
    }

    // Update location initially
    updateLocation();

    // Check for location changes every 1 second
    setInterval(updateLocation, 1000);

    // Toggle container visibility on '1' key press
    document.addEventListener('keydown', function (event) {
        if (event.key === '1') {
            if (container.style.display === 'none') {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        }
    });
})();
