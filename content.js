console.log("Content script loaded successfully!");

function injectMonitoringScript() {
    const script = document.createElement('script');
    script.textContent = `
        (function() {
            function reportAccess(attribute) {
                window.postMessage({ type: 'attributeAccessed', attribute: attribute }, '*');
            }

            function hookProperty(obj, prop, objName) {
                let originalValue = obj[prop];

                Object.defineProperty(obj, prop, {
                    get: function() {
                        reportAccess(objName + '.' + prop);
                        return originalValue;
                    },
                    set: function(value) {
                        originalValue = value;
                    }
                });
            }

            hookProperty(screen, 'width', 'screen');
            hookProperty(screen, 'height', 'screen');
            hookProperty(navigator, 'userAgent', 'navigator');
        })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
}

injectMonitoringScript();

window.addEventListener('message', function(event) {
    if (event.source != window) return;

    if (event.data.type && event.data.type === 'attributeAccessed') {
        console.log('Attribute accessed:', event.data.attribute);
        browser.runtime.sendMessage({ attributeAccessed: event.data.attribute });
    }
});
