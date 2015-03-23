/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.View = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'View' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Light theme

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Light theme' );
	option.onClick( function () {

		editor.setTheme( 'css/light.css' );
		editor.config.setKey( 'theme', 'css/light.css' );

	} );
	options.add( option );

	// Dark theme

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Dark theme' );
	option.onClick( function () {

		editor.setTheme( 'css/dark.css' );
		editor.config.setKey( 'theme', 'css/dark.css' );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// fullscreen

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Fullscreen' );
	option.onClick( function () {

		var element = document.body;

		if ( element.requestFullscreen ) {

			element.requestFullscreen();

		} else if ( element.mozRequestFullScreen ) {

			element.mozRequestFullScreen();

		} else if ( element.webkitRequestFullscreen ) {

			element.webkitRequestFullscreen();

		} else if ( element.msRequestFullscreen ) {

			element.msRequestFullscreen();

		}

	} );
	options.add( option );

	return container;

};
