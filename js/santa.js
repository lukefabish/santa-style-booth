// 'Constants'
var DEBUG = true;
var CLASS_SELECTED = "selected";
var CLASS_DRAGGABLE = "draggable";
var CLASS_DRAGGING = "dragging";
var CLASS_SCALEHANDLE = "scale-handle";
var CLASS_SCALING = "scaling";

var FRAME_DIV = "santa-frame";

var NAV_HAT = "hatnav";
var NAV_BEARD = "beardnav";
var NAV_MOUSTACHE = "moustachenav";
var NAV_BROWS = "browsnav";
var NAV_FRAME = "framenav";

var HAT = "hat";
var IMG_HAT = "hat-img";

var BEARD = "beard";
var IMG_BEARD = "beard-img";

var MOUSTACHE = "moustache";
var IMG_MOUSTACHE = "moustache-img";

var LBROW = "lbrow";
var IMG_LBROW = "lbrow-img";

var RBROW = "rbrow";
var IMG_RBROW = "rbrow-img";

var LCHEEK = "lcheek";
var IMG_LCHEEK = "lcheek-img";

var RCHEEK = "rcheek";
var IMG_RCHEEK = "rcheek-img";

var NOSE = "nose";
var IMG_NOSE = "nose-img";

var IMG_FRAME = "frame-img";

// Image arrays elements are in the format [file,width,height]
var hatImages = [["images/hat.png",249,179], ["images/hunt-cap.png",249,178], ["images/beanie-hat.png",269,358]]
var hatNavImages = ["images/navhat.png", "images/nav-hunt-cap.png", "images/nav-beanie-hat.png"]
var hatIdx = 0;

var beardImages = [["images/beard.png",246,177], ["images/goatee.png",56,117], ["images/norse-beard.png",226,247]]
var beardNavImages = [["images/navbeard.png",77,60], ["images/nav-goatee.png",29,60], ["images/nav-norse-beard.png",77,60]]
var beardIdx = 0;

var moustacheImages = [["images/moustache.png",213,51], ["images/walrus-mo.png",143,41], ["images/dali-mo.png",200,110]]
var moustacheNavImages = ["images/navmoustache.png", "images/nav-walrus-mo.png", "images/nav-dali-mo.png"]
var moustacheIdx = 0;

var lbrowImages = [["images/lbrow.png",123,45], ["images/monobrow.png",219,45], ["images/lmadbrow.png",109,48]]
var browsNavImages = ["images/naveyebrows.png", "images/nav-monobrow.png", "images/nav-madbrow.png"]
var browsIdx = 0;

// browsNavImages and browsIdx work for lbrows and rbrows
var rbrowImages = [["images/rbrow.png",123,45], ["images/monobrow.png",0,0], ["images/rmadbrow.png",109,48]]

var frameImages = [["images/tree.png",361,482], ["images/mistletoe.png",360,480], ["images/ribbon.png",361,448]]
var frameNavImages = ["images/nav-tree.png", "images/nav-mistletoe.png", "images/nav-ribbon.png"]
var frameIdx = 0;

var localMediaStream = null;
var faceVideo;
var drag;
var wasDragging = false;
var dontDeselect = false;

window.addEventListener("DOMContentLoaded", function() {
	setHatImage();
	setBeardImage();
	setMoustacheImage();
	setBrowsImage();
	setFrameImage();
});

function activateCamera(e) {
	faceVideo = document.querySelector('#santa-video');
	var canvas = document.querySelector('#santa-canvas');

	var ctx = canvas.getContext('2d');
	localMediaStream = null;

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
														navigator.mozGetUserMedia || navigator.msGetUserMedia ||
														navigator.oGetUserMedia;

  if (navigator.getUserMedia) {
	    navigator.getUserMedia({audio: false, video: true}, handleVideo, videoError);
	}

	showVideoBooth();
	stopEventPropagation(e);

	document.onclick = getSnap;
}

function stopEventPropagation(e){
	debugMsg("stopEventPropagation starting");
	if(!isInitialised(e)){
		debugMsg("evt wasn't passed in");
		e = window.event;
	}

	if(!isInitialised(e)){
		debugMsg("evt still not initialised");
	}

	if( e.stopPropagation){
		debugMsg("evt has stopPropagation");
		e.stopPropagation();
	} else {
		debugMsg("cancelBubble instead");
		e.cancelBubble = true;
	}

	debugMsg("stopEventPropagaion done");
}

function showVideoBooth(){
	// Gloal faceVideo
	showElement(faceVideo);
	hideElement(eleById("getpic"));
	showElement(eleById("faceguide"));
}

