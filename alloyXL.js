Alloy.createController = function(name, args) {

    // create instance to the controller and view
    var controller = new(require("alloy/controllers/" + name))(args);
    var view = controller.getView();

    // initialise Alloy.Controllers
    Alloy.Controllers = Alloy.Controllers || {};

    // save the controller to Alloy.Controllers for global access
    Alloy.Controllers[name] = controller;

    // add a once event handler
    controller.once = function(name, callback) {
        controller.on(name, function() {
            controller.off(name);
            callback();
        });
        return controller;
    };

    // if we're dealing with a Ti view that has open() method, add in
    // event handlers for open, and close to clean up
    if (typeof view.open === "function") {

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

    return controller;
};
