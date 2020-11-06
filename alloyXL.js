Alloy.createController = function (name, args) {
  try {

    function cleanUpController(controller) {
      Alloy.Controllers[controller.id] = null;

      if (controller.__views) {
        _.each(controller.__views, function (value) {
          cleanUpController(value);
        });
      }

      if (controller.__iamalloy) {
        controller.off();
        controller.destroy();
      }

      controller = null;
    }

    var controller = new(require("alloy/controllers/" + name))(args);

    if (Object.keys(controller.__views).length > 0) {
      var view = controller.getView();

      Alloy.Controllers = Alloy.Controllers || {};

      var path = name.split("/");

      if (path.length > 0) name = path[path.length - 1];

      if (Alloy.Controllers[name] && !controller.getView().id) {
        console.warn("::AlloyXL:: The controller Alloy.Controllers." + name + " (" + controller.__controllerPath + ") exists, and will be overwriten because it's conflicting with another controller already instanciated with the same name. Please add a unique ID on the top parent view within that controller view so you can use this as the controller name within AlloyXL to avoid this.");
      }

      if (controller.getView().id) {
        name = controller.getView().id;
      }

      Alloy.Controllers[name] = controller;

      controller.once = function (eventName, callback) {
        controller.on(eventName, function () {
          controller.off(eventName);
          callback();
        });
        return controller;
      };

      if (typeof view.addEventListener === "function") {
        if (typeof view.open === "function") {
          view.addEventListener("open", function open(e) {
            view.removeEventListener("open", open);
            controller.trigger("open", e);
            if (true) console.log("::AlloyXL:: controller " + name + " was opened");
          });

          view.addEventListener("close", function close() {
            view.removeEventListener("close", close);
            view = null;

            cleanUpController(controller);

            controller = null;

            if (true) console.log("::AlloyXL:: Controller " + name + " cleaned up!");
          });

          view.addEventListener("postlayout", function postlayout(e) {
            view.removeEventListener("postlayout", postlayout);
            controller.trigger("postlayout", e);
            if (true) console.log("::AlloyXL:: controller " + name + " layout finished");
          });
        } else {
          view.addEventListener("postlayout", function postlayout(e) {
            view.removeEventListener("postlayout", postlayout);
            controller.trigger("postlayout", e);
            if (true) console.log("::AlloyXL:: controller " + name + " layout finished");
          });
        }
      }
    }

    return controller;

  } catch (error) {
    throw error.toJSON();
  }
};