function handleVideo(stream) {
  faceVideo.src = window.URL.createObjectURL(stream);
  localMediaStream = stream;
}

function videoError(e) {
  debugMsg('video error: ', e);
}

function takeAnotherPic(){
	location.reload();
}

function debugMsg(str){
	if( DEBUG ){
		console.debug(str);
	}
}

function eleById(elementId){
	return document.getElementById(elementId);
}

///////////////////////////////////////////////////////////////////////////////////
//                           Element Classes
function removeClassStr(classStr, className){

	// shouldn't happen
	if( classStr == undefined || className == undefined ) { return undefined };

	var startPos = classStr.indexOf(className);
	if( startPos == -1 ){ return classStr };

	var clNameLen = className.length;

	var halfOne = classStr.substring(0, startPos);
	var halfTwo = classStr.substring(startPos+clNameLen);

	return halfOne + ' ' + halfTwo;
}

function removeClass(element, className){
	if( element == undefined ){ return };
	if( className == undefined ){ return };

	var classStr = element.getAttribute("class");
	if( classStr == undefined ){
		classStr = "";
	}

	element.setAttribute("class", removeClassStr(classStr, className));
}

function addClass(element, className){
	if( element === undefined ){ return };
	if( className === undefined ){ return };

	var classStr = element.getAttribute("class");
	if( classStr == undefined ){
		element.setAttribute("class", className);
	}
	else {
		element.setAttribute("class", classStr + ' ' + className);
	}
}

function notDraggable(targ){
	return notClass(targ, CLASS_DRAGGABLE) && notClass(targ, CLASS_SCALEHANDLE);
}

function notDragging(targ){
	return notClass(targ, CLASS_DRAGGING);
}

function notSelected (targ){
	return notClass(targ, CLASS_SELECTED);
}

function notClass (elem, className){

	var elemClasses = elem.getAttribute("class");

	if( elemClasses ==  undefined ) { return true };
	if( elemClasses.indexOf(className) == -1 ){ return  true };

	return false;
}

function hasClass(elem, className){
	return !notClass(elem, className);
}

function showElement(element){
	if( isInitialised(element) ){
		element.style.display = "block";
	}
}

function hideElement(element){
	if( isInitialised(element) ){
		element.style.display = "none";
	}
}

function isInitialised( thing ){
	return ( typeof thing !== 'undefined' && thing !== null );
}

///////////////////////////////////////////////////////////////////////////////////
//                         Drawing/Saving Canvas
function getSnap(){
	debugMsg("getSnap() called");

	var	canvas = eleById("santa-canvas"),
			context = canvas.getContext("2d"),
			rnav = eleById("rnav"),
			lnav = eleById("lnav"),
			faceguide = eleById("faceguide");

	turnOffVideo();

	context.drawImage(faceVideo, 140, 0, 360, 480, 0, 0, 360, 480);

	// Show the nav & snapshot, and hide the video stuff
	rnav.style.opacity = 1;
	lnav.style.opacity = 1;
	showElement(canvas);
	hideElement(faceVideo);
	hideElement(faceguide);

	// Set up events for interaction. Other event handling is taken care of
	// by element onClick handlers in HTML.
	document.onclick = undefined;
	document.onmousedown = startDrag;
	document.onmouseup = stopDrag;

	var save = eleById("save");
	save.addEventListener('click', saveFile, false);
}

function turnOffVideo(){
	// pause() because Chrome will otherwise give us the final video frame, which
	// is always 100% black. FF occasionally returns a black frame.
	faceVideo.pause();
	var trackZero = localMediaStream.getTracks()[0]
	trackZero.stop();
}

function onFileSelected(event) {
	var selectedFile = event.target.files[0];
	var reader = new FileReader();

	var imgtag = eleById("upload-img");
	imgtag.title = selectedFile.name;

	reader.onload = function(event) {
		imgtag.src = event.target.result;
	};

	reader.readAsDataURL(selectedFile);

	showElement(imgtag);
}

function saveFile(){
	writeImage();

	var canvas = eleById("santa-canvas");
	var dt = canvas.toDataURL('image/jpeg');
	var save = eleById("save");
	save.href = dt;
}

