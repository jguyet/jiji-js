const Jiji = require("jiji");

Jiji.initialize("browser", () => {
    Jiji.Router.init([
        {
            path: "/albums", controller: {
                constructor: (controller, callback) => {
                    callback();
                },
                destroy: (controller) => {
                    console.log('destroyed /albums');
                },
                isCurrentRoute: (element) => {
                    if (element.getAttribute('href') == Jiji.Router.getCurrentPage()) {
                        element.style.backgroundColor = "orange";
                    } else {
                        element.style.backgroundColor = "grey";
                    }
                },
                innerHTML: `
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
                    if (element.getAttribute('href') == Jiji.Router.getCurrentPage()) {
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
    Jiji.Router.route();
});