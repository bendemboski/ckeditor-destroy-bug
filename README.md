This repository demonstrates an error thrown from CKEditor5's collaborative annotations plugin.

To reproduce:

1. `yarn build` or `npm build` this repository
2. Open `sample/index.html` in a browser. Make sure the browser window has focus.
3. Open the devtools and observe this error in the console:

```
ckeditorerror.js:66 Uncaught TypeError: Cannot read property '_source' of undefined
    at new Rect (rect.js:63)
    at a.l (annotations.js:23)
    at a.h (annotations.js:23)
    at a.<computed>.Object.leading (annotations.js:23)
    at invokeFunc (debounce.js:95)
    at a.debounced [as _throttledOrderUpdate] (debounce.js:178)
    at a.refresh (annotations.js:23)
    at InlineEditorUI.<anonymous> (editorannotations.js:23)
    at InlineEditorUI.fire (emittermixin.js:209)
    at InlineEditorUI.update (editorui.js:94)
    at Document.<anonymous> (editorui.js:65)
    at Document.fire (emittermixin.js:209)
    at View.<anonymous> (view.js:193)
    at View.fire (emittermixin.js:209)
    at View.change (view.js:482)
    at update (editableuiview.js:133)
    at InlineEditableUIView._updateIsFocusedClasses (editableuiview.js:129)
    at InlineEditableUIView.<anonymous> (editableuiview.js:102)
    at InlineEditableUIView.fire (emittermixin.js:209)
    at InlineEditableUIView.set [as isFocused] (observablemixin.js:92)
    at updateBoundObservableProperty (observablemixin.js:637)
    at observablemixin.js:664
    at Set.forEach (<anonymous>)
    at FocusTracker.<anonymous> (observablemixin.js:663)
    at FocusTracker.fire (emittermixin.js:209)
    at FocusTracker.set [as isFocused] (observablemixin.js:92)
    at FocusTracker._focus (focustracker.js:121)
    at ProxyEmitter.listenTo.useCapture (focustracker.js:81)
    at ProxyEmitter.fire (emittermixin.js:209)
    at HTMLDivElement.domListener (emittermixin.js:235)
    at main (main.js:150)
```

This is exploiting the fact that there is a window of time when the inline editor has detached its editing view, but has not destroyed its plugins. Here is the sequencing:

1. `InlineEditor.destroy()` is called
2. It [calls destroy()](https://github.com/ckeditor/ckeditor5-editor-inline/blob/169c206ac6147dbc4aa13f2b7ce2131ff8580140/src/inlineeditor.js#L98) on its `InlineEditorUI`, which [detaches](https://github.com/ckeditor/ckeditor5-editor-inline/blob/169c206ac6147dbc4aa13f2b7ce2131ff8580140/src/inlineeditorui.js#L108) its editing view's DOM root
3. It calls the super-class `Editor.destroy()` method, which [yields](https://github.com/ckeditor/ckeditor5-core/blob/b7ba80f6976c88e1c212328f0fb77b2da51dc3da/src/editor/editor.js#L259) without destroying its plugins
4. Until the promise resolves, the suggestions plugin is not destroyed, so all of its suggestions and related views are still loaded in the Annotations context plugin, and if anything causes them to re-render, they won't be able to find their view-to-DOM mappings because they were torn down in step (2).
5. The promise resolves and `Editor.destroy()` [destroys its plugins](https://github.com/ckeditor/ckeditor5-core/blob/b7ba80f6976c88e1c212328f0fb77b2da51dc3da/src/editor/editor.js#L264)

During step (4) there may be any number of ways of causing the Annotations context plugin to re-render all of its views, including the ones relying on the already-detached DOM root of the editor that is in the process of being destroyed. The one that I found is to focus (or blur) a different editor at just the right time in the annotations plugin's debounce cycle that the debounced call to the `at a.h (annotations.js:23)` stack frame happens synchronously.