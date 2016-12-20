angular.module('app').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('de', {"<a ui-sref=\"input\">Select files to geolocate</a> by querying a category or inputting a list of <code>File:</code>s.":"<a ui-sref=\"input\">Dateien zum Georeferenzieren auswählen</a> via Kategorie oder <code>Datei:</code>-Liste.","About":"Über","About locator-tool":"Über locator-tool","Add <lt-location lat-lng=\"$ctrl.mapMarker\"></lt-location>":"<lt-location lat-lng=\"$ctrl.mapMarker\"></lt-location> einfügen","Also show geolocated files":"Auch georeferenzierte Dateien anzeigen","Category":"Kategorie","Edits using locator-tool":"Bearbeitungen mit locator-tool","Existing coordinates":"Existierende Koordinaten","Failed to save <lt-location></lt-location>!":"<lt-location></lt-location> konnte nicht gespeichert werden!","Fetch files for Category":"Dateien der Kategorie laden","Fetch files for User":"Dateien des Benutzers laden","Files":"Dateien","From the list of files provided, select one and click its location on an interactive map.":"Eine Datei in der Dateiliste auswählen und deren Position durch Klick auf die interaktive Karte auswählen.","Geolocate files":"Dateien georeferenzieren","Geolocate {{$ctrl.titleList.length}} files":"{{$ctrl.titleList.length}} Dateien georeferenzieren","Its source code is available on <a href=\"https://github.com/simon04/locator-tool\">GitHub</a> and <a href=\"https://www.gnu.org/licenses/gpl.html\">GPL v3</a> licensed.":"Der Quellcode ist auf <a href=\"https://github.com/simon04/locator-tool\">GitHub</a> verfügbar steht unter der Lizenz <a href=\"https://www.gnu.org/licenses/gpl.html\">GPL v3</a>.","Log in":"Anmelden","Log in using the button on the upper right corner":"Anmelden mittels Button im rechten oberen Eck","Log out":"Abmelden","Logged in as {{$ctrl.user}}":"Angemeldet als {{$ctrl.user}}","New coordinates":"Neue Koordinaten","Repeat …":"Wiederhole …","Select files to geolocate":"Dateien zum Georeferenzieren auswählen","This tool has been created by <a href=\"https://github.com/simon04/\">simon04</a>.":"Dieses Werkzeug wurde von <a href=\"https://github.com/simon04/\">simon04</a> entwickelt.","This tool helps to add <lt-location></lt-location> information to images on <a href=\"https://commons.wikimedia.org/\">Wikimedia Commons</a>.":"Dieses Werkzeug hilft <lt-location></lt-location> zu bestehenden Dateien auf <a href=\"https://commons.wikimedia.org/\">Wikimedia Commons</a> hinzuzufügen.","Translate":"Übersetzen","Translate locator-tool on Transifex":"Übersetze locator-tool auf Transifex","Tutorial":"Einführung","Usage":"Verwendung","User":"Benutzer","locator-tool":"locator-tool","→ <a href=\"https://commons.wikimedia.org/wiki/Commons:Locator-tool\">Commons:Locator-tool</a>":"→ <a href=\"https://commons.wikimedia.org/wiki/Commons:Locator-tool\">Commons:Locator-tool</a>"});
/* jshint +W100 */
}]);