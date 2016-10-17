var selection = {
	len: 0,
	getText : function(event) {
		var txt = '';
		if(txt = window.getSelection){ // Not IE, 
			var reg = /^([a-z-]+)$/i;
			var regS = /\n/g;///^([\s]+)$/i;
			txt = window.getSelection().toString();
			txt = txt.replace(regS,' ');
			txt = txt.split(' ');
			if(txt.length > 1 && !txt[0]) txt = txt[1];
			else txt = txt[0];
			if(!txt || txt == ' ') return false;
			var sel = window.getSelection(), range;
            range = sel.getRangeAt(0);
			var startRangeNode = range.startContainer;
			var startIndx = range.startOffset;
			var nextNode;
			if(startRangeNode.nodeValue.length != startIndx && (!startRangeNode.nodeValue[startIndx] || !reg.test(startRangeNode.nodeValue[startIndx]))){
				for(var i = startIndx; i < (range.startOffset + range.endOffset); i++){
					if(startRangeNode.nodeValue[startIndx] == 'undefined' || !startRangeNode.nodeValue[startIndx] || !reg.test(startRangeNode.nodeValue[startIndx])){
						startIndx++;
					}
					else break;
					if(startRangeNode.nodeValue.length == startIndx){
						break;
					}
				}
			}
			if(startRangeNode.nodeValue.length == startIndx && (!startRangeNode.nodeValue[startIndx] || !reg.test(startRangeNode.nodeValue[startIndx]))){
				if(startRangeNode == range.endContainer) return false;
				else{
					if(startRangeNode.parentNode.nextSibling){
						nextNode = startRangeNode.parentNode.nextSibling.nextSibling.childNodes[0];//.nextSibling;//.nextSibling;//.childNodes;
						startRangeNode = nextNode;
						startIndx = 4;
						txt = startRangeNode.nodeValue.split(' ');
						for(var k in txt){
							if(txt[k] && !regS.test(txt[k]) && txt[k] != 'undefined'){
								txt = txt[k]; break;
							}
						}
					}
					else
						return false;
				}
			}
			txt = checkEndWord(txt);
			var checkWord = checkStartWord(startRangeNode.nodeValue,startIndx,txt);
			startIndx = checkWord.startIndx;
			txt = checkWord.txt;

			var rng = document.createRange();
			rng.setStart(startRangeNode, startIndx);
			rng.setEnd(startRangeNode, startIndx + txt.length);
			sel.removeAllRanges();
                sel.addRange(rng);
			createTrBlock.create(event,txt);
			
		}
		else{ // IE,
			txt = document.selection.createRange().text.split(' ');
			if(txt.length > 1 && !txt[0]) txt = txt[1];
			else txt = txt[0];
			if(!txt || txt == ' ') return false;
		}
		return txt;
	}
}
var checkStartWord = function(startRangeNode,startIndx,txt){
	var reg = /^([a-z-]+)$/i;
	if(!reg.test(startRangeNode[startIndx])){
		txt = txt.slice(1,0);
		startIndx++;
		return checkStartWord(startRangeNode,startIndx,txt);
	}
	else if(startIndx && reg.test(startRangeNode[startIndx - 1]) && startRangeNode[startIndx - 1] != 'undefined'){
		txt = startRangeNode[startIndx - 1] + txt;
		startIndx--;
		return checkStartWord(startRangeNode,startIndx,txt);
	}
	else if(reg.test(startRangeNode[startIndx + txt.length])){
		txt += startRangeNode[startIndx + txt.length];
		return checkStartWord(startRangeNode,startIndx,txt);
	}
	else{
		return {startIndx: startIndx, txt: txt};
	}
}

var checkEndWord = function(word){
	var reg = /^([a-z-]+)$/i;
	if(!reg.test(word[word.length-1])){
		word = word.slice(0, -1);
		return checkEndWord(word);
	}
	else
		return word;
}

var getSelectionCoords = function(){
    var sel = document.selection, range;
    var x = 0, y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                var rect = range.getClientRects()[0];
                x = rect.left;
                y = rect.top;
				h = rect.height;
            }
        }
    }
    return { x: x, y: y , h: h};
}


var logger = function(txt){
	txt && (vote(txt));
}