function writeImage(){

	var canvas = eleById("santa-canvas"),
			context = canvas.getContext("2d"),
			lcheek = eleById(LCHEEK),
			lcheekImg = eleById(IMG_LCHEEK),
			rcheek = eleById(RCHEEK),
			rcheekImg = eleById(IMG_RCHEEK),
			nose = eleById(NOSE),
			noseImg = eleById(IMG_NOSE),
			moustache = eleById(MOUSTACHE),
			moustacheImg = eleById(IMG_MOUSTACHE),
			beard = eleById(BEARD),
			beardImg = eleById(IMG_BEARD),
			hat = eleById(HAT),
			hatImg = eleById(IMG_HAT),
			lbrow = eleById(LBROW),
			lbrowImg = eleById(IMG_LBROW),
			rbrow = eleById(RBROW);
			rbrowImg = eleById(IMG_RBROW);
			frameImg = eleById(IMG_FRAME);

	if( isDisplaying(beard) ){
		//Executing context.drawImage in a subroutine fails silently for reasons
		//unknown.
		//drawToContext(context, beardImg, beard);
		context.drawImage(
					beardImg,
					beard.offsetLeft,
					beard.offsetTop,
					beardImg.width,
					beardImg.height);

		hideElement(beard);
	}

	if( isDisplaying(lcheek) ){
		context.drawImage(
					lcheekImg,
					lcheek.offsetLeft,
					lcheek.offsetTop,
					lcheekImg.width,
					lcheekImg.height);

		hideElement(lcheek);
	}


	if( isDisplaying(rcheek) ){
		context.drawImage(
					rcheekImg,
					rcheek.offsetLeft,
					rcheek.offsetTop,
					rcheekImg.width,
					rcheekImg.height);

		hideElement(rcheek);
	}

	if( isDisplaying(nose) ){
		context.drawImage(
					noseImg,
					nose.offsetLeft,
					nose.offsetTop,
					noseImg.width,
					noseImg.height);

		hideElement(nose);
	}

	if( isDisplaying(moustache) ){
		context.drawImage(
					moustacheImg,
					moustache.offsetLeft,
					moustache.offsetTop,
					moustacheImg.width,
					moustacheImg.height);

		hideElement(moustache);
	}

	if( isDisplaying(hat) ){
		context.drawImage(
					hatImg,
					hat.offsetLeft,
					hat.offsetTop,
					hatImg.width,
					hatImg.height);

		hideElement(hat);
	}

	if( isDisplaying(lbrow) ){
		context.drawImage(
					lbrowImg,
					lbrow.offsetLeft,
					lbrow.offsetTop,
					lbrowImg.width,
					lbrowImg.height);

		hideElement(lbrow);
	}

	if( isDisplaying(rbrow) ){
		context.drawImage(
					rbrowImg,
					rbrow.offsetLeft,
					rbrow.offsetTop,
					rbrowImg.width,
					rbrowImg.height);

		hideElement(rbrow);
	}

	if( isDisplaying(frameImg) ){
		context.drawImage(
					frameImg,
					frameImg.offsetLeft,
					frameImg.offsetTop,
					frameImg.width,
					frameImg.height);

		hideElement(frameImg);
	}
}

function drawToContext(context, imgEle, imgDiv){
		debugMsg("drawToContext()");

		context.drawImage(
					imgEle,
					imgDiv.offsetLeft,
					imgDiv.offsetTop,
					imgDiv.width,
					imgDiv.height);

		debugMsg("drawToContext done");
}

function isDisplaying(element) {
	return ( element.style.display !== "" && element.style.display !== "none" )
}

///////////////////////////////////////////////////////////////////////////////////
//                         Facial features

function cycleIdx(idx, items){

	if( idx >= items.length ){
		idx = 0;
	}

	if( idx < 0 ) {
		idx = items.length - 1;
	}

	return idx;
}

function setHatImage(){
	var hatNavImg = eleById(NAV_HAT);
	var hatImg = eleById(IMG_HAT);
	var hat = eleById(HAT);

	hatIdx = cycleIdx(hatIdx, hatNavImages);

	hatNavImg.src = hatNavImages[hatIdx];
	hatImg.src = hatImages[hatIdx][0];
	hatImg.width = hatImages[hatIdx][1];
	hatImg.height = hatImages[hatIdx][2];

	hat.style.width = hatImages[hatIdx][1];
	hat.style.height = hatImages[hatIdx][2];
}

function incHat() {
	hatIdx = hatIdx + 1;
	setHatImage();
}

function decHat() {
	hatIdx = hatIdx - 1;
	setHatImage();
}

