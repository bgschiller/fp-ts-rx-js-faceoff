# Recalculate Geometry

Write a function that accepts an `HTMLTextArea` and a `Document`-like object. When any of the following happen, the function should log "geometryWillChange":

- the textarea emits a `change` event.
- the textarea emits a `scroll` event (a scroll within the textarea).
- the textarea emits a `resize` event (a resize of the textarea).
- the document emits a `resize` event (a resize of the window).
- the document emits a `scroll` event (a scroll within the window).

Several events may be emitted in quick succession. The function should only log "geometryWillChange" at the start of a sequence of events, and not again until 200ms pass without any events. At that point, the function should log "geometryDidChange".
