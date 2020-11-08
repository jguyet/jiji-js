/**
 *  Jiji Framework 2020
 *  Author : Jeremy Guyet
 */
const Jiji = {
    device: "browser",// browser || mobile
    initialize: function(device, callback) {
        Jiji.device = device;
        document.addEventListener('deviceready', callback.bind(this), false);
        document.addEventListener('DOMContentLoaded', callback.bind(this), false);
    },
    customElementController: () => { return { destroy: () => {} }; },
    customElementControllerList: [],
    detectChangeVerificationFunction: () => {
        const controller = Jiji.Router.getCurrentController();
        document.querySelectorAll("[if]").forEach(x => {
            const operation = x.getAttribute("if");
            if (eval(`(function Main(){ try { return (${operation}); } catch (e) { return (false) } })`).call(controller)) {
                x.style.removeProperty('display');
                return ;
            }
            x.style.display = 'none';
        });
        document.querySelectorAll("[else]").forEach(x => {
            const ifElement = x.previousElementSibling;// last node
            const operation = ifElement.getAttribute("if");
            if (!eval(`(function Main(){ try { return (${operation}); } catch (e) { return (false) } })`).call(controller)) {
                x.style.removeProperty('display');
                return ;
            }
            x.style.display = 'none';
        });
        document.querySelectorAll("[in]").forEach(x => {
            const operation = x.getAttribute("in");
            x.innerHTML = eval(`(function Main(){ try { return (${operation}); } catch (e) { return (e) } })`).call(controller);
        });
        Object.keys(controller).filter(x => controller.binder[x]).forEach(x => controller.binder[x](controller[x], false));
    },
    prepareOperation(operation) {
        operation = operation
            .replaceAll("$event", "event")
            .replaceAll("$this", "element");

        for(let result of operation.replaceAll(";", ";\n").matchAll(/this\.(.+) (\=|\+\=|\-\=) (.+?);/gm)) {
            switch(result[2]) {
                case "=":
                    operation = operation.replaceAll(result[0], `controller.binder['${result[1]}'](${result[3]});`);
                    break ;
                default:
                    operation = operation.replaceAll(result[0], `controller.binder['${result[1]}'](this['${result[1]}'] ${result[2]} ${result[3]});`);
                    break ;
            }
        }
        return operation;
    },
    mount: () => {
        const controller = Jiji.Router.getCurrentController();

        controller.bind = {};
        controller.binder = {};
        Jiji.customElementControllerList.forEach(x => { x.destroy(); });
        Jiji.customElementControllerList = [];

        document.querySelectorAll("[load]").forEach(x => {
            const operation = Jiji.prepareOperation(x.getAttribute("load"));
            eval(`(function Main(element){ try { ${operation} } catch (e) { console.error(e); } })`).call(controller, x);
        });
        document.querySelectorAll("[bind]").forEach(x => {
            const bindingKey = x.getAttribute("bind");
            const update = (element, detectChange = true) => {
                controller[bindingKey] = element.value;
                if (detectChange) Jiji.detectChangeVerificationFunction();
            }
            console.log(x.value);
            x.addEventListener('change', () => { update(x); });
            x.addEventListener('keyup', () => { update(x); });
            // x.removeAttribute('bind');
            update(x);
            controller.binder[bindingKey] = (v, detectChange) => { x.value = v; update(x, detectChange); };
        });
        document.querySelectorAll("[bind-innerHTML]").forEach(x => {
            const bindingKey = x.getAttribute("bind-innerHtml");
            const update = (element) => { controller.bind[bindingKey] = element.innerHTML; }
            x.addEventListener('change', () => { x.innerHTML = x.value; update(x); });
            // x.removeAttribute('bind-innerHTML');
            update(x);
            controller.binder[bindingKey] = (v) => { x.innerHTML = v; update(x); };
        });
        Jiji.detectChangeVerificationFunction();

        ["click", "change", "close", "dblclick", "copy", "cut", "drag", "dragend", "dragcenter", "dragleave", "dragover", "dragstart", "drop", "focus", "focusout", "keydown", "keypress", "keyup", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup", "scroll", "touchcancel", "touchend", "touchenter", "touchleave", "touchmove", "touchstart"]
        .forEach((eventName) => {
            document.querySelectorAll(`[${eventName}]`).forEach(x => {
                let operation = Jiji.prepareOperation(x.getAttribute(eventName));
                
                const callback = (e) => {
                    e.preventDefault();
                    eval(`(function Main(event, element){ try { ${operation} } catch (e) { console.error(e); } })`).call(controller, e, x);
                };
                Jiji.customElementControllerList.push(Jiji.customElementController(x));
                x.addEventListener(eventName, callback);
                //x.removeAttribute('Click');
            });
        })
        document.querySelectorAll("[link]").forEach(x => {
            const callback = (e) => {
                e.preventDefault();
                var href = x.attributes.href.value;
                Jiji.Router.setUrl(href);
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('link');
        });
        document.querySelectorAll("[touch-link]").forEach(x => {
            const callback = (e) => {
                e.preventDefault();
                var href = x.attributes.href.value;
                Jiji.Router.setUrl(href);
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('touch-link');
        });

        document.querySelectorAll("[touch-link-load]").forEach(x => {
            const callback = (e) => {
                e.preventDefault();
                x.innerHTML = '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="24px" height="24px" viewBox="0 0 128 128" xml:space="preserve"><g><path d="M75.4 126.63a11.43 11.43 0 0 1-2.1-22.65 40.9 40.9 0 0 0 30.5-30.6 11.4 11.4 0 1 1 22.27 4.87h.02a63.77 63.77 0 0 1-47.8 48.05v-.02a11.38 11.38 0 0 1-2.93.37z" fill="#ffffff" fill-opacity="1"/><animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="400ms" repeatCount="indefinite"></animateTransform></g></svg>';
                var href = x.attributes.href.value;
                Jiji.Router.setUrl(href);
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('touch-link');
        });

        document.querySelectorAll("[touch-link-to-right]").forEach(x => {
            const callback = (e) => {
                e.preventDefault();
                var href = x.attributes.href.value;
                Jiji.Router.setUrl(href, 'left');//left slide
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('touch-link-to-right');
        });

        document.querySelectorAll("[touch-link-to-left]").forEach(x => {
            const callback = (e) => {
                e.preventDefault();
                var href = x.attributes.href.value;
                Jiji.Router.setUrl(href, 'right');//right slide
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('touch-link-to-left');
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
        getCurrentPage: () => {//http://host/{page}
            return Jiji.device == "mobile" ? Jiji.Router.currentRoute : window.location.pathname;
        },
        setUrl: (url, slideDirection = "left") => {
            console.log(url);
            Jiji.Router.lastUrl = Jiji.Router.getCurrentPage();
            Jiji.Router.currentRoute = url;
            if (Jiji.device == "mobile") location.hash = url; else window.history.pushState({},"", url);
            Jiji.Router.route(slideDirection);
        },
        getUrl: () => {
            return window.location.pathname;
        },
        getCurrentController: () => {
            return Jiji.Router.routes[Jiji.Router.getCurrentPage()].controller;
        },
        route: (slideDirection = "left") => {
            const currentRoute = Jiji.Router.routes[Jiji.Router.getCurrentPage()];
    
            if (currentRoute == undefined) {
                const defaultRoute = Object.keys(Jiji.Router.routes).map(key => Jiji.Router.routes[key]).find(x => x.default === true);
                Jiji.Router.setUrl(defaultRoute ? defaultRoute.path : '/', slideDirection);
                return ;
            }
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
            appElement.innerHTML = currentRoute.controller.innerHTML;
    
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
                }
                if (Jiji.Router.lastUrl != undefined && Jiji.Router.routes[Jiji.Router.lastUrl] != undefined) { // destroy last
                    if (Jiji.Router.routes[Jiji.Router.lastUrl].controller.destroy != undefined) {
                        Jiji.Router.routes[Jiji.Router.lastUrl].controller.destroy(Jiji.Router.routes[Jiji.Router.lastUrl].controller);
                    }
                }
                return ;
            };
    
            Jiji.mount();
            currentRoute.controller.constructor(currentRoute.controller, callbackApeare, Jiji.detectChangeVerificationFunction);
        },
        routes: {}
    }
};

// for use with npm package
if (typeof(module) !== 'undefined') {
	module.exports = Jiji;
}
// for use with npm package
if (typeof(document) !== 'undefined') {
    /** [exports] Framework */
    document.Jiji = Jiji;
    /** [exports] Router */
    document.Router = Jiji.Router;
    ////////////////////////////////////
}