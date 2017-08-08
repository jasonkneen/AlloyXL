Alloy.createController = function(name, args) {

    // create instance to the controller and view
    var controller = new(require("alloy/controllers/" + name))(args);

    // check if we have a view and not just <Alloy/>
    if (Object.keys(controller.__views).length > 0) {
        var view = controller.getView();

        // initialise Alloy.Controllers
        Alloy.Controllers = Alloy.Controllers || {};

        // handles opening controllers in folders e.g. screens/login
        var path = name.split("/");

        // if we have a path, set name to the last part (controller name)
        if (path.length > 0) name = path[path.length - 1];

        // Avoid having issues with same controller name within different folders
        if (Alloy.Controllers[name] && ! controller.getView().id) {
            console.warn("::AlloyXL:: The controller Alloy.Controllers." + name + " (" + controller.__controllerPath + ") exists, and will be overwriten because it's conflicting with another controller already instanciated with the same name. " +
            "Please add a unique ID on the top parent view within that controller view so you can use this as the controller name within AlloyXL to avoid this.");
        }

        // No matter what, the ID on the top parent view will always override
        // the controller name driven from its filename.
        if (controller.getView().id) {
            name = controller.getView().id;
        }

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

        if (typeof view.addEventListener == "function") {
            if (typeof view.open == "function") {

                // fire an open event on open
                view.addEventListener("open", function open (e) {
                    view.removeEventListener("open", open);
                    controller.trigger("open", e);
                    if (ENV_DEV) console.log("::AlloyXL:: controller " + name + " was opened");
                });

                // fully clean up the view and controller on close
                view.addEventListener("close", function close(e) {
                    view.removeEventListener("close", close);
                    view = null;
                    Alloy.Controllers[name] = null;
                    delete Alloy.Controllers[name];
                    controller.off();
                    controller.destroy();
                    controller = null;

                    if (ENV_DEV) console.log("::AlloyXL:: Controller " + name + " cleaned up!");
                });

                // fire an open event on open
                view.addEventListener("postlayout", function postlayout(e) {
                    view.removeEventListener("postlayout", postlayout);
                    controller.trigger("postlayout", e);
                    if (ENV_DEV) console.log("::AlloyXL:: controller " + name + " layout finished");
                });

            } else {
                // fire an open event on open
                view.addEventListener("postlayout", function postlayout(e) {
                    view.removeEventListener("postlayout", postlayout);
                    controller.trigger("postlayout", e);
                    if (ENV_DEV) console.log("::AlloyXL:: controller " + name + " layout finished");
                });
            }
        }
    }

    return controller;
};
