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
        const controller = Router.getCurrentController();
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
        document.querySelectorAll("[content]").forEach(x => {
            const operation = x.getAttribute("content");
            x.innerHTML = eval(`(function Main(){ try { return (${operation}); } catch (e) { return (e) } })`).call(controller);
        });
        Object.keys(controller).filter(x => controller.binder[x]).forEach(x => controller.binder[x](controller[x], false));
    },
    prepareOperation(operation) {
        operation = operation
            .replace("$event", "event")
            .replace("$this", "element");

        for(let result of operation.replace(";", ";\n").matchAll(/this\.(.+) (\=|\+\=|\-\=) (.+?);/gm)) {
            switch(result[2]) {
                case "=":
                    operation = operation.replace(result[0], `controller.binder['${result[1]}'](${result[3]});`);
                    break ;
                default:
                    operation = operation.replace(result[0], `controller.binder['${result[1]}'](this['${result[1]}'] ${result[2]} ${result[3]});`);
                    break ;
            }
        }
        return operation;
    },
    mount: () => {
        const controller = Router.getCurrentController();

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
                Router.setUrl(href);
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('link');
        });
        document.querySelectorAll("[touch-link]").forEach(x => {
            const callback = (e) => {
                e.preventDefault();
                var href = x.attributes.href.value;
                Router.setUrl(href);
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
                Router.setUrl(href);
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('touch-link');
        });

        document.querySelectorAll("[touch-link-to-right]").forEach(x => {
            const callback = (e) => {
                e.preventDefault();
                var href = x.attributes.href.value;
                Router.setUrl(href, 'left');//left slide
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('touch-link-to-right');
        });

        document.querySelectorAll("[touch-link-to-left]").forEach(x => {
            const callback = (e) => {
                e.preventDefault();
                var href = x.attributes.href.value;
                Router.setUrl(href, 'right');//right slide
            };
            Jiji.customElementControllerList.push(Jiji.customElementController(x));
            x.addEventListener('click', callback);
            // x.removeAttribute('touch-link-to-left');
        });
    },
    Router: {
        init: (routes) => {
            var routerElement = document.getElementsByClassName("router")[0];
    
            if (routerElement == undefined) {
                console.error("Router not found please add <div class=\"router\"></div> in your app content");
                return ;
            }

            document.getElementsByTagName("body")[0].style.marginLeft = "0px";
            document.getElementsByTagName("body")[0].style.marginRight = "0px";
    
            routerElement.style.backgroundColor = "transparent";
            routerElement.style.display = "flex";
            routerElement.style.overflowX = "hidden";
            routerElement.style.overflowY = "hidden";
    
            var routerSlideElement = document.createElement("div");
            var routeElement = document.createElement("div");
            routerSlideElement.classList.add("router-slide");
            routeElement.classList.add("route");
            routerElement.appendChild(routeElement);
            routerElement.appendChild(routerSlideElement);
    
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
    
            routes.forEach((route) => Router.routes[route.path] = route);
    
            window.addEventListener('hashchange', () => {
                const urlFromHash = location.hash.substr(1);
    
                if (Router.currentRoute != urlFromHash) Router.setUrl(urlFromHash);
            });
        },
        getCurrentPage: () => {//http://host/{page}
            return Router.currentRoute;
        },
        setUrl: (url, slideDirection = "left") => {
            console.log(url);
            Router.lastUrl = Router.getCurrentPage();
            Router.currentRoute = url;
            location.hash = url;
            Router.route(slideDirection);
        },
        getUrl: () => {
            return window.location.href;
        },
        getCurrentController: () => {
            return Router.routes[Router.getCurrentPage()].controller;
        },
        route: (slideDirection = "left") => {
            const currentRoute = Router.routes[Router.getCurrentPage()];
    
            if (currentRoute == undefined) {
                console.log(Router.getCurrentPage(), Router.routes);
                Router.setUrl('/', slideDirection);
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
            if (Router.firstLoad != undefined) {
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
                if (Router.firstLoad != undefined && Jiji.device == "mobile") {
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
                    Router.firstLoad = false;
                    appBeforeElement.style.display = "none";
                }
                if (Router.lastUrl != undefined && Router.routes[Router.lastUrl] != undefined) { // destroy last
                    if (Router.routes[Router.lastUrl].controller.destroy != undefined) {
                        Router.routes[Router.lastUrl].controller.destroy(Router.routes[Router.lastUrl].controller);
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
/** export Router */
const Router = Jiji.Router;
/** [exports] Framework */
document.Jiji = Jiji;
/** [exports] Router */
document.Router = Jiji.Router;
////////////////////////////////////

Jiji.initialize("browser", () => {
    Router.init([
        {
            path: "/albums", controller: {
                constructor: (controller, callback) => {
                    callback();
                },
                destroy: (controller) => {
                    console.log('destroyed /albums');
                },
                isCurrentRoute: (element) => {
                    if (element.getAttribute('href') == Router.getCurrentPage()) {
                        element.style.backgroundColor = "orange";
                    } else {
                        element.style.backgroundColor = "grey";
                    }
                },
                innerHTML: /* html */`
                    <div style="display:flex;">
                        <div touch-link href="/" style="height: 100%;width: 100%;background-color:grey;cursor:pointer;">
                            /
                        </div>
                        <div touch-link href="/albums" load="this.isCurrentRoute($this);" style="height: 100%;width: 100%;background-color:grey;cursor:pointer;">
                            /albums
                        </div>
                    </div>
                `
            }
        },
        {
            path: "/", controller: {
                constructor: (controller, callback, detectChange) => {
                    console.log(controller);
                    controller.test = "salut";
                    detectChange();
                    callback();
                },
                buttonName: 'Click',
                buttonName2: 'Click2',
                test: "test",
                backgroundColor: 'blue',
                click: (element, event) => {
                    console.log('SALUT', element, event);
                },
                isCurrentRoute: (element) => {
                    if (element.getAttribute('href') == Router.getCurrentPage()) {
                        element.style.backgroundColor = "orange";
                    } else {
                        element.style.backgroundColor = "grey";
                    }
                },
                innerHTML: /* html */`
                    <div style="display:flex;">
                        <div touch-link href="/" load="this.isCurrentRoute($this);" style="height: 100%;width: 100%;background-color:grey;cursor:pointer;">
                            /
                        </div>
                        <div touch-link href="/albums" style="height: 100%;width: 100%;background-color:grey;cursor:pointer;">
                            /albums
                        </div>
                    </div>
                    /
                    <input class="form-control" bind="test" type="text" name="test" />
                    <div if="this.test != ''" class="ninja">
                        <p content="this.test"></p>
                        <button type="button" class="btn btn-primary" click="this.click($this, $event);" ><display content="this.buttonName"></display></button>
                    </div>
                    <div else>else content</div>
                    <button type="button" class="btn btn-primary" mouseover="$this.style.backgroundColor = this.backgroundColor;" click="this.test += 1;"  mouseleave="$this.style.backgroundColor = 'white';" ><display content="this.buttonName2"></display></button>
                `
            }
        }
    ]);
    Router.route();
});