function getXmlHttp(){
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}

function vote(elem,word) {
	var req = getXmlHttp();
	
	req.onreadystatechange = function(){

		if (req.readyState == 4){

			if(req.status == 200){
					var res = JSON.parse(req.responseText);
				if(res){
					var meanings = res.meanings;
					var arImg = [];
					var ul = document.getElementById('translate-list'), li;
					for(var k in meanings){
						arImg[k] = new Image();
						arImg[k].src = meanings[k]['image_url'];
						arImg[k].id = 'tr-img' + k;
						li = document.createElement('li');
						document.getElementById('translate-list').appendChild(li);
						li.innerHTML = meanings[k]['translation'];
						li.src_img = meanings[k]['image_url'];
						li.addEventListener('mouseover',function(){
							document.getElementById('tr-img0').src = this.src_img;
							this.style['font-size'] = '20px';
						},false);
						li.addEventListener('mouseout',function(){
							this.style['font-size'] = '16px';
						},false);
					}
					document.getElementById('translate-img').appendChild(arImg[0]);
				}
				else{
					var li = document.createElement('li');
					document.getElementById('translate-list').appendChild(li);
					li.innerHTML = 'No translate.';
				}
				var coordsSl = getSelectionCoords(),
					d = document.getElementById('translate-block'),
					w = document.documentElement.clientWidth,
					h = document.documentElement.clientHeight,
					coords = d.getBoundingClientRect(),
					scrolled = window.pageYOffset || document.documentElement.scrollTop;
				if(d.offsetWidth + coords.left > w){
					d.style.left = d.offsetLeft - (d.offsetWidth + coords.left - w + 10) + 'px';
				}
				if(d.offsetHeight + coords.top > h){
					if((d.offsetTop - (d.offsetHeight + coordsSl.h + 15)) - scrolled >= 0){
						d.style.top = d.offsetTop - (d.offsetHeight + coordsSl.h + 15) + 'px';
					}
				}
			}
			// тут можно добавить else с обработкой ошибок запроса
		}

	}

       // (3) задать адрес подключения
	req.open('GET', '/staff/translate.php?word='+word, true);  

	// объект запроса подготовлен: указан адрес и создана функция onreadystatechange
	// для обработки ответа сервера
	 
        // (4)
	req.send(null);  // отослать запрос
}

var createTrBlock = {
	create: function(event,txt){
		var event = event || window.event;

		var d = document.createElement('div'),
			elem_img = document.createElement('div'),
			title = document.createElement('div'),
			ul = document.createElement('ul'),
			box = document.getElementsByTagName('div')[0];//.getElementById('word'),
			coordsSl = getSelectionCoords();
		d.className = 'translate-block';
		d.id = 'translate-block';
		d.style.left = (coordsSl.x - box.offsetLeft) + 'px';
		var scrolled = window.pageYOffset || document.documentElement.scrollTop;
		d.style.top = (coordsSl.y - box.offsetTop + coordsSl.h + 10 + scrolled) + 'px';
		box.appendChild(d);
		elem_img.className = 'translate-img';
		title.className = 'translate-title';
		ul.className = 'translate-list';
		elem_img.id = 'translate-img';
		title.id = 'translate-title';
		ul.id = 'translate-list';
		d.appendChild(elem_img);
		d.appendChild(title);
		d.appendChild(ul);
		document.getElementById('translate-title').innerHTML = txt;
		vote(d,txt);
		this.on = true;
	},
	on:false,
	remove: function(){
		this.on = false;
		var box = document.getElementsByTagName('div')[0];
		var d = document.getElementById('translate-block');
		d && box.removeChild(d);
	}
}

window.onload=function(){
	var block = document;
	if(block.addEventListener) {
		block.addEventListener("mouseup", function(event){
			createTrBlock.remove();
			selection.getText(event);
		}, false);
		block.addEventListener("mousedown", function(event){
			var d = document.getElementById('translate-block');
			createTrBlock.remove();
			for(var k in event.path){
				if(event.path[k] == d) {selection.getText(event);}
				
			}
			if(event.target == d) {selection.getText(event);}
		}, false);
	}
	else{
		block.attachEvent("onmouseup", function(){logger(selection.getText());});
	}
}















