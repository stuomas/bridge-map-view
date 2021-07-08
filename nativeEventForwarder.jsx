// Start-up script to forward native Bridge events as CSXS events to the CEP extension
 
#target bridge

if (!ExternalObject.AdobeXMPScript) {
  ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript')
}

if (!ExternalObject.PlugPlugExternalObject) {
  ExternalObject.PlugPlugExternalObject = new ExternalObject('lib:PlugPlugExternalObject')
}

if (BridgeTalk.appName == 'bridge') {
  app.eventHandlers.push( { handler: selectionsChanged } )
  app.eventHandlers.push( { handler: preferencesChanged } )
  app.eventHandlers.push( { handler: mainWindowSelected } )

  function selectionsChanged(event) {
    if (event.object instanceof Document && event.type === 'selectionsChanged') {
      var eventObj = new CSXSEvent()
      eventObj.type = "selectionsChanged"
      eventObj.data = app.document.selectionLength
      eventObj.dispatch()
      return { handled: false }
    }
  }
  function preferencesChanged(event) {
    if (event.object instanceof PreferencesDialog && event.type === 'ok') {
      var eventObj = new CSXSEvent()
      eventObj.type = "preferencesChanged"
      eventObj.data = app.preferences.ColorTheme
      eventObj.dispatch()
      return { handled: false }
    }
  }
  function mainWindowSelected(event) {
    if (event.object instanceof Document && event.type === 'select') {
      var eventObj = new CSXSEvent()
      eventObj.type = "mainWindowSelected"
      eventObj.data = app.preferences.ColorTheme
      eventObj.dispatch()
      return { handled: false }
    }
  }
}
