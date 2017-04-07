# AlloyXL

Better controller management and workflow for [Appcelerator](http://www.appcelerator.com) [Titanium](https://github.com/appcelerator/titanium_mobile) [Alloy MVC framework](https://github.com/appcelerator/alloy).

## Why?

I build a lot of apps where I use Alloy MVC. In developing apps I end up requiring some additional functionality when it comes to using controllers for example:

- cleaning up after a controller / view is closed
- knowing when a view is opened / closed and acting on it
- accessing controllers globally across the app
- analytics / logging

### The Old Way

So previously I'd end up writing code to clean up a view / controller within say, a close function associated with hitting back or close button, like this:

```JS
function doClose() {
    $.getView().close();
    $.destroy();
    $.off();
}
```

This is fine when **you** handle the event of closing a controller / view -- but if you're using say, a Navigation Window or TabGroup and you're using the default behavoir of the back button, then this code wouldn't run. You'd have to associate code with the "close" event on the Window. 

_(All of this led to lots of templated code in controllers, repeative code and could end up with some views being closed outside of the code I was writing and so the clean up wouldn't happen.)_

## A New Way - Using AlloyXL

The idea behind AlloyXL was to tackle this at the source, by overriding the **Alloy.createController** method, I could do all this at source, ensuring that every controller is created in the same way, without changing any other code.

The main things I wanted to achieve with AlloyXL were:-

* Providing open / close events on Window views
* Cleaning up memory after a controller is closed
* Reduce code throughout the app
* Allow access to controllers globally like Alloy.Collections

## Quick Start

* [Install from NPM the latest version](https://www.npmjs.com/package/alloyxl)
or
* [Download the latest version](https://github.com/jasonkneen/AlloyXL) and place in your project (lib folder for Alloy).

Wherever you want to initialise the API interface, put this (ideally this should go in your **alloy.js** file):-

```javascript
require("alloyXL");
```
*(note you don't have to assign it to a variable)*

Once done, AlloyXL will automatically override the **Alloy.createController** method adding the following:

- open and close events for Windows / Navigation Windows and TabGroups
- a "once" event handler
- global access to the controller from **Alloy.Controllers.name_of_controller**
- model / collection, event and pointer clean up on close

So, you can do something like this:

_(where the view we're in is a Navigation Window or TabGroup and "subview" is a Window)_

```javascript
$.getView().openWindow(Alloy.createController("subview").on("open", function(){
    Alloy.Controllers.subview.getView().setBackgroundColor("#F00");
}).getView());
```
In this example, without creating any local pointers to the controller or view, we're responding to the open event on the window, and setting the background color of the view to red.

You can also combine this with Alloy event chaning:

```javascript
$.getView().openWindow(Alloy.createController("subview").on("open", function(){
    Alloy.Controllers.subview.getView().setBackgroundColor("red");
}).on("anotherEvent", function(){
    // handle the anotherEvent here
}).once("oneTime", function(){
    // this event will only ever fire once
}).getView());
```

Because AlloyXL is intercepting and overriding the **Alloy.createController** method, it's able to do all this at the source, ensuring that everything is cleaned up afterwards!

## Same name controllers conflicts

The **Alloy.Controllers** object stores the *last* instance to a controller -- so normally, if you're creating controllers with different names it's all fine -- however if you create two instances to a controller at once, only the *last* one is in **Alloy.Controllers**.

If you have two controllers having the same names but located in different folders (`app/controllers/registration/index.js` and `app/controllers/home/index.js` for example), this will cause a conflict within AlloyXL.

However, you can avoid this issue by either using different and unique names for all of your controllers **or** by using a unique ID on the top parent `<NavigationWindow>`, `<Window>` or `<View>` within your controllers and use it as the controller name within AlloyXL:

File: `app/views/registration/index.xml`
```xml
<Alloy>
    <View id="myUniqueID">
    </View>
</Alloy>
```

```javascript
// Now access the controller using
Alloy.Controllers.myUniqueID;
// instead of
Alloy.Controllers.index;
```

### Taking the advantage of overriding controllers 

By applying the above, you can easily override a controller already instanciated within `Alloy.Controllers`, no matter what.

This is very useful for `<NavigationWindow>` if you want to re-use the same "ID" or controller name accross your project. Here is a simple example:

File: `app/views/login.xml` Login screen
```xml
<Alloy>
    <NavigationWindow id="navigationWindow">
    ...
    </NavigationWindow>
</Alloy>
```

File: `app/views/home.xml` Home screen once connected
```xml
<Alloy>
    <NavigationWindow id="navigationWindow">
    ...
    </NavigationWindow>
</Alloy>
```

File: `app/views/welcome.xml` Welcome window displayed no matter if you're logged in or not
```xml
<Alloy>
    <Window>
    ...
    </Window>
</Alloy>
```

```javascript
// This will work no matter if the controller used is login or home.
Alloy.Controllers.navigationWindow.getView().openWindow(
    Alloy.createController("welcome").getView()
);
```

## License

<pre>
Copyright 2017 Jason Kneen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
