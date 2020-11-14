/**
 *  Jiji Framework 2020
 *  Author : Jeremy Guyet
 *  Version : 0.0.17
 */
const Jiji = {
    device: "browser",// browser || mobile
    protocols: ["https", "http"],
    globals: {},
    verbose: false,
    initialize: function (callback) {
        document.addEventListener('deviceready', callback.bind(this), false);
        document.addEventListener('DOMContentLoaded', callback.bind(this), false);
        if (Jiji.device === "browser" && location.hostname !== "localhost" && !Jiji.protocols.includes(location.protocol.replace(":", ""))) {
            location.protocol = `${Jiji.protocols[0]}:`;
        }
    },
    customElementController: () => { return { destroy: () => {} }; },
    customElementControllerList: [],
    inArray: [],
    debug: function () { if (Jiji.verbose) console.log('%c[debug]%c', 'color: orange', 'color: white', ... arguments) },
    detectChangeVerificationFunction: (withoutController = false) => {
        const controller = Jiji.Router.getCurrentController();
        Jiji.debug('detectChangeVerificationFunction');
        document.querySelectorAll("[if]").forEach(x => {
            const operation = Jiji.prepareOperation(x.getAttribute("if"));
            if (eval(`(function Main(controller, event, element, globals){ try { return (${operation}); } catch (e) { return (false) } })`).call(controller, controller, {}, x, Jiji.globals)) {
                x.style.removeProperty('display');
                if (x.nextElementSibling && x.nextElementSibling.hasAttribute("else")) {
                    x.nextElementSibling.style.display = 'none';
                }
                return ;
            } else if (x.nextElementSibling && x.nextElementSibling.hasAttribute("else")) {
                x.nextElementSibling.style.removeProperty('display');
            }
            x.style.display = 'none';
        });
        Jiji.inArray.forEach(id => {
            const x = document.querySelector(`[in-id=${id}]`);
            const operation = Jiji.prepareOperation(x.getAttribute("in"));

            x.innerHTML = eval(`(function Main(controller, event, element, globals){ try { return (${operation}); } catch (e) { return (e) } })`).call(controller, controller, {}, x, Jiji.globals);
        });
        document.querySelectorAll("[bind]").forEach(x => {
            const bindingKey = x.getAttribute("bind").replace("this.", "");
            if (document.activeElement !== x) { // apply if not focused
                x.value = controller[bindingKey];
            }
        });
    },
    generateCurrentMapController: () => {
        const controller = Jiji.Router.getCurrentController();

        if (Jiji.Router.mapCurrentController) {
            Jiji.Router.mapCurrentLastController = Jiji.Router.mapCurrentController;
        }
        Jiji.Router.mapCurrentController = JSON.stringify(Object.keys(controller)
            .filter(key => !["function"].includes(typeof controller[key]))
            .filter(key => !["bind", "binder", "intervals", "timeouts", "innerHTML"].includes(key))
            .reduce((a, b) => { a[b] = controller[b]; return a; }, {}));
    },
    detectChangeControllerVerification: () => {
        if (Jiji.Router.mapCurrentLastController && Jiji.Router.mapCurrentController != Jiji.Router.mapCurrentLastController) {
            Jiji.Router.mapCurrentLastController = Jiji.Router.mapCurrentController;
            Jiji.detectChangeVerificationFunction();
        }
    },
    prepareOperation(operation) {
        [
            { regex: /\$event/g, replace: "event" },
            { regex: /\$this/g, replace: "element" },
            { regex: /\$global/g, replace: "global" },
            { regex: /setInterval\(/g, replace: "this.setInterval(" },
            { regex: /setTimeout\(/g, replace: "this.setTimeout(" }
        ].forEach(replacer => operation = operation.replace(replacer.regex, replacer.replace));
        return operation;
    },
    DetectChange: {
        enabled: true,
        interval: 100,
        on: () => { Jiji.DetectChange.enabled = true; },
        off: () => { Jiji.DetectChange.enabled = false; },
        applyDetectChangeInterval: () => {
            if (!Jiji.DetectChange.enabled) return ;
            const controller = Jiji.Router.getCurrentController();
            /** DETECT CHANGE */
            const checkChangeInterval = () => {
                Jiji.generateCurrentMapController();
                Jiji.detectChangeControllerVerification();
            }
            checkChangeInterval();
            Jiji.DetectChange.saveIntervalId = controller.setInterval(checkChangeInterval, Jiji.DetectChange.interval);
        },
        detect: () => Jiji.detectChangeVerificationFunction
    },
    mount: () => {
        const controller = Jiji.Router.getCurrentController();

        controller.intervals = [];
        controller.timeouts = [];
        controller.setInterval = (a, b) => { const id = setInterval(a, b); controller.intervals.push(id); return id; };
        controller.setTimeout = (a, b) => { const id = setTimeout(a, b); controller.timeouts.push(id); return id; };
        Jiji.inArray = [];
        Jiji.customElementControllerList.forEach(x => { x.destroy(); });
        Jiji.customElementControllerList = [];

        document.querySelectorAll("in").forEach(x => {
            if (x.hasAttribute('in')) return ;
            x.setAttribute("in", x.innerText);
        });
        document.querySelectorAll("[in]").forEach(x => {
            const id = "in" + Jiji.inArray.length;

            x.setAttribute("in-id", id);
            Jiji.inArray.push(id);
        });
        document.querySelectorAll("[bind]").forEach(x => {
            const bindingKey = x.getAttribute("bind").replace("this.", "");
            controller[bindingKey] = x.value;
            x.onchange = () => { controller[bindingKey] = x.value; };
            x.onkeyup = () => { controller[bindingKey] = x.value; };
        });
        Jiji.DetectChange.applyDetectChangeInterval();// Apply Detect Change Interval before load
        Jiji.detectChangeVerificationFunction();// Detect Change before load
        document.querySelectorAll("[load]").forEach(x => {
            const operation = Jiji.prepareOperation(x.getAttribute("load"));
            eval(`(function Main(controller, element, event, globals){ try { ${operation} } catch (e) { console.error(e); } })`).call(controller, controller, x, {}, Jiji.globals);
        });
        ["click", "change", "close", "dblclick", "copy", "cut", "drag", "dragend", "dragcenter", "dragleave", "dragover", "dragstart", "drop", "focus", "focusout", "keydown", "keypress", "keyup", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup", "scroll", "touchcancel", "touchend", "touchenter", "touchleave", "touchmove", "touchstart"]
        .forEach((eventName) => {
            document.querySelectorAll(`[${eventName}]`).forEach(x => {
                const operation = Jiji.prepareOperation(x.getAttribute(eventName));
                const callback = (e) => {
                    e.preventDefault();
                    eval(`(function Main(controller, event, element, globals){ try { ${operation} } catch (e) { console.error(e); } })`).call(controller, controller, e, x, Jiji.globals);
                };
                Jiji.customElementControllerList.push(Jiji.customElementController(x));
                x['on' + eventName] = callback;
            });
        });
        [
            { selector: "[external-link]", f: (element, event, href) => {  Object.assign(document.createElement('a'), { target: element.getAttribute('external-link'), href: href, }).click(); } },
            { selector: "[link]", f: (element, event, href) => { Jiji.Router.setUrl(href) } },
            { selector: "[touch-link]", f: (element, event, href) => { Jiji.Router.setUrl(href) } },
            { selector: "[touch-link-load]", f: (element, event, href) => {
                    x.innerHTML = '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="24px" height="24px" viewBox="0 0 128 128" xml:space="preserve"><g><path d="M75.4 126.63a11.43 11.43 0 0 1-2.1-22.65 40.9 40.9 0 0 0 30.5-30.6 11.4 11.4 0 1 1 22.27 4.87h.02a63.77 63.77 0 0 1-47.8 48.05v-.02a11.38 11.38 0 0 1-2.93.37z" fill="#ffffff" fill-opacity="1"/><animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="400ms" repeatCount="indefinite"></animateTransform></g></svg>';
                    Jiji.Router.setUrl(href)
                }
            },
            { selector: "[touch-link-to-right]", f: (element, event, href) => { Jiji.Router.setUrl(href, 'left');/*left slide*/ } },
            { selector: "[touch-link-to-left]", f: (element, event, href) => { Jiji.Router.setUrl(href, 'right');/*right slide*/ } },
        ].forEach(event => {
            document.querySelectorAll(event.selector).forEach(x => {
                const callback = (e) => {
                    e.preventDefault();
                    var href = x.attributes.href.value;
                    event.f(x, e, href);
                };
                Jiji.customElementControllerList.push(Jiji.customElementController(x));
                x.onclick = callback;
            });
        });
    },
    Router: {
        initialize: (routes) => {
            var routerElement = document.getElementsByClassName("router")[0];
    
            if (routerElement == undefined) {
                console.error("Router not found please add <div class=\"router\"></div> in your app content");
                return ;
            }

            document.getElementsByTagName("body")[0].style.marginLeft = "0px";
            document.getElementsByTagName("body")[0].style.marginRight = "0px";
    
            if (Jiji.device == "mobile") {
                routerElement.style.backgroundColor = "transparent";
                routerElement.style.display = "flex";
                routerElement.style.overflowX = "hidden";
                routerElement.style.overflowY = "hidden";
            }
    
            var routerSlideElement = document.createElement("div");
            var routeElement = document.createElement("div");
            routerSlideElement.classList.add("router-slide");
            routeElement.classList.add("route");
            routerElement.appendChild(routeElement);
            routerElement.appendChild(routerSlideElement);
    
            if (Jiji.device == "mobile") {
                routeElement.style.display = "inline-block";
                routeElement.style.position = "absolute";
                routeElement.style.width = "100%";
                routeElement.style.maxWidth = "100%";
                routeElement.style.maxHeight = "100%";
                routeElement.style.backgroundColor = "white";
                routeElement.style.top = "0px";

                routerSlideElement.style.display = "inline-block";
                routerSlideElement.style.position = "absolute";
                routerSlideElement.style.width = "100%";
                routerSlideElement.style.maxWidth = "100%";
                routerSlideElement.style.maxHeight = "100%";
                routerSlideElement.style.backgroundColor = "white";
                routerSlideElement.style.top = "0px";
            }
    
            routes.forEach((route) => Jiji.Router.routes[route.path] = route);
    
            if (Jiji.device == "mobile") {
                window.addEventListener('hashchange', () => {
                    const urlFromHash = location.hash.substr(1);
        
                    if (Jiji.Router.currentRoute != urlFromHash) Jiji.Router.setUrl(urlFromHash);
                });
            }
        },
        addRoutes: (routes = []) => { routes.forEach((route) => Jiji.Router.routes[route.path] = route); },
        addRoute: (route) => Jiji.Router.addRoutes([route]),
        removeRoutes: (routes = []) => { routes.forEach((route) => delete Jiji.Router.routes[route]); },
        removeRoute: (route) => { Jiji.Router.removeRoutes([route]); },
        getCurrentPage: () => {//http://host/{page}
            return Jiji.device == "mobile" ? Jiji.Router.currentRoute : window.location.pathname;
        },
        setUrl: (url, slideDirection = "left") => {
            Jiji.Router.lastUrl = Jiji.Router.getCurrentPage();
            Jiji.Router.currentRoute = url;
            if (Jiji.device == "mobile") location.hash = url; else window.history.pushState({},"", url);
            Jiji.Router.route(slideDirection);
        },
        getUrl: () => {
            return window.location.pathname;
        },
        currentController: undefined,
        getCurrentController: () => {
            return Jiji.Router.currentController;
        },
        setCurrentController: (controller) => {
            Jiji.Router.currentController = controller;
        },
        searchController: (routes, path, slideDirection) => {
            const currentRouteKey = Object.keys(routes).find(key => {
                if (routes[key].index && path.match(new RegExp("^" + `${key}/*`.replace(/\//gm, "\\/").replace(/\*/gm, "([^\\/\\s])+") + "$")) !== null) {
                    return true;
                }
                return key === "**" ? key : path.match(new RegExp("^" + key.replace(/\//gm, "\\/").replace(/\*/gm, "([^\\/\\s])+") + "$")) !== null;
            });
            const currentRoute = routes[currentRouteKey];
    
            if (currentRoute == undefined) {
                if (path !== '/') Jiji.Router.setUrl('/', slideDirection); else console.error("You dont have a default controller /")
                return undefined;
            }
            if (currentRoute.redirect) {
                Jiji.Router.setUrl(currentRoute.redirect, slideDirection);
                return undefined;
            }
            if (currentRoute.index) {
                return Jiji.Router.searchController(currentRoute.index().reduce((a, route) => { a[currentRoute.path + route.path] = route; return a; }, {}), path, slideDirection);
            }
            return currentRoute;
        },
        route: (slideDirection = "left") => {
            const currentRoute = Jiji.Router.searchController(Jiji.Router.routes, Jiji.Router.getCurrentPage(), slideDirection);

            if (currentRoute === undefined) {
                return ;
            }
            Jiji.Router.setCurrentController(currentRoute.controller);
            const appElement = document.getElementsByClassName("route")[0];
            const appBeforeElement = document.getElementsByClassName("router-slide")[0];
    
            appElement.classList.remove("transite-left-to-center");
            appElement.classList.remove("transite-center-to-left");
            appElement.classList.remove("transite-center-to-right");
            appElement.classList.remove("transite-right-to-center");
    
            appBeforeElement.classList.remove("transite-left-to-center");
            appBeforeElement.classList.remove("transite-center-to-left");
            appBeforeElement.classList.remove("transite-center-to-right");
            appBeforeElement.classList.remove("transite-right-to-center");
    
            appBeforeElement.innerHTML = appElement.innerHTML;
            if (Jiji.Router.firstLoad != undefined) {
                if (slideDirection == "left") {
                    appBeforeElement.style.transform = "translate(0px, 0px);";
                    appBeforeElement.style.zIndex = "2";
                    appElement.style.transform = "translate(100%, 0px);";
                    appElement.style.zIndex = "1";
                    appBeforeElement.style.display = "inline-block";
                } else if (slideDirection == "right") {
                    appBeforeElement.style.transform = "translate(0px, 0px);";
                    appBeforeElement.style.zIndex = "2";
                    appElement.style.transform = "translate(-100%, 0px);";
                    appElement.style.zIndex = "1";
                    appBeforeElement.style.display = "inline-block";
                }
            }
            appElement.innerHTML = currentRoute.controller.innerHTML.replace(/\{\{/g, '<in>').replace(/\}\}/g, '</in>');
    
            var callbackApeare = () => {
                if (Jiji.Router.firstLoad != undefined && Jiji.device == "mobile") {
                    if (slideDirection == "left") {
                        appElement.classList.add("transite-right-to-center");
                        appBeforeElement.style.display = "inline-block";
                        appBeforeElement.classList.add("transite-center-to-left");
                        appBeforeElement.addEventListener("animationend", () => {
                            appBeforeElement.innerHTML = "";
                            appBeforeElement.style.display = "none";
                            appBeforeElement.style.zIndex = "1";
                            appElement.style.zIndex = "2";
                        }, { once: true });
                    } else if (slideDirection == "right") {
                        appElement.classList.add("transite-left-to-center");
                        appBeforeElement.style.display = "inline-block";
                        appBeforeElement.classList.add("transite-center-to-right");
                        
                        appBeforeElement.addEventListener("animationend", () => {
                            appBeforeElement.innerHTML = "";
                            appBeforeElement.style.display = "none";
                            appBeforeElement.style.zIndex = "1";
                            appElement.style.zIndex = "2";
                        }, { once: true });
                    }
                } else {
                    Jiji.Router.firstLoad = false;
                    appBeforeElement.style.display = "none";
                    appBeforeElement.innerHTML = "";
                }
                if (Jiji.Router.lastUrl !== undefined && Jiji.Router.routes[Jiji.Router.lastUrl] !== undefined && Jiji.Router.routes[Jiji.Router.lastUrl].controller !== undefined) { // destroy last
                    Jiji.Router.routes[Jiji.Router.lastUrl].controller.intervals.forEach(clearInterval);
                    Jiji.Router.routes[Jiji.Router.lastUrl].controller.timeouts.forEach(clearInterval);
                    if (Jiji.Router.routes[Jiji.Router.lastUrl].controller.destroy != undefined) {
                        Jiji.Router.routes[Jiji.Router.lastUrl].controller.destroy.call(Jiji.Router.routes[Jiji.Router.lastUrl].controller);
                    }
                }
                Jiji.mount();
                if (currentRoute.controller.mounted) currentRoute.controller.mounted.call(currentRoute.controller);
                return ;
            };
            currentRoute.controller.constructor.call(currentRoute.controller, callbackApeare);
        },
        routes: {}
    }
};

// only before browserify with nodejs
if (typeof(module) !== 'undefined') {
	module.exports = Jiji;
}
// [exports] Framework to GUI
if (typeof(document) !== 'undefined') {
    document.Jiji = Jiji;
    document.Router = Jiji.Router;
    document.DetectChange = Jiji.DetectChange;
}
if (typeof(window) !== "undefined") {
    window.Jiji = Jiji;
    window.Router = Jiji.Router;
    window.DetectChange = Jiji.DetectChange;
}