function setBeardImage(){
	var beardNavImg = eleById(NAV_BEARD);
	var beardImg = eleById(IMG_BEARD);
	var beard = eleById(BEARD);

	beardIdx = cycleIdx(beardIdx, beardNavImages);

	beardNavImg.src = beardNavImages[beardIdx][0];
	beardNavImg.width = beardNavImages[beardIdx][1];
	beardNavImg.height = beardNavImages[beardIdx][2];

	beardImg.src = beardImages[beardIdx][0];
	beardImg.width = beardImages[beardIdx][1];
	beardImg.height = beardImages[beardIdx][2];

	beard.style.width = beardImages[beardIdx][1];
	beard.style.height = beardImages[beardIdx][2];
}

function incBeard() {
	beardIdx = beardIdx + 1;
	setBeardImage();
}

function decBeard() {
	beardIdx = beardIdx - 1;
	setBeardImage();
}

function setMoustacheImage(){
	var moustacheNavImg = eleById(NAV_MOUSTACHE);
	var moustacheImg = eleById(IMG_MOUSTACHE);
	var moustache = eleById(MOUSTACHE);

	moustacheIdx = cycleIdx(moustacheIdx, moustacheNavImages);

	moustacheNavImg.src = moustacheNavImages[moustacheIdx];
	moustacheImg.src = moustacheImages[moustacheIdx][0];
	moustacheImg.width = moustacheImages[moustacheIdx][1];
	moustacheImg.height = moustacheImages[moustacheIdx][2];

	moustache.style.width = moustacheImages[moustacheIdx][1];
	moustache.style.height = moustacheImages[moustacheIdx][2];
}

function incMoustache() {
	moustacheIdx = moustacheIdx + 1;
	setMoustacheImage();
}

function decMoustache() {
	moustacheIdx = moustacheIdx - 1;
	setMoustacheImage();
}

function setBrowsImage(){
	var browsNavImg = eleById(NAV_BROWS);
	var lbrowImg = eleById(IMG_LBROW);
	var lbrow = eleById(LBROW);
	var rbrowImg = eleById(IMG_RBROW);
	var rbrow = eleById(RBROW);

	browsIdx = cycleIdx(browsIdx, browsNavImages);

	browsNavImg.src = browsNavImages[browsIdx];

	lbrowImg.src = lbrowImages[browsIdx][0];
	lbrowImg.width = lbrowImages[browsIdx][1];
	lbrowImg.height = lbrowImages[browsIdx][2];
	lbrow.style.width = lbrowImages[browsIdx][1];
	lbrow.style.height = lbrowImages[browsIdx][2];

	rbrowImg.src = rbrowImages[browsIdx][0];
	rbrowImg.width = rbrowImages[browsIdx][1];
	rbrowImg.height = rbrowImages[browsIdx][2];
	rbrow.style.width = rbrowImages[browsIdx][1];
	rbrow.style.height = rbrowImages[browsIdx][2];
}

function incBrows() {
	browsIdx = browsIdx + 1;
	setBrowsImage();
}

function decBrows() {
	browsIdx = browsIdx - 1;
	setBrowsImage();
}

function setFrameImage(){
	var frameNavImg = eleById(NAV_FRAME);
	var frameImg = eleById(IMG_FRAME);

	frameIdx = cycleIdx(frameIdx, frameNavImages);

	frameNavImg.src = frameNavImages[frameIdx];

	frameImg.src = frameImages[frameIdx][0];
	frameImg.width = frameImages[frameIdx][1];
	frameImg.height = frameImages[frameIdx][2];
}

function lnavWidth(){
	 return parseInt(eleById("lnav").style.width);
}

function incFrame() {
	frameIdx = frameIdx + 1;
	setFrameImage();
}

function decFrame() {
	frameIdx = frameIdx - 1;
	setFrameImage();
}

function toggleBeard(){
	var beard = eleById("beard");
	toggleElementDisplay(beard);
}

function toggleBlush(){
	var lcheek = eleById("lcheek");
	toggleElementDisplay(lcheek);

	var rcheek = eleById("rcheek");
	toggleElementDisplay(rcheek);

	var nose = eleById("nose");
	toggleElementDisplay(nose);
}

function toggleHat(){
	var hat = eleById("hat");
	toggleElementDisplay(hat);
}

function toggleEyebrows(){
	var lbrow = eleById("lbrow");
	var rbrow = eleById("rbrow");
	toggleElementDisplay(lbrow);
	toggleElementDisplay(rbrow);
}

function toggleMoustache(){
	var moustache = eleById("moustache");
	toggleElementDisplay(moustache);
}

function toggleFrame(){
	var frameimg = eleById("frame-img");
	toggleElementDisplay(frameimg);
}

function toggleElementDisplay(element){

	var dispType = element.style.display;

	if( !isInitialised(dispType) || dispType === "" ){
		showElement(element);
		return;
	}

	if( dispType === "none" ){
		showElement(element);
	}
	else {
		hideElement(element);
	}
}

