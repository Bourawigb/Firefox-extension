console.log("Content script loaded successfully!");

function injectMonitoringScript() {
    const script = document.createElement('script');
    script.textContent = `
        (function() {
            function reportAccess(attribute) {
                let scriptSource = 'unknown';
                try {
                    throw new Error();
                } catch (e) {
                    const stackLines = e.stack.split('\\n');
                    for (let i = 0; i < stackLines.length; i++) {
                        // Improved regex to better match external script files
                        const match = stackLines[i].match(/(\\bfile:\\/\\/\\/.+\\.js|\\bhttp:\\/\\/\\/.+\\.js|\\bhttps:\\/\\/\\/.+\\.js)/);
                        if (match && match[1]) {
                            scriptSource = match[1];
                            break;
                        }
                    }
                }
                window.postMessage({ type: 'attributeAccessed', attribute: attribute, scriptSource: scriptSource }, '*');
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

            function hookAllProperties(obj, objName) {
                for (let prop in obj) {
                    if (obj.hasOwnProperty(prop) || (obj.constructor.prototype && obj.constructor.prototype.hasOwnProperty(prop))) {
                        hookProperty(obj, prop, objName);
                    }
                }
            }

            function hookMethod(obj, method, objName) {
                const originalMethod = obj[method];
                obj[method] = function(...args) {
                    reportAccess(objName + '.' + method);
                    return originalMethod.apply(this, args);
                };
            }

            hookAllProperties(screen, 'screen');
            hookAllProperties(navigator, 'navigator');
            hookProperty(HTMLCanvasElement.prototype, 'toDataURL', 'HTMLCanvasElement');

            // Hook storage methods
            hookMethod(localStorage, 'getItem', 'localStorage');
            hookMethod(localStorage, 'setItem', 'localStorage');
            hookMethod(localStorage, 'removeItem', 'localStorage');
            hookMethod(localStorage, 'clear', 'localStorage');
            hookMethod(sessionStorage, 'getItem', 'sessionStorage');
            hookMethod(sessionStorage, 'setItem', 'sessionStorage');
            hookMethod(sessionStorage, 'removeItem', 'sessionStorage');
            hookMethod(sessionStorage, 'clear', 'sessionStorage');
        })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
}

injectMonitoringScript();

window.addEventListener('message', function(event) {
    if (event.source !== window) return;

    if (event.data.type && event.data.type === 'attributeAccessed') {
        console.log('Attribute accessed:', event.data.attribute, 'by script:', event.data.scriptSource);
        browser.runtime.sendMessage({ attributeAccessed: event.data.attribute, scriptSource: event.data.scriptSource });
    }
});
