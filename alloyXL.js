Alloy.createController = function(name, args) {

    // create instance to the controller and view
    var controller = new(require("alloy/controllers/" + name))(args);

    // check if we have a view and not just <Alloy/>
    if (controller.__views.length > 0) {

        var view = controller.getView();

        // initialise Alloy.Controllers
        Alloy.Controllers = Alloy.Controllers || {};

        // handles opening controllers in folders e.g. screens/login
        var path = name.split("/");

        // if we have a path, set name to the last part (controller name)
        if (path.length > 0) name = path[path.length - 1];

        // save the controller to Alloy.Controllers for global access
        Alloy.Controllers[name] = controller;

        // add a once event handler
        controller.once = function(eventName, callback) {
            controller.on(eventName, function() {
                controller.off(eventName);
                callback();
            });
            return controller;
        };

        if (typeof view.open == "function") {

            // fire an open event on open
            view.addEventListener("open", function(e) {
                controller.trigger("open", e);
                if (ENV_DEV) console.log("controller " + name + " was opened");
            });

            // fully clean up the view and controller on close
            view.addEventListener("close", function(e) {
                view = null;
                controller.off();
                controller.destroy();
                Alloy.Controllers[controller.id] = null;
                delete Alloy.Controllers[controller.id];
                controller = null;

                if (ENV_DEV) console.log("Controller " + name + " cleaned up!");
            });

            // fire an open event on open
            view.addEventListener("postlayout", function(e) {
                controller.trigger("postlayout", e);
                if (ENV_DEV) console.log("controller " + name + " layout finished");
            });

        } else {
            // fire an open event on open
            view.addEventListener("postlayout", function(e) {
                controller.trigger("postlayout", e);
                if (ENV_DEV) console.log("controller " + name + " layout finished");
            });
        }

    }

    return controller;
};