function getSelected(){
	var allSelected = document.getElementsByClassName(CLASS_SELECTED);
	if( allSelected.length == 0 ) { return undefined };

	// There may be more, but that'd be a bug
	return allSelected[0];
}

///////////////////////////////////////////////////////////////////////////////////
//                       Moving/selecting facial hair
function selectDiv(e){

	// Ignore click event arising from a drag
	if(wasDragging){
		wasDragging = false;
		return;
	}

	// determine event object
	if(!e){var e = window.event;}

	// IE uses srcElement, others use target
	var targ = e.target ? e.target : e.srcElement;

	var targClasses = targ.getAttribute("class");
	if( targClasses == undefined ) { return;}

	// Don't select scale handles
	if( hasClass(targ, CLASS_SCALEHANDLE) ){ return };

	if( notSelected(targ) ){

		if( dontDeselect ){
			dontDeselect = false;
			return;
		}

		// Only select draggable items
		if( !notDraggable(targ) ){
			addClass(targ, CLASS_SELECTED);
		}

		// Make sure only one element is selected
		var allSelected = document.getElementsByClassName(CLASS_SELECTED);
		for(var idx=0; idx < allSelected.length; idx++){

			if( allSelected[idx].id != targ.id ){
				removeClass(allSelected[idx], CLASS_DRAGGABLE);
			}
		}
	}
	else {
		var classStr = targ.getAttribute("class");
		targ.setAttribute("class", removeClassStr(classStr, CLASS_SELECTED));
	}
}

function startDrag(e){
	// determine event object
	if(!e){var e = window.event;}

	// IE uses srcElement, others use target
	var targ = e.target ? e.target : e.srcElement;

	if( notDraggable(targ) ) { return };

	if(hasClass(targ, CLASS_SCALEHANDLE)){// For scaling objects
		addClass(targ, CLASS_SCALING);
	}
	else { // For moving objects
		addClass(targ, CLASS_DRAGGING);

		// assign default values for top and left properties
		if(!targ.style.left){
			targ.style.left = targ.offsetLeft;
		};

		if(!targ.style.top){
			targ.style.top = targ.offsetTop;
		};

	}

	// calculate event X, Y coordinates
	offsetX = e.clientX;
	offsetY = e.clientY;

	// calculate integer values for top and left
	// properties
	if(hasClass(targ, CLASS_SCALEHANDLE)){
		coordX = parseInt(targ.parentNode.style.left);
		coordY = parseInt(targ.parentNode.style.top);
	}
	else {
		coordX = parseInt(targ.style.left);
		coordY = parseInt(targ.style.top);
	}

	drag = true;// move div element

	if( hasClass(targ, CLASS_SCALEHANDLE)){
		document.onmousemove = scaleDiv;
	}
	else {
		document.onmousemove = dragDiv;
	}

	e.preventDefault();
	return false;
}

function dragDiv(e){
	if(!drag){return};

	// affects behaviour of 'select'
	wasDragging = true;

	if(!e){ var e = window.event };

	var targ=e.target?e.target:e.srcElement;
	if( notDraggable(targ) ) { return };
	if( notDragging(targ) ) { return };

	debugMsg("Draggin: " + targ.id);

	// move div element
	targ.style.left=coordX+e.clientX-offsetX+'px';
	targ.style.top=coordY+e.clientY-offsetY+'px';

	return false;
}

function scaleDiv(e){
	if(!drag){return};

	wasDragging = true;

	if(!e){ var e = window.event };

	var targ=e.target?e.target:e.srcElement;
	if( !hasClass(targ, CLASS_SCALEHANDLE) ) { return };

	// scale the parent
	var parentTarget = targ.parentNode;
	var parentWidth = parseInt(parentTarget.style.width);
	var parentHeight = parseInt(parentTarget.style.height);

	var deltaX = e.clientX - offsetX;
	var deltaY = e.clientY - offsetY;

	offsetX = e.clientX;
	offsetY = e.clientY;

	// scale
	parentTarget.style.width=(parentWidth + deltaX) +'px';
	parentTarget.style.height=(parentHeight + deltaY) +'px';

	return false;
}

function stopDrag(e){
	if(!e){ var e = window.event };
	var targ=e.target?e.target:e.srcElement;

	if(hasClass(targ, CLASS_SCALEHANDLE)){
		removeClass(targ, CLASS_SCALING);
	}
	else {
		removeClass(targ, CLASS_DRAGGING);
	}

	drag=false;
	wasDraggin = true;
}
